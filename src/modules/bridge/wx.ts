import wx from 'weixin-js-sdk';
import Taro from '@tarojs/taro';
import { platformApi, userApi } from '@/services';
import device from '@/modules/utils/device';
import { TITLE, DESC, LOGO, SOURCE_UNION_PLAN, WX_TOKEN } from '@/constants/values';
import { getLocalStorageWithExpiry, isPrd, setLocalStorageWithExpiry } from '@/utils/util';
import { getQuery, navigateTo } from '../utils/navigate';

export interface ShareConfig {
  title?: string;
  desc?: string;
  link?: string;
  imgUrl?: string;
}

type fnc = () => void;

/**
 * 微信jsBridge
 */
class WxBridge {
  ready = false;
  taskQueue: fnc[] = [];
  defaultShareData: ShareConfig = {
    title: TITLE,
    imgUrl: LOGO,
    desc: DESC,
    link: window.location.href,
  };

  /**
   * 初始化微信jsBridge
   */
  public async init() {
    if (!device.isWechat()) {
      return;
    }
    // this.getWxConfig();
    await this.getOldSystemWxConfig();

    wx.ready((res: any) => {
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      console.log('ready---------', res);
      this.ready = true;
      this.execTaskQueue();
    });

    wx.error(function (res: any) {
      // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      console.log('error---------', res);
    });
  }

  /**
   * 获取微信配置信息
   */
  public async getWxConfig() {
    const params = {
      debug: false,
      jsApiList: [
        'checkJsApi',
        'updateAppMessageShareData', // 分享到朋友和QQ
        'updateTimelineShareData', // 分享到 QQ空间和 朋友圈
        'showAllNonBaseMenuItem',
        'hideAllNonBaseMenuItem',
      ],
      url: window.location.href,
    };
    const res = await userApi.getWxConfig(params);
    if (res.code === 0) {
      const { data } = res;
      wx.config({
        debug: data.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: data.appId, // 必填，公众号的唯一标识
        timestamp: data.timestamp, // 必填，生成签名的时间戳
        nonceStr: data.nonceStr, // 必填，生成签名的随机串
        signature: data.signature, // 必填，签名
        jsApiList: data.jsApiList, // 必填，需要使用的JS接口列表
      });
    }
    return res;
  }

  public async getOldSystemWxConfig() {
    const params = {
      source: 20,
      debug: false,
      jsApiList: [
        'checkJsApi',
        'updateAppMessageShareData', // 分享到朋友和QQ
        'updateTimelineShareData', // 分享到 QQ空间和 朋友圈
        'showAllNonBaseMenuItem',
        'hideAllNonBaseMenuItem',
      ],
      url: window.location.href,
    };

    const res = await platformApi.GetWeChatJsConfig(params);
    if (res.code === 0) {
      const wxConfig = res.data;
      console.log('appid', wxConfig.appId);

      wx.config({
        debug: wxConfig.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: wxConfig.appId, // 必填，公众号的唯一标识
        timestamp: wxConfig.timestamp, // 必填，生成签名的时间戳
        nonceStr: wxConfig.nonceStr, // 必填，生成签名的随机串
        signature: wxConfig.signature, // 必填，签名
        jsApiList: wxConfig.jsApiList, // 必填，需要使用的JS接口列表
      });
    }
  }

  public share(data: ShareConfig = {} as ShareConfig) {
    if (!device.isWechat()) {
      return;
    }
    const shareData = {
      ...this.defaultShareData,
      ...data,
    };

    const shareFn = () => {
      this.shareTimeline(shareData);
      this.shareFriend(shareData);
    };

    if (this.ready) {
      shareFn();
    } else {
      this.taskQueue.push(shareFn);
    }
  }

  private execTaskQueue() {
    let tmp = this.taskQueue.slice(0);
    this.taskQueue = [];
    tmp.forEach((fn) => fn());
    tmp = [];
  }

  /**
   * 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
   * @param data
   */
  public shareTimeline(data: ShareConfig) {
    return new Promise((resolve) => {
      //需在用户可能点击分享按钮前就先调用
      wx.updateTimelineShareData({
        title: data.title, // 分享标题
        link: data.link || location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: data.imgUrl, // 分享图标
        success: (res: any) => {
          console.log('updateTimelineShareData', res);
          resolve(res);
        },
        fail: (err: any) => {
          console.log('err:updateTimelineShareData', err);
          resolve(0);
        },
      });
    });
  }

  /**
   * 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
   * @param data
   */
  public shareFriend(data: ShareConfig) {
    return new Promise((resolve) => {
      //需在用户可能点击分享按钮前就先调用
      wx.updateAppMessageShareData({
        title: data.title, // 分享标题
        desc: data.desc, // 分享描述
        link: data.link || location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: data.imgUrl, // 分享图标
        success: (res: any) => {
          console.log('updateAppMessageShareData', res);
          resolve(res);
        },
        fail: (err: any) => {
          console.log('err:updateAppMessageShareData', err);
          resolve(0);
        },
      });
    });
  }

  /**
   * 微信支付
   * @param data
   */
  public pay(data: any) {
    return new Promise((resolve) => {
      wx.chooseWXPay({
        timestamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success: (res: any) => {
          console.log('chooseWXPay', res);
          resolve(res);
        },
        fail: (err: any) => {
          console.log('err:chooseWXPay', err);
          resolve(0);
        },
      });
    });
  }

  /**
   * 获取微信token
   */
  public getWxToken(url?: string) {
    if (!device.isWechat()) {
      Taro.showToast({
        title: '请复制地址在微信内打开，进行尝试',
        icon: 'none',
        duration: 2000,
      });
      return null;
    }
    // 微信内查看是否携带微信token
    let wxToken = getQuery('token');
    const localToken = getLocalStorageWithExpiry(WX_TOKEN);
    console.log('wx', wxToken, localToken);
    if (wxToken) {
      // 应该是7200s 但是为了准确故按照7000s计算
      // setLocalStorageWithExpiry(WX_TOKEN, { token: wxToken }, 7000 * 1000);
      setLocalStorageWithExpiry(WX_TOKEN, { token: wxToken }, 3 * 60 * 1000);
      return wxToken;
    } else if (localToken && localToken.token) {
      wxToken = localToken.token;
      return wxToken;
    } else {
      this.getWxAuth(url);
      return null;
    }
    // 微信内查看是否携带微信token
    // const wxToken = getQuery('token') || localStorage.getItem(WX_TOKEN);
    // if (wxToken) {
    //   // localStorage.setItem(WX_TOKEN, wxToken);
    //   setLocalStorageWithExpiry(WX_TOKEN, { token: wxToken });
    //   return wxToken;
    // } else {
    //   this.getWxAuth(url);
    //   return null;
    // }
  }

  /**
   * 授权登录
   */
  public getWxAuth(url?: string) {
    localStorage.removeItem(WX_TOKEN);
    const source = SOURCE_UNION_PLAN;
    const _url = encodeURIComponent(url || location.href);
    navigateTo(
      `http://wx${
        isPrd() ? '' : '-test'
      }.knowyourself.cc/wechat/oauth?source=${source}&url=${_url}`,
    );
  }
}

const wxBridge = new WxBridge();

export default wxBridge;
