import Taro from '@tarojs/taro';

type func = (...args: any) => any;

/**
 * 用于防抖的函数
 * @param fn 需要防抖的函数
 * @param delay 延时时间，单位毫秒
 * @returns
 * @example
 * const fn = debounce(() => console.log('debounce'), 1000);
 * fn();
 */
export const debounce = <T>(fn: T, delay: number): func => {
  let timer: NodeJS.Timeout | null;
  return (...args: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      () => {
        typeof fn === 'function' && fn.apply(this, args);
        timer = null;
      },
      delay > 0 ? delay : 100,
    );
  };
};

/**
 * 用于节流的函数
 * @param fn 需要节流的函数
 * @param delay 延时时间，单位毫秒
 * @param immediate 是否立即执行
 * @returns
 * @example
 * const fn = throttle(() => console.log('throttle'), 1000);
 * fn();
 */

export const throttle = <T>(fn: T, delay: number, immediate = false): func => {
  let timer: NodeJS.Timeout | null;
  return (...args: any) => {
    if (timer) {
      return;
    }
    if (immediate) {
      typeof fn === 'function' && fn.apply(this, args);
      immediate = false;
    } else {
      timer = setTimeout(() => {
        typeof fn === 'function' && fn.apply(this, args);
        timer = null;
      }, delay);
    }
  };
};

/**
 * 睡眠函数
 * @param ms 等待的时间，单位毫秒
 * @returns
 */
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * px 转 rem
 * @param px
 * @returns
 */
export const px2rpx = (px: number): number => {
  const deviceWidth = Taro.getSystemInfoSync().windowWidth; //获取设备屏幕宽度

  const rpx = (375 / deviceWidth) * Number(px);
  return Math.floor(rpx);
};

/**
 * px 转 rem 区别于px2rpx方法, 屏幕更大,字体更大
 * @param px
 * @returns
 */
export const px2rpxBig = (px: number): number => {
  const deviceWidth = Taro.getSystemInfoSync().windowWidth; //获取设备屏幕宽度
  const rpx = (deviceWidth / 375) * Number(px);
  return Math.floor(rpx);
};
/**
 * rpx 转 px
 * @param rpx
 * @returns
 */
export const rpx2px = (rpx: number): number => {
  const deviceWidth = Taro.getSystemInfoSync().windowWidth; //获取设备屏幕宽度

  const px = (deviceWidth / 375) * Number(rpx);

  return Math.floor(px);
};

/**
 * 类型检查
 * @param obj
 * @returns
 * @example
 * const obj = { a: 1 };
 * isType(obj, 'Object'); // true
 * isType(obj, 'Array'); // false
 * isType(obj, 'Number'); // false
 * isType(obj, 'String'); // false
 * isType(obj, 'Boolean'); // false
 * isType(obj, 'Undefined'); // false
 * isType(obj, 'Null'); // false
 * isType(obj, 'Function'); // false
 * isType(obj, 'RegExp'); // false
 * isType(obj, 'Date'); // false
 * isType(obj, 'Error'); // false
 * isType(obj, 'Symbol'); // false
 * isType(obj, 'Promise'); // false
 * isType(obj, 'Set'); // false
 * isType(obj, 'Map'); // false
 * isType(obj, 'WeakSet'); // false
 * isType(obj, 'WeakMap'); // false
 * isType(obj, 'ArrayBuffer'); // false
 */
export const isType = (obj: any, type: string) => {
  return Object.prototype.toString.call(obj) === `[object ${type}]`;
};

/** 如果是dev 返回true 反之返回false */
export const isDev = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
