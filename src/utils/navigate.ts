import Taro from '@tarojs/taro';
import { objectToQueryString } from './util';

/**
 * @returns 获取到当前页面的路由参数
 */
export const currentPageRouteParams = () => {
  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const routeParams = currentPage.options ? currentPage.options : {};

  return routeParams;
};

/**
 * @returns 获取到当前页面的路由
 */
export const getCurrentRoute = () => {
  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  return currentPage.route || '';
};

/**
 * 返回当前页面完整的路由
 */
export const getCurrentFullRoute = () => {
  const route = getCurrentRoute();
  const query = currentPageRouteParams();
  return `${route}?${objectToQueryString(query)}`;
};

/**
 *
 * @param url 跳转路由
 * @param query 跳转参数
 * @param replace 是否替换当前页面
 *
 * 注：如果query中的参数与跳转路由中的参数重复，最后以跳转路由中的参数为准
 */
export const navigateTo = (
  url: string,
  query?: any,
  replace?: boolean,
  reLaunch?: boolean,
): void => {
  /**
   * 只保留当前url中带有的utm_参数，
   * @param target 当前url中携带的query参数
   */
  const handleParams = (target: any) => {
    if (typeof target === 'object' && Object.keys(target).length) {
      for (const key in target) {
        // 保留utm_参数和非
        if (!key.includes('utm_')) {
          delete target[key];
        }
      }
    }
  };

  let flag = false;

  // 处理目标路由中的参数
  const arr = url.split('?');
  url = arr[0].indexOf('/') === 0 ? arr[0] : '/' + arr[0];

  // url中带参数 将字符串转换成对象
  if (arr.length > 1) {
    // 将type=astrolabe&id=123&name=456&type=astrolabe&id=789&name=1011
    // 转化为
    // {type: 'astrolabe', id: '123', name: '456', type: 'astrolabe', id: '789', name: '1011'}
    const queryArr = arr[1].split('&');
    const tempObj: any = {};
    for (let i = 0; i < queryArr.length; i++) {
      const queryPair = queryArr[i].split('=');
      if (queryPair.length === 2) {
        Object.defineProperty(tempObj, queryPair[0], {
          value: queryPair[1],
          enumerable: true,
          configurable: true,
        });
      }
    }

    flag = true;

    if (typeof query === 'object' && Object.keys(query).length) {
      // 合并query和tempObj参数，重复的以tempObj【也就是url中的参数】参数为准
      Object.assign(query, tempObj);
      url += '?' + objectToQueryString(query);
    } else {
      url += '?' + objectToQueryString(tempObj);
    }
  } else {
    // url中不带参数
    if (typeof query === 'object' && Object.keys(query).length) {
      url += '?' + objectToQueryString(query);
      flag = true;
    }
  }

  // 获取当前url中的参数
  const currentUrlParams = currentPageRouteParams();
  handleParams(currentUrlParams);
  console.log('val', currentUrlParams);

  if (typeof currentUrlParams === 'object' && Object.keys(currentUrlParams).length) {
    url += flag
      ? `&${objectToQueryString(currentUrlParams)}`
      : `?${objectToQueryString(currentUrlParams)}`;
  }

  console.log('url', url);

  if (replace) {
    Taro.redirectTo({ url });
  } else if (reLaunch) {
    Taro.reLaunch({ url });
  } else {
    Taro.navigateTo({ url });
  }
};

export const replaceTo = (url: string, query: any = {}) => {
  navigateTo(url, query, true);
};

export const reLaunchTo = (url: string, query: any = {}) => {
  navigateTo(url, query, false, true);
};
