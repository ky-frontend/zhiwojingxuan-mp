import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { UserAliasListType } from '@ky-middleground/user-type';
import classnames from 'classnames';
import { TOKEN_KEY } from '@/constants/values';
import BaseKyComponent from '@/components/BaseKyComponent';
import { Image, View, Text, Button, ButtonProps, BaseEventOrig } from '@tarojs/components';
import KYPopup from '@/components/KYPopup';
import KYPage from '@/components/KYPage';
import { navigateTo } from '@/utils/navigate';
import KYNavigation from '@/components/KYNavigation';
import styles from './index.module.less';
import { Itags } from '../../store/platform';
import { AliasSelect } from './AliasSelect';

type PagePropsType = {};
type PageStateType = {
  isAgree: boolean;
  code: string;
  currentAlias: number;
};

interface Login {
  props: PagePropsType;
}

@inject('store')
@observer
class Login extends BaseKyComponent<{}, PageStateType> {
  constructor(props: PagePropsType) {
    super(props);
    this.state = {
      isAgree: false,
      code: '',
      currentAlias: 0,
    };
  }
  async onLoad(option) {
    if (option && option.reBackUrl) {
      this.store.loginStore.setLoginBackUrl(decodeURIComponent(option.reBackUrl));
    }
    if (option && option.type) {
      // 重新拉分身的数据
      await this.store.loginStore.getAliasList();
      this.store.loginStore.showSelectAlias = true;
    } else {
      Taro.removeStorageSync(TOKEN_KEY);
      this.store.loginStore.setNewData();
      Taro.login({
        success: (res) => {
          if (res.code) {
            //发起网络请求
            console.log(res);
            this.setState({
              code: res.code,
            });
          } else {
            console.log('登录失败！' + res.errMsg);
          }
        },
      });
    }
  }

  render() {
    const { isAgree, currentAlias } = this.state;
    const {
      isQuickLogin,
      quickLogin,
      loginByMobile,
      userAlertStatus,
      userBalanceSyncStatus,
      aliasList,
      showUpdateAlert,
      showBalanceSyncAlert,
      showSelectAlias,
    } = this.store.loginStore;
    const { tagLabel } = this.store.platformStore;
    console.log('aliasList', aliasList, showSelectAlias);

    return (
      <KYPage className={styles.login}>
        <KYNavigation title="" />
        {!showSelectAlias ? (
          <View>
            <View className={styles.Content}>
              <Image
                src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/applogo_zhiwoxinli_240126.png"
                className={styles.loginlogo}
              />

              <Image
                src="https://cdn-public.knowyourself.cc/icon/my/titlename.png"
                className={styles.loginName}
              />
              <View className={styles.p1}>专业心理服务平台</View>

              {isQuickLogin ? (
                <View
                  className={styles.loginBtn}
                  onClick={async () => {
                    if (isAgree) {
                      quickLogin(this.state.code);
                    } else {
                      Taro.showToast({
                        title: '请阅读并同意用户协议和隐私政策',
                        icon: 'none',
                        duration: 2000,
                      });
                    }
                  }}
                >
                  授权登录/注册
                </View>
              ) : (
                <Button
                  openType="getPhoneNumber"
                  className={styles.loginBtn}
                  onGetPhoneNumber={(e: BaseEventOrig<ButtonProps.onGetPhoneNumberEventDetail>) => {
                    if (e.detail.errMsg === 'getPhoneNumber:ok') {
                      if (e.detail.code) {
                        // console.log(e.detail.code);
                        loginByMobile(e.detail.code);
                      } else {
                        Taro.showToast({
                          title: '获取手机号失败',
                          icon: 'none',
                          duration: 2000,
                        });
                      }
                    }
                  }}
                >
                  验证手机号
                </Button>
              )}

              <View className={styles.tongyi}>
                {isAgree ? (
                  <Image
                    src="https://cdn-public.knowyourself.cc/icon/t/20231120_loginyou.png"
                    className={styles.you}
                    onClick={() => {
                      this.setState({
                        isAgree: !isAgree,
                      });
                    }}
                  />
                ) : (
                  <Image
                    src="https://cdn-public.knowyourself.cc/icon/t/20231120_loginempty.png"
                    className={styles.empty}
                    onClick={() => {
                      this.setState({
                        isAgree: !isAgree,
                      });
                    }}
                  />
                )}

                <View>
                  阅读并同意
                  <Text
                    onClick={() => {
                      // Taro.navigateTo({
                      //   url: '/subWebview/pages/md/index?protocolId=zhiwoxinliyonghuxieyi',
                      // });
                      navigateTo('/subWebview/pages/md/index?protocolId=zhiwoxinliyonghuxieyi');
                    }}
                  >
                    《知我心理用户使用协议》
                  </Text>
                  <Text
                    onClick={() => {
                      // Taro.navigateTo({
                      //   url: '/subWebview/pages/md/index?protocolId=zhiwoxinliyinsizhengc',
                      // });
                      navigateTo('/subWebview/pages/md/index?protocolId=zhiwoxinliyinsizhengc');
                    }}
                  >
                    《隐私保护政策》
                  </Text>
                </View>
              </View>
            </View>

            <KYPopup visiable={showUpdateAlert} type="CENTER">
              <View className={styles.tanchuang1content}>
                <Image
                  className={styles.img}
                  src="https://cdn-public.knowyourself.cc/icon/user/alias_release_notice_header.png"
                />
                <View className={styles.p}>
                  <View className={styles.t}>
                    <View className={styles.f}></View>
                    <View className={styles.p1}>月食APP已上线分身功能</View>
                  </View>
                  <View className={styles.t1}>
                    <View className={styles.f}>
                      您的历史聊愈数据留在了【社区昵称】分身，
                      <span>并已为您创建【聊愈马甲号昵称】分身</span>
                      ，登录该分身可继续用该身份和聊愈师聊天。
                    </View>
                  </View>
                </View>
                <View className={styles.btnview}>
                  <View
                    className={styles.b}
                    onClick={() => {
                      console.log('index');
                      userAlertStatus();
                    }}
                  >
                    我已知晓
                  </View>
                </View>
              </View>
            </KYPopup>

            <KYPopup visiable={!showUpdateAlert && showBalanceSyncAlert}>
              <View className={styles.tanchuang2content}>
                <Image
                  className={styles.img}
                  src="https://cdn-public.knowyourself.cc/icon/user/alias_release_notice_header.png"
                />
                <View className={styles.p}>
                  <View className={styles.t1}>
                    <View className={styles.f}>
                      监测到您有月亮币资产，<Text>是否保留在【社区昵称】分身，</Text>
                      或迁移至【聊愈马甲号昵称】，<Text>该操作仅可执行一次，请确认。</Text>
                    </View>
                  </View>
                  <View className={styles.aliasListView}>
                    {aliasList.map((item: UserAliasListType, index) => {
                      const src = item.identityTags?.length
                        ? tagLabel[item.identityTags[0] as Itags].normal.url
                        : '';
                      return (
                        <View
                          className={
                            currentAlias == index
                              ? classnames(styles.aliasItem, styles.aliasItemAc)
                              : styles.aliasItem
                          }
                          key={item.id}
                          onClick={() => {
                            this.setState({ currentAlias: index });
                          }}
                        >
                          <View className={styles.avator}>
                            <Image
                              className={styles.img}
                              src={item?.avatar + '?x-oss-process=style/avatar'}
                            />
                            <Image className={styles.tagImg} src={src} />
                          </View>
                          <View className={styles.aliasItemright}>
                            <View className={styles.p1}>{item.name}</View>
                            <View className={styles.p2}>月食号：{item.id}</View>
                          </View>
                          <View className={styles.tag}>分身 {index + 1}</View>
                        </View>
                      );
                    })}
                  </View>
                </View>
                <View className={styles.btnview}>
                  <View
                    className={styles.b}
                    onClick={() => {
                      userBalanceSyncStatus(aliasList[currentAlias].id);
                    }}
                  >
                    确定
                  </View>
                </View>
              </View>
            </KYPopup>
          </View>
        ) : (
          <AliasSelect />
        )}
      </KYPage>
    );
  }
}

export default Login;
