import Taro from '@tarojs/taro';
import device from '../modules/utils/device';
import { TOKEN_KEY, USER_INFO } from '../constants/values';
import { userApi } from '../services';
import { reLaunchTo } from './navigate';

export const checkLogin = async () => {
  const token = await getAuthToken();
  return !!token;
};

/**
 * 去登录页
 */
export const gotoLogin = (showToast = true, option?: any) => {
  const login = () => {
    if (option) {
      reLaunchTo('/pages/login/index', { reBackUrl: encodeURIComponent(option) });
      return;
    }
    reLaunchTo('/pages/login/index');
  };

  if (showToast) {
    //    Toast.show({
    //    content: '还未登录，立即跳转到登录页面～',
    //});
    Taro.showToast({
      title: '还未登录，立即跳转到登录页面～',
      icon: 'none',
      duration: 2000,
    });
    setTimeout(() => {
      login();
    }, 1000);
  } else {
    login();
  }
};

// 获取token
export const getAuthToken = async (): Promise<string> => {
  let token = '';

  token = Taro.getStorageSync(TOKEN_KEY) || '';
  return token;
};

// 获取用户信息.
export const getUserInfo = async () => {
  let userInfo: any = Taro.getStorageSync(USER_INFO);
  try {
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
    } else {
      userInfo = await getUserAliasInfo();
    }
  } catch (error) {
    userInfo = await getUserAliasInfo();
    console.log('getCookie(USER_INFO)解析错误，重新获取用户信息----');
  }
  return userInfo || {};
};

const getUserAliasInfo = async () => {
  const token = await getAuthToken();
  if (!token) return;
  const res = await userApi.getUserAliasInfo();
  if (res.code === 0) {
    Taro.setStorageSync(USER_INFO, JSON.stringify(res.data));
    return res.data;
  }
};

/**
 * 获取指定用户分身信息（匿名接口，不写入本地存储）
 * 用于查看他人详情页面，获取他人的公开信息
 * @param userAliasId 用户分身ID
 * @returns 用户分身信息
 */
export const getUserAliasInfo2 = async (userAliasId: string) => {
  const res = await userApi.getUserAliasInfo2(userAliasId);
  if (res.code === 0) {
    // 注意：这里不要将数据写入 USER_INFO，因为获取的是他人信息
    // 写入 USER_INFO 会污染当前登录用户的信息，导致消息列表等数据错乱
    return res.data;
  }
};

export const getBundleId = () => {
  const pre = 'cc.knowyourself.ky';
  const IOS = 'ios';
  const ANDROID = 'android';
  const H5 = '.h5';
  const platform = device.isIOS() ? IOS : ANDROID;
  return `${pre}${platform}${H5}`;
};
