import Taro from '@tarojs/taro';
import { consultantApi } from '@/services';
import { CounsellingDoctorWorkStatusEnum } from '@ky-client/counselling-type';
import { KYTrack } from '@/modules/track';
import {
  T_CounselingPreTalkEnter,
  T_CounselingPreTalkAppointmentButton,
} from '@/modules/track/events';
import { observer, inject } from 'mobx-react';
import { navigateTo } from '@/utils/navigate';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { ConsultantBaseEnum } from '@ky-client/consultant-type';
import KYPopup from '@/components/KYPopup';
import { checkLogin, gotoLogin } from '@/utils/identity';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Input, Text, ScrollView } from '@tarojs/components';
import { CounselorIdentityEnum } from '@/types/common.type';
import ImagePreview from '@/components/KYImagePreview';
import { px2rpxBig } from '@/modules/utils/tools';
import { detectDevice, getAvatarUrl } from '@/utils/util';
import { CustomEventIdEnum, SourceEnum } from '@/types/im.type';
import { AppItemKeyTypeEnum, AppKeyTypeEnum } from '@ky-frontend/common';
import { KYLoading } from '@/components/KYLoading';
import styles from './index.module.less';
import MsgItem from './components/MsgItem/index';

// import { rpx2px, throttle } from '@/modules/utils/tools';

type PageStateProps = {};

interface Index {
  props: PageStateProps;
}

type ChatInfoType = {
  consultant: {
    counselorId: string;
    avatar: string;
    nickName: string;
    workStatus: number;
    /** 咨询时长 */
    consultationDuration: number;
    /** 个人简介 */
    profileSummary: string;
    /** 资质列表 */
    certification: string[];
    /** 咨询过程及方式 */
    consultationProcess: string;
    /** 第一个产品价格 */
    price: number;
    /** 咨询师等级  1实习 0 正式 */
    level: ConsultantBaseEnum.LevelEnum;

    consultationDurationStr: string;
    /** 产品信息 */
    counselorProduct: {
      price: number;
      productName: string;
      skuInfo: any;
    }[];
  };
  user: {
    nickName: string;
    avatar: string;
    userId: string;
    aliasId: string;
    /** 每周免费15条 */
    freeMsg: number;
  };
  /** 预约最新订单Id */
  lastOrderId: string;
  /** 是否预约 */
  isCall: boolean;
};
type IStates = {
  counselorId: string;
  statusBarHeight: number;
  chatInfo: ChatInfoType;
  isFirstRender: boolean;

  scrollStyle: {
    height: string;
  };
  freeMsg: number;
  refresherTriggered: boolean;
  preViewUrlInfo: {
    url: string;
    width: number;
    height: number;
  };
  KeyboardFixed: number;
  showModal: boolean;
};

@inject('store')
@observer
class Index extends BaseKyComponent<{}, IStates> {
  state = {
    counselorId: '',
    statusBarHeight: 0,
    chatInfo: null as any as ChatInfoType,
    scrollStyle: {
      height: '',
    },
    freeMsg: 15,
    refresherTriggered: false,
    isFirstRender: true,
    preViewUrlInfo: {
      url: '',
      width: 0,
      height: 0,
    },
    KeyboardFixed: 0,
    showModal: false,
  };
  scrollViewRef: any = null;
  get consultantIndexStore() {
    return this.store.consultantIndexStore;
  }
  get imStore() {
    return this.store.imStore;
  }
  /**
   *
   * subConsultant/pages/index/index
   * counselorId=1703041740952286
   *  */
  async onLoad(res) {
    if (res && res.counselorId) {
      const isLogin = await checkLogin();
      if (!isLogin) {
        gotoLogin(true);
        return;
      }

      // 检查 IM SDK 是否已初始化，如果未初始化则等待
      if (!this.imStore.chat || !this.imStore.sdkStateReady) {
        console.log('IM SDK 未就绪，等待初始化...');
        // 等待 SDK 就绪，最多等待 5 秒
        let waitCount = 0;
        const maxWait = 50; // 50 * 100ms = 5000ms
        while ((!this.imStore.chat || !this.imStore.sdkStateReady) && waitCount < maxWait) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          waitCount++;
        }
        if (!this.imStore.chat || !this.imStore.sdkStateReady) {
          Taro.showToast({
            title: 'IM 初始化失败，请重新登录',
            icon: 'none',
            duration: 2000,
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 2000);
          return;
        }
      }

      this.setState({ counselorId: res.counselorId });
      await this.getChatInfo(res.counselorId);
      const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
      this.setState({
        statusBarHeight: sbh,
      });
    } else {
      Taro.showToast({
        title: '没有咨询师Id',
        icon: 'none',
        duration: 1000,
        success: () => {
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        },
      });
    }
  }

  preView(url: string, width: number, height: number) {
    this.setState({
      preViewUrlInfo: {
        url,
        width,
        height,
      },
    });
  }

  componentDidMount() {
    const device = detectDevice();
    console.log('设备消息', device);

    if (device === 'iOS') {
      console.log('ios, 监听');
      // 监听键盘弹起事件
      Taro.getSystemInfo({
        success: (res) => {
          // 获取屏幕可见高度
          const windowHeight = res.windowHeight;
          console.log('获取屏幕可见高度1', windowHeight);
          Taro.onKeyboardHeightChange((res) => {
            console.log('键盘起来', res);
            // 键盘高度发生变化时，调整页面滚动位置以确保输入框可见
            if (res.height > 0) {
              this.setState({
                KeyboardFixed: 10,
              });
            } else {
              this.setState({
                KeyboardFixed: 0,
              });
            }
          });
        },
      });
    }
  }

  async getChatInfo(counselorId: string) {
    const that = this;
    KYLoading.show();
    const res = await consultantApi.chatInfo({
      aliasId: counselorId || this.state.counselorId,
      type: 'consultant',
    });
    KYLoading.hide();
    if (res.code === 0) {
      this.setState({ chatInfo: res.data, freeMsg: res.data.user.freeMsg }, () => {
        // 埋点: 知我心理进入咨询对话页
        KYTrack(
          T_CounselingPreTalkEnter({
            order_id: this.state.chatInfo.lastOrderId,
            counselor_id: this.state.counselorId,
            counselor_name: this.state.chatInfo.consultant.nickName,
          }),
        );
      });
      await this.imStore.getConversationProfile(counselorId || this.state.counselorId);
      Taro.createSelectorQuery()
        .select('#userInfo')
        .fields(
          {
            dataset: true,
            size: true,
            scrollOffset: true,
            properties: ['scrollX', 'scrollY'],
          },
          function (uiRes) {
            if (res.data.consultant.workStatus === CounsellingDoctorWorkStatusEnum.leave) {
              that.setState({
                scrollStyle: {
                  height: `calc(100vh - env(safe-area-inset-bottom) - ${
                    uiRes.height + that.state.statusBarHeight - 16
                  }px)`,
                },
              });
            } else {
              that.setState({
                scrollStyle: {
                  height: `calc(100vh - env(safe-area-inset-bottom) - ${
                    uiRes.height + that.state.statusBarHeight + 56 + 56 - 16
                  }px)`,
                },
              });
            }
          },
        )
        .exec();
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
      if (res.code !== 2) {
        Taro.navigateBack();
      }
    }
  }

  componentDidShow() {
    // if (!this.state.isFirstRender) {
    //   this.imStore.currentNextReqMessageID = '';
    //   this.onLoad({ counselorId: this.state.counselorId });
    //   // this.imStore.initChatInfo();
    // }
    // this.setState({
    //   isFirstRender: false,
    // });
  }

  async onRefresherRefresh() {
    if (this.state.refresherTriggered) return;
    this.setState({
      refresherTriggered: true,
    });
    await this.imStore.getMessageList();
    setTimeout(() => {
      this.setState({
        refresherTriggered: false,
      });
    }, 100);
  }

  render() {
    const { chatInfo, scrollStyle, freeMsg, refresherTriggered, preViewUrlInfo } = this.state;
    return (
      <KYPage className={styles.consultantChatPage}>
        {chatInfo ? (
          <KYNavigation showBack className={styles.navBg} />
        ) : (
          <KYNavigation showBack className={styles.navBg}></KYNavigation>
        )}
        {chatInfo ? (
          <View>
            <View className={styles.userInfo} id="userInfo">
              <View
                className={styles.avatarBox}
                onClick={() => {
                  if (chatInfo.consultant.workStatus !== CounsellingDoctorWorkStatusEnum.leave) {
                    // Taro.navigateTo({
                    //   url: `/subCommon/pages/userInfo/index?sence=${this.state.counselorId}&identity=${CounselorIdentityEnum.Consultant}`,
                    // });
                    navigateTo(
                      `/subCommon/pages/userInfo/index?sence=${this.state.counselorId}&identity=${CounselorIdentityEnum.Consultant}`,
                    );
                  } else {
                    Taro.showToast({
                      title: '该咨询师已离职, 如需继续咨询请更换咨询师',
                      icon: 'none',
                    });
                  }
                }}
              >
                <Image
                  src={getAvatarUrl(chatInfo.consultant.avatar)}
                  className={styles.avatar}
                ></Image>
              </View>

              {/* {chatInfo.consultant!.workStatus === CounsellingDoctorWorkStatusEnum.leave ? () : (

                )} */}
              {chatInfo &&
              chatInfo.consultant.workStatus === CounsellingDoctorWorkStatusEnum.leave ? (
                <View className={styles.leave}>已离职</View>
              ) : (
                <>
                  <View className={styles.name}>{chatInfo.consultant.nickName}</View>
                  <View
                    className={styles.tagText}
                  >{`${chatInfo.consultant.certification[0]} | 咨询时长:${chatInfo.consultant.consultationDurationStr}小时`}</View>

                  <View className={styles.process}>
                    <Text className={styles.way}>{chatInfo.consultant.consultationProcess}</Text>
                    <Text className={styles.price}>
                      <Text className={styles.symbol}>¥</Text>
                      <Text>{chatInfo.consultant.price / 100}</Text>
                      <Text className={styles.num}>/次</Text>
                    </Text>
                  </View>
                  <View
                    className={styles.appointmentBtn}
                    onClick={() => {
                      // 埋点: 知我心理咨询对话页立即预约按钮点击
                      KYTrack(
                        T_CounselingPreTalkAppointmentButton({
                          counselor_id: this.state.counselorId,
                          counselor_name: chatInfo.consultant.nickName,
                        }),
                      );
                      // Taro.navigateTo({
                      //   url: `/subConsultant/pages/chooseAppointment/index?id=${chatInfo.consultant.counselorId}`,
                      // });
                      navigateTo(
                        `/subConsultant/pages/chooseAppointment/index?id=${chatInfo.consultant.counselorId}`,
                      );
                    }}
                  >
                    立即预约
                  </View>
                </>
              )}

              <View className={styles.tipBox}>
                <View className={styles.tipOne}>
                  <Text>1.欢迎使用月食心理咨询，关于服务的详情及规则点击</Text>
                  <Text
                    className={styles.serviceHref}
                    onClick={() => {
                      // Taro.navigateTo({
                      //   url: '/subCommon/pages/help/index?type=zixunshi',
                      // });
                      navigateTo('/subCommon/pages/help/index?type=zixunshi');
                    }}
                  >
                    《咨询服务使用须知》
                  </Text>
                </View>
                <View className={styles.tipTwo}>
                  <Text>
                    2.与咨询师私信仅有于沟通心理咨询服务相关的事物性内容（如预约时间），对非事物性内容不保证在私信中给予回复。
                  </Text>
                </View>
              </View>
            </View>

            <View className={styles.msgBox}>
              <ScrollView
                ref={(ref) => {
                  this.scrollViewRef = ref;
                }}
                enhanced
                onScrollEnd={(res) => {
                  this.imStore.scrollTop = res.detail.scrollTop;
                }}
                className="scrollView"
                scrollY
                scrollWithAnimation
                refresherTriggered={refresherTriggered}
                scrollTop={this.imStore.scrollTop}
                refresherEnabled
                onRefresherRefresh={this.onRefresherRefresh.bind(this)}
                style={scrollStyle}
                // upperThreshold={Threshold}
                // onScrollToUpper={this.onScrollToUpper.bind(this)} // 使用箭头函数的时候 可以这样写 `onScrollToUpper={this.onScrollToUpper}`
                // onScroll={this.onScroll}
              >
                {this.imStore.messageList.map((msg, index) => {
                  const payloadData = JSON.parse(msg.payload?.data || '{}');
                  if (payloadData.eventId === CustomEventIdEnum.callAnsweringSource) {
                    if (payloadData.event.source === SourceEnum.Web) {
                      console.log('--------payloadData.event.source === SourceEnum.Web--------');
                      return;
                    }
                  }
                  let prevTime = 0;
                  let currTime = 0;
                  let time = '';
                  let timeEle: any = '';
                  if (index > 0) {
                    prevTime = this.imStore.messageList[index - 1].time;
                  }
                  currTime = msg.time;
                  time = this.imStore.handleItemTime(currTime, prevTime);
                  if (time) {
                    timeEle = <View className={styles.time}>{time}</View>;
                  }

                  if (!msg.avatar && msg.flow === 'in') {
                    msg.avatar = chatInfo.consultant.avatar;
                  }
                  if (!msg.avatar && msg.flow === 'out') {
                    msg.avatar = chatInfo.user.avatar;
                  }
                  return (
                    <View className={styles.msgItemBox} key={msg.ID}>
                      {timeEle}
                      <MsgItem
                        chatInfo={chatInfo}
                        message={msg}
                        preViewFun={this.preView.bind(this)}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
            {chatInfo &&
              chatInfo.consultant.workStatus !== CounsellingDoctorWorkStatusEnum.leave && (
                <View
                  className={styles.inputText}
                  style={{ bottom: detectDevice() === 'iOS' ? this.state.KeyboardFixed : '10px' }}
                >
                  <Image
                    src="https://cdn-public.knowyourself.cc/icon/zxs/icon_input.png"
                    onClick={() => {
                      if (freeMsg === 0) {
                        Taro.showToast({
                          title: '本周免费消息已用完',
                          icon: 'none',
                        });
                        return;
                      }
                      Taro.chooseImage({
                        count: 1,
                        success: (res) => {
                          const newMsg = this.imStore.createImageMsg({
                            to: chatInfo.consultant.counselorId,
                            file: res,
                            cloudCustomData: JSON.stringify({
                              appKey: AppKeyTypeEnum.Zxs,
                              appItemKey: AppItemKeyTypeEnum.Zxs,
                            }),
                          });
                          const messageList = Array.from(this.imStore.messageList).reverse();
                          this.imStore.sendMsg(newMsg, { insetMessage: true });
                          let flag = false;
                          const haveOut = messageList.some((item) => {
                            if (item.flow === 'out') {
                              if (new Date().setHours(5, 0, 0) / 1000 > item.time) {
                                flag = true;
                              } else {
                                flag = false;
                              }
                              return true;
                            } else {
                              return false;
                            }
                          });
                          if (!haveOut) {
                            // 意味着没有flow===in的值
                            flag = true;
                          }
                          if (flag) {
                            consultantApi.sendFirstMessageRemind(
                              chatInfo.user.aliasId,
                              chatInfo.consultant.counselorId,
                            );
                          }
                          this.setState({ freeMsg: freeMsg - 1 });
                        },
                        fail: (res) => {
                          console.log('fail', res);
                        },
                      });
                    }}
                  />
                  <View
                    className={styles.inputBox}
                    onClick={() => {
                      if (freeMsg === 0) {
                        Taro.showToast({
                          title: '本周免费消息已用完',
                          icon: 'none',
                        });
                      }
                    }}
                  >
                    <Input
                      placeholder={`${
                        freeMsg ? `本周免费消息剩余${freeMsg}条` : '本周免费消息已用完'
                      } `}
                      placeholderStyle={`font-size: ${px2rpxBig(15)}px;`}
                      confirmType="send"
                      confirmHold
                      maxlength={50}
                      adjustPosition
                      cursorSpacing={detectDevice() === 'iOS' ? 200 : 10}
                      disabled={freeMsg === 0}
                      value={this.imStore.inputValue}
                      onInput={(res) => {
                        this.imStore.inputValue = res.detail.value;
                      }}
                      onConfirm={(res) => {
                        const newMsg = this.imStore.createTextMsg({
                          to: chatInfo.consultant.counselorId,
                          text: res.detail.value,
                          cloudCustomData: JSON.stringify({
                            appKey: AppKeyTypeEnum.Zxs,
                            appItemKey: AppItemKeyTypeEnum.Zxs,
                          }),
                        });
                        const messageList = Array.from(this.imStore.messageList).reverse();
                        this.imStore.sendMsg(newMsg, { insetMessage: true });
                        let flag = false;
                        const haveOut = messageList.some((item) => {
                          if (item.flow === 'out') {
                            if (new Date().setHours(5, 0, 0) / 1000 > item.time) {
                              flag = true;
                            } else {
                              flag = false;
                            }
                            return true;
                          } else {
                            return false;
                          }
                        });
                        if (!haveOut) {
                          // 意味着没有flow===in的值
                          flag = true;
                        }
                        if (flag) {
                          consultantApi.sendFirstMessageRemind(
                            chatInfo.user.aliasId,
                            chatInfo.consultant.counselorId,
                          );
                        }
                        this.setState({ freeMsg: freeMsg - 1 });
                        this.imStore.inputValue = '';
                      }}
                    ></Input>
                  </View>
                  <Image
                    src="https://cdn-public.knowyourself.cc/icon/im/keyboard_ic_video.png"
                    onClick={() => {
                      // Taro.showToast({
                      //   title: '为保证通话质量，请前往知我心理APP使用',
                      //   icon: 'none',
                      // });
                      this.setState({ showModal: true });
                    }}
                  />
                </View>
              )}
          </View>
        ) : null}
        {preViewUrlInfo && preViewUrlInfo.url ? (
          <ImagePreview
            imageUrl={preViewUrlInfo.url}
            width={preViewUrlInfo.width}
            height={preViewUrlInfo.height}
            onClose={() => {
              this.setState({ preViewUrlInfo: null as any });
            }}
          />
        ) : null}

        <KYPopup
          visiable={this.state.showModal}
          type="CENTER"
          zIndex={9999}
          style={{ right: '58px', left: '58px' }}
        >
          <View className={styles.modal}>
            <View className={styles.p}>如果使用通话请下载【知我心理app】。下载方式：</View>
            <View className={styles.p}>
              1.打开KnowYourself公众号-底部【联系我们】-下载【知我心理APP】
            </View>
            <View className={styles.p}>
              2.打开手机应用商店（日常软件下载中心）-搜索并下载【知我心理APP】
            </View>
            <View className={styles.p}>如有疑问请在“我的”页面【联系客服】咨询</View>
          </View>
          <View
            className={styles.modalBtn}
            onClick={() => {
              this.setState({ showModal: false });
            }}
          >
            确定
          </View>
        </KYPopup>
      </KYPage>
    );
  }
}

export default Index;
