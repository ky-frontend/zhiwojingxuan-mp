import { userApi } from '@/services';
import {
  IdentityTagsEnum,
  LoginUserInfoResponse,
  UserAliasListType,
  UserWxLoginCodeType,
} from '@ky-middleground/user-type';
import Taro from '@tarojs/taro';
import { action, makeObservable, observable } from 'mobx';
import { reLaunchTo } from '@/utils/navigate';
import { TOKEN_KEY, USER_INFO, USER_OPENID } from '@/constants/values';
import { KYLoading } from '@/components/KYLoading';
import { store } from '../index';

export class LoginStore {
  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
  }

  @observable isQuickLogin = true;
  @observable showUpdateAlert = false;
  @observable showBalanceSyncAlert = false;
  @observable showSelectAlias = false;
  @observable aliasList: UserAliasListType[] = [];
  wxcodeData: UserWxLoginCodeType = {
    openId: '',
    unionid: '',
    session_key: '',
  };

  @action
  setNewData = () => {
    this.isQuickLogin = true;
    this.wxcodeData = {
      openId: '',
      unionid: '',
      session_key: '',
    };
    this.showSelectAlias = false;
  };
  @observable smsParams = {
    code: '',
    mobile: '',
    country_code: '+86',
  };
  @observable isShowCountrySelect = false;
  @observable loginBackUrl = '';

  @action
  changeShowCountrySelect = () => {
    this.isShowCountrySelect = !this.isShowCountrySelect;
  };

  @action
  setLoginBackUrl = (url: string) => {
    this.loginBackUrl = url;
  };

  @action
  quickLogin = async (code: string) => {
    const res = await userApi.xcxQuickLoginByCode(code);
    if (res.code == 0) {
      if (res.data.openId) {
        Taro.setStorage({
          key: USER_OPENID,
          data: res.data.openId,
        });
      }

      if (res.data.userInfo) {
        // 登录成功，开始是否需要选择分身的逻辑
        if (res.data.userInfo.coolDownTime == 0) {
          Taro.setStorage({ key: TOKEN_KEY, data: res.data.userInfo.token });
          Taro.setStorage({
            key: USER_INFO,
            data: JSON.stringify({ ...res.data.userInfo.userAliasList[0] }),
          });
          Taro.setStorage({
            key: USER_OPENID,
            data: res.data.openId,
          });
          this.aliasList = res.data.userInfo.userAliasList;
          // 把身份的标签过滤
          this.aliasList = this.aliasList.filter((item) => {
            return (
              item.identityTags?.[0] != IdentityTagsEnum.liaoyushi &&
              item.identityTags?.[0] != IdentityTagsEnum.zixunshi
            );
          });
          this.showUpdateAlert = res.data.userInfo.showUpdateAlert || false;
          this.showBalanceSyncAlert = res.data.userInfo.showBalanceSyncAlert || false;

          if (!this.showUpdateAlert && !this.showBalanceSyncAlert) {
            this.showSelectAlias = this.aliasList.length > 1;

            if (this.aliasList.length == 1) {
              await this.loginSuccessFunc(res.data.userInfo.token, this.aliasList[0]);
            }
          }
        } else {
          Taro.showToast({
            title: '账号在冷静期，请去月食APP登录账号',
            icon: 'none',
            duration: 2000,
          });
          return;
        }
      } else {
        // 说明是小程序的新用户，需要跳转到绑定手机号页面
        Taro.showToast({
          title: '请验证手机号',
          icon: 'none',
          duration: 2000,
        });
        this.isQuickLogin = false;
        this.wxcodeData = res.data.codeInfo as UserWxLoginCodeType;
      }
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
    }
  };

  @action
  loginByMobile = async (code: string) => {
    const res = await userApi.xcxLoginByPhoneCode(
      Object.assign(this.wxcodeData, {
        code,
      }),
    );
    if (res.code == 0) {
      await this.loginSuccessFunc(null, null, res.data);
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
    }
  };

  /**
   *
   * 重新获取列表
   */

  @action
  getAliasList = async () => {
    const res = await userApi.getAliasList();
    if (res.code == 0) {
      this.aliasList = res.data.list;
      this.aliasList = this.aliasList.filter((item) => {
        return (
          item.identityTags?.[0] != IdentityTagsEnum.liaoyushi &&
          item.identityTags?.[0] != IdentityTagsEnum.zixunshi
        );
      });
    }
  };

  @action
  changeAliasInfo = async (index: number) => {
    if (index == 0) {
      await this.loginSuccessFunc(Taro.getStorageSync(TOKEN_KEY) || '', this.aliasList[index]);
      return;
    }
    KYLoading.show();
    const res = await userApi.switchAliasInfo(this.aliasList[index].id);
    KYLoading.hide();
    if (res.code == 0) {
      await this.loginSuccessFunc(res.data.token, res.data.aliasInfo);
    } else {
      Taro.showToast({ title: res.message, icon: 'none', duration: 2000 });
    }
  };

  @action
  loginSuccessFunc = async (token, userInfo, rawuserInfo?: LoginUserInfoResponse) => {
    // 先登出旧 IM 账号并重置数据（切换分身时需要）
    if (store.imStore.chat) {
      console.log('切换分身/登录，先清理旧 IM 数据');
      try {
        await store.imStore.logout();
        await store.imStore.destroy();
      } catch (error) {
        console.log('清理旧 IM 数据失败', error);
      }
      store.imStore.imDataInit();
      store.imStore.sdkStateReady = false;
    }

    // 先清除可能存在的旧数据（防止未登录状态下查看他人详情时污染的数据）
    Taro.removeStorageSync(USER_INFO);
    Taro.removeStorageSync(TOKEN_KEY);

    const finalToken = token ? token : rawuserInfo?.token;
    const info = userInfo ? userInfo : rawuserInfo?.userAliasList[0];

    // 写入新的正确数据
    Taro.setStorage({ key: TOKEN_KEY, data: finalToken });
    Taro.setStorage({
      key: USER_INFO,
      data: JSON.stringify(info),
    });

    // IM 初始化使用全局 store 的 imStore 实例，确保所有页面使用同一个实例
    await store.imStore.init({ userID: info.id || '', userSig: info.imSig || '' });

    const redirectUrl = this.loginBackUrl || '/pages/index/index';
    console.log('redirectUrl', redirectUrl);

    Taro.showToast({
      title: '登录成功',
      icon: 'none',
      duration: 2000,
    });

    setTimeout(() => {
      reLaunchTo(redirectUrl);
      // Taro.reLaunch({ url: redirectUrl });
    }, 1000);
  };
  /**
   * 用户登录成功后，更新用户的弹框1的状态
   */
  @action
  userAlertStatus = async () => {
    KYLoading.show();
    const res = await userApi.updateUserAlertStatus();
    KYLoading.hide();

    if (res.code == 0) {
      this.showUpdateAlert = false;
      this.showBalanceSyncAlert = !!res.data.showBlanceAlert;

      if (!this.showBalanceSyncAlert) {
        this.showSelectAlias = this.aliasList.length > 1;
        if (this.aliasList.length == 1) {
          const token = Taro.getStorageSync(TOKEN_KEY) || '';
          await this.loginSuccessFunc(token, this.aliasList[0]);
        }
      }
    } else {
      Taro.showToast({ title: res.message, duration: 2000, icon: 'none' });
    }
  };

  /**
   * 用户登录成功后，更新用户的弹框2的状态
   */
  @action
  userBalanceSyncStatus = async (userAliasId: string) => {
    KYLoading.show();
    const res = await userApi.updateBalanceSyncStatus(userAliasId);
    KYLoading.hide();
    if (res.code == 0) {
      this.showBalanceSyncAlert = false;
      this.showSelectAlias = this.aliasList.length > 1;
      if (this.aliasList.length == 1) {
        const token = Taro.getStorageSync(TOKEN_KEY) || '';
        await this.loginSuccessFunc(token, this.aliasList[0]);
      }
    } else {
      Taro.showToast({ title: res.message, duration: 2000, icon: 'none' });
    }
  };
  @action
  changeSmsCode = (code: string) => {
    if (code.length > 6) {
      return;
    }
    this.smsParams.code = code;
  };
  @action
  sendSms = async (): Promise<boolean> => {
    const res = await userApi.sendMobileCodeLogin(
      this.smsParams.mobile,
      this.smsParams.country_code,
    );
    if (res.code === 0) {
      return true;
    }
    return false;
  };
  @action
  changeMobile = (mobile: string) => {
    this.smsParams.mobile = mobile;
  };

  /**
   * 微信登录未绑定手机号发送验证码
   */
  sendCodeWeChat = async () => {
    const res = await userApi.sendMobileCodeWechatLogin({
      mobile: this.smsParams.mobile,
      countryCode: this.smsParams.country_code,
    });
    if (res.code === 0) {
      return true;
    }
    return false;
  };

  /**
   * 微信携带手机号登录
   */
  loginMobileWeChat = async () => {
    const res = await userApi.userLoginMobileWeChat({
      unionid: '',
      mobile: this.smsParams.mobile,
      countryCode: this.smsParams.country_code,
      code: this.smsParams.code,
      openid: '',
    });
  };
}

export type ILoginStore = LoginStore;
