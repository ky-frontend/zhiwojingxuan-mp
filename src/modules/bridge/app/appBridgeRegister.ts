import { registerHandler } from './base';

/* --------------- 注册指令app调用 ----------------- */

const appBridgeRegister = {
  /**
   * webview onshow 事件
   * app版本号：>=4.0.0
   * 注意：
   * 1，同一个webview内路由跳转不会触发
   * 2，首次进入webview时app执行WebviewShow方法可能比h5注册WebviewShow方法时机要早，所以首次进入webview时可能不会触发
   */
  webviewShow: (callback: () => void) => {
    return registerHandler('WebviewShow', callback);
  },
  /**
   * webview onhide 事件
   * app版本号：>=4.0.0
   * 注意：
   * 1，同一个webview内路由跳转不会触发
   */
  webviewHide: (callback: () => void) => {
    return registerHandler('WebviewHide', callback);
  },

  /**
   * 支付结果回调
   * @param callback
   */
  payResultCallback: (callback: () => void) => {
    registerHandler('payResultCallback', callback);
  },
};

export default appBridgeRegister;
