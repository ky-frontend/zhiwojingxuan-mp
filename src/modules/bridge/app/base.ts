import device from '@/modules/utils/device';

const isAndroid = device.isAndroid();

// 客户端内
export const IS_IOS_APP = !!window.kyiOS;
export const IS_ANDROID_APP = !!window.kyandroid;

/**
 * Android  与安卓交互时：
 *      1、不调用这个函数安卓无法调用 H5 注册的事件函数；
 *      2、但是 H5 可以正常调用安卓注册的事件函数；
 *      3、还必须在 setupWebViewJavascriptBridge 中执行 bridge.init 方法，否则：
 *          ①、安卓依然无法调用 H5 注册的事件函数
 *          ①、H5 正常调用安卓事件函数后的回调函数无法正常执行
 *
 * @param {*} callback
 */
const androidFunction = (callback: (e: any) => void) => {
  if (window.WebViewJavascriptBridge) {
    callback(window.WebViewJavascriptBridge);
  } else {
    document.addEventListener(
      'WebViewJavascriptBridgeReady',
      function () {
        callback(window.WebViewJavascriptBridge);
      },
      false,
    );
  }
};

/**
 * IOS 与 IOS 交互时，使用这个函数即可，别的操作都不需要执行
 * @param {*} callback
 */
const iosFunction = (callback: (e: any) => void) => {
  if (window.WebViewJavascriptBridge) {
    return callback(window.WebViewJavascriptBridge);
  }
  if (window.WVJBCallbacks) {
    return window.WVJBCallbacks.push(callback);
  }
  window.WVJBCallbacks = [callback];

  if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.iOS_Native_InjectJavascript
  ) {
    window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null);
  }
};
/**
 * 注册 setupWebViewJavascriptBridge 方法
 *  之所以不将上面两个方法融合成一个方法，是因为放在一起，那么就只有 iosFunction 中相关的方法体生效
 */
window.setupWebViewJavascriptBridge = isAndroid ? androidFunction : iosFunction;

if (IS_ANDROID_APP) {
  window.setupWebViewJavascriptBridge(function (bridge: any) {
    // 注册 H5 界面的默认接收函数（与安卓交互时，不注册这个事件无法接收回调函数）
    bridge.init(function (msg: any, responseCallback: any) {
      responseCallback(msg);
    });
  });
} else if (IS_IOS_APP) {
  window.setupWebViewJavascriptBridge();
}

function toJson(obj: any) {
  if (obj && typeof obj === 'object') {
    obj = JSON.stringify(obj);
  }
  return obj;
}

/**
 * 调用app指令
 * @param name 调用名称
 * @param params 参数
 * @returns
 */
export function callHandler(name: string, params?: any): Promise<any> {
  params = toJson(params);
  return new Promise((resolve) => {
    const callback = (data: any) => {
      try {
        data = data && JSON.parse(data);
      } catch (error) {
        data = {};
        console.error(error);
      }
      console.info(`[app指令:${name}返回]:`, data);
      return resolve(data);
    };

    window.setupWebViewJavascriptBridge((bridge: any) => {
      console.warn('[调取app指令]:', name);
      bridge.callHandler(name, params, callback);
    });
  });
}

/**
 * 注册app事件
 * @param {String} name 注册的函数名
 * @param {Function} fn 回调函数
 */
export function registerHandler(name: string, callback: (e: any) => void) {
  window.setupWebViewJavascriptBridge((bridge: any) => {
    bridge.registerHandler(name, (data: any) => {
      try {
        data = data && JSON.parse(data);
      } catch (error) {
        data = {};
        console.error('registerHandler', error);
      }
      callback && callback(data);
    });
  });
}
