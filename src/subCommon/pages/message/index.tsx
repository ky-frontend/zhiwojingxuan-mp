import { observer, inject } from 'mobx-react';
import { CustomEventIdEnum } from '@/types/im.type';
import { notificationApi, userApi } from '@/services';
import { IdentityTagsEnum, NotificationUserType } from '@ky-middleground/user-type';
import {
  CounsellingDoctorServiceStatusEnum,
  CounsellingDoctorWorkStatusEnum,
} from '@ky-client/counselling-type';
import storage from '@/modules/utils/storage';
import { USER_INFO } from '@/constants/values';
import { FixTxt } from '@/types/common.type';
import { checkLogin, gotoLogin } from '@/utils/identity';
import { getCurrentFullRoute, navigateTo, replaceTo } from '@/utils/navigate';
import Taro from '@tarojs/taro';
import { MessageType, MessageTypeEnum } from '@ky-middleground/notification-type';
import { KYLoading } from '@/components/KYLoading';
import { getAvatarUrl } from '@/utils/util';
import classNames from 'classnames';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image, Text } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import KYTabBar from '@/components/KYTabBar';
import styles from './index.module.less';

type IStates = {
  userInfoMap: Map<string, NotificationUserType>;
  sysMsgList: MessageType[];
  isFirstRender: boolean;
};

@inject('store')
@observer
class Message extends BaseKyComponent<{}, IStates> {
  state = {
    userInfoMap: new Map<string, NotificationUserType>(),
    sysMsgList: [] as MessageType[],
    isFirstRender: true,
  };
  async componentDidMount() {
    const isLogin = await checkLogin();
    if (!isLogin) {
      gotoLogin(true, getCurrentFullRoute());
      return;
    }

    // 等待 IM SDK 就绪（切换分身后可能需要等待）
    if (!this.imStore.sdkStateReady) {
      console.log('消息页：IM SDK 未就绪，等待初始化...');
      let waitCount = 0;
      const maxWait = 50; // 最多等待 5 秒
      while (!this.imStore.sdkStateReady && waitCount < maxWait) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        waitCount++;
      }
      if (!this.imStore.sdkStateReady) {
        console.log('消息页：IM SDK 初始化超时');
        // 超时后仍然继续尝试获取，可能 SDK 会在后台完成初始化
      }
    }

    KYLoading.show();
    this.getSysMsgList();
    await this.imStore.getConversationList();
    await this.batchGetDoctorAndConsultantInfo();
    KYLoading.hide();
    // const res = await userApi.getCountryCodeList();
    // console.log(res);
  }

  get imStore() {
    return this.store.imStore;
  }

  async batchGetDoctorAndConsultantInfo() {
    const userAliasIds = this.imStore.conversationList.map((item) => item.userProfile.userID);
    const res = await userApi.batchGetDoctorAndConsultantInfo(userAliasIds);
    const map = new Map<string, NotificationUserType>();
    if (res.code === 0 && res.data) {
      res.data.forEach((val) => {
        map.set(val.aliasId, val);
      });
      this.setState({ userInfoMap: map });
    }
  }

  async getSysMsgList() {
    const res = await notificationApi.getMessageList(
      {
        offset: 0,
        limit: 1,
      },
      [MessageTypeEnum.System, MessageTypeEnum.Zxs as any],
    );
    if (res.code === 0) {
      this.setState({
        sysMsgList: res.data ? res.data.list : [],
      });
    }
  }

  onShareAppMessage() {
    return {
      title: FixTxt.indexPageText,
      path: '/pages/index/index',
      imageUrl: 'https://cdn-public.knowyourself.cc/icon/wechat/shareImg.jpg',
    };
  }

  /**
   * 服务服务文案文本和用户身份
   * @param aliasId
   */
  getItemUserInfo(aliasId: string): {
    serviceText: string;
    identityTags: string[];
    avatar: string;
    nickName: string;
    serviceTextColor: string;
    isLeave: boolean;
  } {
    const userInfo = storage.getItem(USER_INFO);
    const info = this.state.userInfoMap.get(aliasId);
    let serviceText = '';
    const identityTags = info?.identityTags || [];
    const avatar = info?.avatar || '';
    const nickName = info?.nickName || '';
    let serviceTextColor = '';
    if (info) {
      if (info.identityTags?.includes(IdentityTagsEnum.liaoyushi)) {
        if (info.status === CounsellingDoctorServiceStatusEnum.idle) {
          serviceText = '可服务';
          serviceTextColor = 'rgba(59, 63, 189, 1)';
        }
        if (info.status === CounsellingDoctorServiceStatusEnum.rest) {
          serviceText = '休息中';
          serviceTextColor = 'rgba(0, 0, 0, 0.4)';
        }
        if (
          info.status === CounsellingDoctorServiceStatusEnum.service &&
          info.toUserId !== userInfo.id
        ) {
          serviceText = '服务中';
          serviceTextColor = 'rgba(245, 139, 0, 1)';
        }
        if (
          info.workStatus === CounsellingDoctorWorkStatusEnum.working &&
          info.toUserId === userInfo.id
        ) {
          serviceText = '与我服务中';
          serviceTextColor = '#008255';
        }
        if (info.workStatus === CounsellingDoctorWorkStatusEnum.leave) {
          serviceText = '已离职';
          serviceTextColor = 'rgba(0, 0, 0, 0.4)';
        }
      } else if (info.identityTags?.includes(IdentityTagsEnum.zixunshi)) {
        if (info.workStatus === CounsellingDoctorWorkStatusEnum.leave) {
          serviceText = '已离职';
          serviceTextColor = 'rgba(0, 0, 0, 0.4)';
        } else {
          serviceText = '';
          serviceTextColor = '';
        }
      }
    }
    return {
      serviceText,
      identityTags,
      avatar,
      nickName,
      serviceTextColor,
      isLeave: info?.workStatus === CounsellingDoctorWorkStatusEnum.leave,
    };
  }

  componentDidShow() {
    if (!this.state.isFirstRender) {
      this.componentDidMount();
    }
    this.setState({
      isFirstRender: false,
    });
  }

  componentWillUnmount() {
    console.log('Message componentWillUnmount');
  }

  render() {
    const { sysMsgList } = this.state;
    const res = Taro.getSystemInfoSync();
    const navStyle = res.statusBarHeight ? res.statusBarHeight : 0;

    return (
      <KYPage className={styles.Message}>
        <KYNavigation showBack={false} className={styles.msg_navBg} />
        {/* list */}
        <View className={styles.title} style={{ top: navStyle + 10 + 'px' }}>
          消息
        </View>
        {this.imStore.conversationList.length === 0 && sysMsgList.length === 0 ? (
          <View className={styles.empty}>
            <Image
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/chat/20231026_weihuida.png"
              className={styles.img}
            />
            <Text className={styles.txt1}>暂时还没有消息哦</Text>
            <Text className={styles.txt2}>有烦恼？找专业人士聊聊吧！</Text>
            <View className={styles.txt3}>
              <Text
                className={styles.txt}
                onClick={() => {
                  replaceTo('/subCounselling/pages/index/index');
                }}
              >
                去看看
              </Text>
            </View>
          </View>
        ) : (
          <View className={styles.msg_wrapper}>
            {this.imStore.conversationList.map((item, index) => {
              let messageForShow = item.lastMessage.messageForShow || '';
              const customData = JSON.parse(item.lastMessage.payload?.data || '{}');
              if (customData.eventId === CustomEventIdEnum.callInfoStatus) {
                messageForShow = '[通话消息]';
              } else if (
                customData.eventId === CustomEventIdEnum.userClosed ||
                customData.eventId === CustomEventIdEnum.chatServiceEnd ||
                customData.eventId === CustomEventIdEnum.notReplyInService3Minut
              ) {
                messageForShow = '[系统消息]';
              }

              const { serviceText, identityTags, avatar, nickName, serviceTextColor, isLeave } =
                this.getItemUserInfo(item.userProfile.userID);

              return (
                <View
                  className={styles.msg_wrapper_item}
                  key={item + '_' + index}
                  onClick={() => {
                    this.imStore.initChatInfo();
                    if (identityTags.includes(IdentityTagsEnum.zixunshi)) {
                      // Taro.navigateTo({
                      //   url: `/subConsultant/pages/chat/index?counselorId=${item.userProfile.userID}`,
                      // });
                      navigateTo(
                        `/subConsultant/pages/chat/index?counselorId=${item.userProfile.userID}`,
                      );
                    } else {
                      // 疗愈师离职后没有标签了
                      // Taro.navigateTo({
                      //   url: `/subCounselling/pages/chat/index?doctorId=${item.userProfile.userID}`,
                      // });
                      navigateTo(
                        `/subCounselling/pages/chat/index?doctorId=${item.userProfile.userID}`,
                      );
                    }
                  }}
                >
                  <View
                    className={`${styles.msg_wrapper_item_l} ${
                      identityTags.includes(IdentityTagsEnum.liaoyushi) ? styles.icon_liaoyushi : ''
                    } ${
                      identityTags.includes(IdentityTagsEnum.zixunshi) ? styles.icon_zixunshi : ''
                    }`}
                  >
                    <Image
                      src={
                        getAvatarUrl(avatar) ||
                        getAvatarUrl('https://cdn-public.knowyourself.cc/icon/zxs/default_user.png')
                      }
                      className={`${styles.icon}`}
                    />
                  </View>
                  <View className={styles.msg_wrapper_item_r}>
                    <View className={styles.msg_wrapper_item_r_top}>
                      <View className={styles.msg_wrapper_item_r_top_l}>
                        <Text className={styles.name}>{nickName}</Text>
                        {serviceText ? (
                          <Text
                            className={classNames({
                              [styles.dot]: true,
                              [styles.leave]: serviceText === '已离职',
                            })}
                            style={{ backgroundColor: serviceTextColor }}
                          ></Text>
                        ) : (
                          ''
                        )}
                        <Text className={styles.dot_txt} style={{ color: serviceTextColor }}>
                          {serviceText}
                        </Text>
                      </View>
                      <View className={styles.time}>
                        {item.lastMessage.lastTime
                          ? this.imStore.calculateTimestamp(item.lastMessage.lastTime * 1000)
                          : ''}
                      </View>
                    </View>

                    <View className={styles.msg_wrapper_item_r_bottom}>
                      <Text className={styles.msg_wrapper_item_r_bottom_l}>
                        {isLeave ? '[系统消息]' : messageForShow}
                      </Text>

                      {item.unreadCount ? (
                        <View className={styles.msg_wrapper_item_r_bottom_r}>
                          <Text className={styles.msg_wrapper_item_r_bottom_r_txt}>
                            {item.unreadCount > 99 ? '99+' : item.unreadCount}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
            {sysMsgList.map((item, index) => {
              const messageForShow = item.title || '';
              return (
                <View
                  className={styles.msg_wrapper_item}
                  key={item + '_' + index}
                  onClick={() => {
                    // Taro.navigateTo({ url: `/subCommon/pages/serviceNotice/index` });
                    navigateTo(`/subCommon/pages/serviceNotice/index`);
                  }}
                >
                  <View className={styles.msg_wrapper_item_l}>
                    <Image
                      src="https://cdn-public.knowyourself.cc/icon/im/sys_icon_001.png"
                      className={styles.icon}
                    />
                  </View>
                  <View className={styles.msg_wrapper_item_r}>
                    <View className={styles.msg_wrapper_item_r_top}>
                      <View className={styles.msg_wrapper_item_r_top_l}>
                        <Text className={styles.name}>{item.senderName}</Text>
                      </View>
                      <View className={styles.time}>
                        {item.createdAt
                          ? this.imStore.calculateTimestamp(new Date(item.createdAt).getTime())
                          : ''}
                      </View>
                    </View>

                    <View className={styles.msg_wrapper_item_r_bottom}>
                      <Text className={styles.msg_wrapper_item_r_bottom_l}>{messageForShow}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <KYTabBar index={2} />
      </KYPage>
    );
  }
}

export default Message;
