import Taro from '@tarojs/taro';
import { objectToQueryString } from '@/utils/util';
import appBridge from '../bridge/app';

/**
 * web页面跳转
 * @param url 跳转的url
 * @param query query参数
 * @param newWebview 是否在新的webview打开（仅在app内跳转url生效）
 */
export const navigateTo = (url: string, query?: AnyObj, newWebview?: boolean, replace = false) => {
  if (typeof query === 'object' && Object.keys(query).length) {
    url += '?' + objectToQueryString(query);
  }
  if (appBridge.inApp() && newWebview) {
    if (!/^http[s]{0,1}/.test(url)) {
      url = window.location.origin + url;
    }
    appBridge.openUrl({
      url, // 绝对路径
      isPresent: false,
      animation: true,
    });
    return;
  }
  if (replace) {
    // window.location.replace(url);
    Taro.redirectTo({ url });
  } else {
    // window.location.href = url;
    Taro.navigateTo({ url });
  }
};

/**
 * web页面跳转到app内的页面
 * @param url 跳转的url
 * @param query query参数
 */
export const navigateToApp = (url: string, query?: AnyObj) => {
  if (!appBridge.inApp()) {
    console.error('请在app内打开', url, query);
    return;
  }
  if (typeof query === 'object' && Object.keys(query).length) {
    url += '?' + objectToQueryString(query);
  }
  appBridge.openUrl({
    url,
    isPresent: false,
    animation: true,
  });
};

export const navigateBack = (page?: number) => {
  window.history.go(page || -1);
  // window.history.back();
};

export const replaceTo = (url: string, query?: AnyObj) => {
  navigateTo(url, query, false, true);
};

/**
 * 获取url上query参数
 * @param key 需要获取的参数名（可选）
 * @returns {string | object}
 * @example
 * /test?id=123name=456
 * getQuery('id')  // 123
 * getQuery()      // {id: 123, name: 456}
 */
export const getQuery = (key?: string) => {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  const obj: any = {};
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (key && pair[0] === key) {
      return decodeURIComponent(pair[1]);
    }
    obj[pair[0]] = decodeURIComponent(pair[1]);
  }
  return key ? null : obj;
};
