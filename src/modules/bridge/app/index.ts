import appBridgeCall from './appBridgeCall';
import appBridgeRegister from './appBridgeRegister';

// 客户端内
export const IS_IOS_APP = !!window.kyiOS;
export const IS_ANDROID_APP = !!window.kyandroid;

export default {
  ...appBridgeCall,
  ...appBridgeRegister,
  inApp: () => {
    return IS_IOS_APP || IS_ANDROID_APP;
  },

  /**
   * 跳转原生路由
   */
  hrefToApp: (path: string) => {
    if (path.indexOf('/') === 0) {
      path = path.substring(1);
    }
    window.location.href = `kycc://app.know.org/${path}`;
  },

  // 获取APP信息.
  getAppInfo: () => {
    const reg = /kyApp\/(\d\.\d{1,2}\.\d{1,2})\/(\w+)\/(\d)/g;
    const u = (window.KY_APP_USERAGENT || ' ') + ' ' + navigator.userAgent;
    console.log('u', u);
    const res = reg.test(u);
    const name = 'kyApp';
    let version = '';
    let env = '';
    let appId = '';
    if (res) {
      version = RegExp.$1;
      env = RegExp.$2;
      appId = RegExp.$3;
    }
    return {
      name,
      version,
      env,
      appId,
    };
  },
};
