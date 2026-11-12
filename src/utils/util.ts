import Taro from '@tarojs/taro';
import GraphemeSplitter from 'grapheme-splitter';
import { ENV_CONFIG, USER_DEFAULT_AVATAR } from '../constants/values';
import { formatDate as _formatDate, formatBeijingDate as _formatBeijingDate } from './dayjs.util';

const splitter = new GraphemeSplitter();
export const objectToQueryString = (obj: any) => {
  return Object.keys(obj)
    .map((key) => key + '=' + obj[key])
    .join('&');
};

// 判断是否生产环境
export const isPrd = () => {
  return (
    window.location.host === 'm.knowyourself.cc' ||
    window.location.host === 'ex.knowyourself.cc' ||
    window.location.host === 'ex.zhiwotansuo.com'
  );
};

/**
 * 格式化时间
 * @param {dayjs.ConfigType} date 时间戳
 * @param {number} formatTextStyle 格式化文本样式
 */
export const formatDate = _formatDate;

/**
 * 格式化北京时间
 * @param {dayjs.ConfigType} date 时间戳
 * @param {number} formatTextStyle 格式化文本样式
 * @returns
 */
export const formatBeijingDate = _formatBeijingDate;

/**
 * 价格单位转换（分转成元）
 */
export const formatPrice = (price: number) => {
  if (typeof price !== 'number') return '';
  return (price / 100).toFixed(2);
};

/**
 * 价格单位转换（分转成元）去除多余的0
 */
export const formatPriceNoZero = (price: number) => {
  if (typeof price !== 'number') return '';
  const formattedPrice = (price / 100).toFixed(2);
  return formattedPrice.replace(/(\.0+)$/, '');
};

/**
 * 时间毫秒转换成分
 */
export const msTom = (ms: number) => {
  // 向上取整
  return Math.ceil(ms / 1000 / 60);
};

/**
 * 时间毫秒转换成分，超过30s算1分钟
 */
export const msTom2 = (ms: number) => {
  const y = ms % (60 * 1000);
  // 向下取整
  return Math.floor(ms / 1000 / 60) + (y > 30 * 1000 ? 1 : 0);
};

/**
 * 格式化手机号  13888888888 -> 138****8888
 * @param {string} mobile 手机号
 */
export const formatPhoneNumber = (mobile: string) => {
  return mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
};

/**
 * 预加载图片
 * @param {string} url 图片地址
 * @returns {Promise} Promise
 * @example
 * preloadImage('https://www.baidu.com/img/flexible/logo/pc/result.png')
 *  .then(() => {
 *   console.log('图片加载完成');
 * })
 * .catch(() => {
 *  console.log('图片加载失败');
 * });
 */
export const preloadImage = (url: string) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = resolve;
    image.onerror = reject;
  });
};

/**
 *
 * 毫秒转分钟
 * @param {number} ms 需要转换的ms
 * @param {number} decimals 需要保留的小数
 *
 * */

export const msToMinutes = (ms: number, decimals = 0) => {
  if (ms === undefined) {
    return 0;
  }
  const minutes = ms / 1000 / 60;
  return decimals > 0 ? String(minutes.toFixed(decimals)) : String(Math.floor(minutes));
};

/**
 * 根据生日获取星座
 */
export const getZodiacSign = (day: number, month: number): string => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return '白羊座';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return '金牛座';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) {
    return '双子座';
  } else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) {
    return '巨蟹座';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return '狮子座';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return '处女座';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) {
    return '天秤座';
  } else if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) {
    return '天蝎座';
  } else if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) {
    return '射手座';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return '摩羯座';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return '水瓶座';
  } else {
    return '双鱼座';
  }
};

/**
 * 中国标准时间转换
 */
export const formatDateTime = (date: any): string => {
  const dt = new Date(date);
  const year = dt.getFullYear();
  const month = dt.getMonth() + 1;
  const monthStr = month < 10 ? '0' + month : month;
  const day = dt.getDate();
  const dayStr = day < 10 ? '0' + day : day;
  return year + '-' + monthStr + '-' + dayStr;
};
/**
 * 格式化时间
 * 如果时间小于5分钟，显示刚刚
 * 如果时间小于1小时，显示xx分钟前
 * 如果时间小于1天，显示xx小时前
 * 如果时间在当年，显示xx月xx日
 * 如果时间不在当年，显示xxxx年xx月xx日
 */
export const formatTime = (time: number): string => {
  const now = new Date().getTime();
  const diff = now - time;
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const year = day * 365;
  if (diff < 5 * minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < year) {
    return formatDateTime(time);
  } else {
    return formatDateTime(time);
  }
};

/**
 * 用于头像整体裁剪展示
 */
export const getAvatarUrl = (avatar: string) => {
  if (!avatar) return USER_DEFAULT_AVATAR;
  return `${avatar}?x-oss-process=style/avatar`;
};

/**
 * 判断字符串是否为 HTML 富文本（包含 < 标签），而不是纯文本
 */
export const isHtmlContent = (content: string) => /<[a-z][\s\S]*>/i.test(content);

/**
 * 获取h5链接全部url
 * @param path eg: /user/login
 * @returns
 */
export const getHyBridUrl = (path: string) => {
  let locationOrigin = `https://hybrid-test.knowyourself.cc/`;
  if (isPrd()) {
    locationOrigin = `https://hybrid.knowyourself.cc/`;
  }
  return `${locationOrigin}${path}`;
};

/**
 * 设置本地缓存有有效期
 * @param key 存储key值
 * @param info 存储对象
 * @param expiryInMilliseconds
 */
export const setLocalStorageWithExpiry = (
  key: string,
  info: Record<string, string>,
  expiryInMilliseconds: number,
) => {
  const now = new Date().getTime();
  const item = {
    ...info,
    expiry: now + expiryInMilliseconds,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

/**
 * 获取本地缓存
 * @param key
 * @returns
 */
export const getLocalStorageWithExpiry = (key: string) => {
  const item = Taro.getStorageSync(key);
  if (!item || !item.includes('expiry')) {
    localStorage.removeItem(key);
    return null; // 如果键不存在，返回 null
  }
  const parsedItem = JSON.parse(item);
  const now = new Date().getTime();
  if (now > parsedItem.expiry) {
    localStorage.removeItem(key); // 过期后移除键
    return null;
  }
  return parsedItem;
};

/**
 * 深拷贝
 */
export const deepClone = (obj: any): any => {
  let clone: any;
  if (null == obj || 'object' != typeof obj) return obj;
  if (obj instanceof Date) {
    clone = new Date();
    clone.setTime(obj.getTime());
    return clone;
  }
  if (obj instanceof Array) {
    clone = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      clone[i] = deepClone(obj[i]);
    }
    return clone;
  }
  if (obj instanceof Object) {
    clone = {};
    for (const attr in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(attr)) clone[attr] = deepClone(obj[attr]);
    }
    return clone;
  }
  throw new Error("Unable to copy obj! Its type isn't supported.");
};

// 获取dom数据的工具方法
export const getRect = (selector, all = false): Promise<any> => {
  return new Promise((resolve) => {
    Taro.createSelectorQuery()
      .select(selector)
      .boundingClientRect((rect) => {
        if (all && Array.isArray(rect) && rect.length) {
          resolve(rect);
        }
        if (!all && rect) {
          resolve(rect);
        }
      })
      .exec();
  });
};

/**
 *
 * @param str 截取的字符串
 * @param num 截取的长度
 * @param isSpread 是否展开
 * @returns
 */
export const sliceStr = (str: string, num, isSpread = false) => {
  if (!str) {
    return;
  }
  if (isSpread) return str;
  const strList = splitter.splitGraphemes(str) || [];
  return strList.length > num ? strList.join('').slice(0, num) + '...' : str;
};

export const getEnvConfig = () => {
  const env = Taro.getStorageSync(ENV_CONFIG);
  let config = {
    API_URL: '',
    M_URL: '',
    IM_SKD_ID: 0,
  };
  if (env == 'dev2') {
    config = {
      API_URL: 'https://tapi-dev2.knowyourself.cc',
      M_URL: 'https://m-dev2.knowyourself.cc',
      IM_SKD_ID: 1400818915,
    };
  } else {
    config.API_URL = 'https://tapi.knowyourself.cc';
    config.M_URL = 'https://m.knowyourself.cc';
    config.IM_SKD_ID = 1400822648;
    // config = {
    //   API_URL: 'https://tapi-dev2.knowyourself.cc',
    //   M_URL: 'https://m-dev2.knowyourself.cc',
    //   IM_SKD_ID: 1400818915,
    // };
  }
  return config;
};

export const setEnvConfig = (env: string) => {
  Taro.setStorageSync(ENV_CONFIG, env);
};

/**
 * @description 判断设备
 * @returns
 */
export const detectDevice = () => {
  const system = Taro.getSystemInfoSync().system;
  // 使用正则表达式检查是否包含iOS设备标识
  if (/iPhone|iPad|iPod|ios/i.test(system)) {
    return 'iOS';
  }
  // 正则表达式匹配Android设备标识，不区分大小写
  else if (/Android/i.test(system)) {
    return 'Android';
  }
  // 如果都不匹配，返回"Unknown"
  else {
    return 'Unknown';
  }
};

export const getQueryString = (path): Record<string, string> => {
  const url = decodeURIComponent(path); //获取url中"?"符后的字串
  const theRequest = new Object();
  if (url.indexOf('?') != -1) {
    const str = url.split('?')[1];
    console.log('str', str);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
    }
  }
  return theRequest as Record<string, string>;
};
