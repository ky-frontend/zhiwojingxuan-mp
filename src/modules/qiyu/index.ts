// # 对接类型

// #### 测试环境

// * 营-订单列表 https://practice-test.knowyourself.cc/im?shuntId=1098649
// * 营-帮助中心 https://practice-test.knowyourself.cc/im?shuntId=1099576
// * app-订单详情 https://practice-test.knowyourself.cc/im?shuntId=1099676
// * app-我的 https://practice-test.knowyourself.cc/im?shuntId=1098754
// * app_聊愈 https://practice-test.knowyourself.cc/im?shuntId=1099677
// * KY-公众号 https://zhiwotansuo.qiyukf.com/client?k=b17b7837c7d1fbed61fe2e10d4394d17&wp=1&robotShuntSwitch=0&shuntId=1100653&language=zh-cn
// * 视频号 https://zhiwotansuo.qiyukf.com/client?k=b17b7837c7d1fbed61fe2e10d4394d17&wp=1&robotShuntSwitch=0&shuntId=1099678&language=zh-cn
// * 月食号 https://zhiwotansuo.qiyukf.com/client?k=b17b7837c7d1fbed61fe2e10d4394d17&wp=1&robotShuntSwitch=0&shuntId=1100654&language=zh-cn
// * 默认模板 https://practice-test.knowyourself.cc/im?shuntId=1099677

// #### 线上环境

// * 营-订单列表 https://practice.knowyourself.cc/im?shuntId=1098649
// * 营-帮助中心 https://practice.knowyourself.cc/im?shuntId=1099576
// * app-订单详情 https://practice.knowyourself.cc/im?shuntId=1099676
// * app-我的 https://practice.knowyourself.cc/im?shuntId=1098754
// * app\_聊愈 https://practice.knowyourself.cc/im?shuntId=1099677
// * KY-公众号 https://zhiwotansuo.qiyukf.com/client?k=b17b7837c7d1fbed61fe2e10d4394d17&wp=1&robotShuntSwitch=0&shuntId=1100653&language=zh-cn
// * 视频号 https://zhiwotansuo.qiyukf.com/client?k=b17b7837c7d1fbed61fe2e10d4394d17&wp=1&robotShuntSwitch=0&shuntId=1099678&language=zh-cn
// * 月食号 https://zhiwotansuo.qiyukf.com/client?k=b17b7837c7d1fbed61fe2e10d4394d17&wp=1&robotShuntSwitch=0&shuntId=1100654&language=zh-cn
// * 默认模板 https://practice.knowyourself.cc/im?shuntId=1099677

import Taro from '@tarojs/taro';
import { getEnvConfig } from '@/utils/util';
import { userApi } from '@/services';
import { IS_ANDROID_APP, IS_IOS_APP } from '../bridge/app';
import { loadSdk } from './loadSdk';

interface IIM {
  /** 模板ID */
  shuntId: string;
  /** 是否在APP中 */
  isApp?: boolean;
  /** 发送信息类型  default默认卡片 order 携带order信息， product 携带商品信息 */
  type?: string;
  orderInfo?: any;
  productInfo?: any;
}

/**
 * 跳转七鱼IM
 * @param options
 * @returns
 */
export const goQiyuIm = async (options: IIM) => {
  let info: any = {
    // 判断是否在app中
    isApp: IS_IOS_APP || IS_ANDROID_APP,
    ...options,
    type: 'default',
  };

  // 1098757 默认模板ID
  const defaults = ['1099576', '1098754', '1099677', '1098757'];
  const orders = ['1099676', '1098649'];
  const products = ['1098914'];
  if (options.shuntId) {
    const shuntId = options.shuntId;
    if (defaults.includes(shuntId)) {
      info.type = 'default';
    } else if (orders.includes(shuntId)) {
      info.type = 'order';
    } else if (products.includes(shuntId)) {
      info.type = 'product';
    }
    info.shuntId = shuntId;
  }

  try {
    const { code, data, message } = await userApi.getUserAliasInfo();
    if (code !== 0) {
      Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2000,
      });
      //return Toast.show(message);
    }
    info = {
      ...info,
      id: data.id,
      name: data.name,
      // mobile: data.mobile
    };
  } catch (error) {
    console.log(error);
  } finally {
    if (info.type === 'default' || !info.type) {
      if (window.isSdkReady) {
        sendIm(info);
      } else {
        await loadSdk();
        sendIm(info);
      }
    }
    if (info.type === 'order') {
      if (window.isSdkReady) {
        sendImOrderCard(info);
      } else {
        await loadSdk();
        sendImOrderCard(info);
      }
    }
    if (info.type === 'product') {
      if (window.isSdkReady) {
        sendImProductCard(info);
      } else {
        await loadSdk();
        sendImProductCard(info);
      }
    }
  }
};

const sendIm = (options: any = {}) => {
  if (window.isSdkReady) {
    window.ysf('config', {
      uid: options.id,
      name: options.name,
      shuntId: options.shuntId,
      data: JSON.stringify([
        { key: 'real_name', value: options.name || '' },
        { key: 'mobile_phone', value: options.mobile || '' },
        { key: 'userId', label: '月食ID', value: options.id || '' },
      ]),
      success: function () {
        if (options.isApp) {
          Taro.redirectTo({ url: window.ysf('url') });
          // location.replace(window.ysf('url'));
        } else {
          Taro.redirectTo({ url: window.ysf('url') });
          // location.href = window.ysf('url');
        }
      },
      error: function () {
        console.log('失败');
      },
    });
  }
};

const sendImProductCard = (options: any = {}) => {
  // 当订单信息不存在时跳转到不含订单卡片的页面
  if (!options.productInfo) {
    sendIm(options);
  }
  if (!options.productInfo) {
    sendIm(options);
  }
  const productInfo = options.productInfo;
  if (window.isSdkReady) {
    window.ysf('config', {
      uid: options.id,
      name: options.name,
      shuntId: options.shuntId,
      data: JSON.stringify([
        { key: 'real_name', value: options.name || '' },
        { key: 'mobile_phone', value: options.mobile || '' },
        { key: 'userId', label: '月食ID', value: options.id || '' },
      ]),
      success: function () {
        window.ysf('product', {
          cardType: '0',
          sendByUser: 0,
          show: 0, // 1为打开， 其他参数为隐藏（包括非零元素）
          showCustomMsg: 1,
          title: productInfo.title,
          desc: productInfo.desc,
          picture: productInfo.picture,
          note: productInfo.note,
          url: productInfo.url,
          goodsId: productInfo.goodsId,
          success: function () {
            if (options.isApp) {
              Taro.redirectTo({ url: window.ysf('url') });
              // location.replace(window.ysf('url'));
            } else {
              Taro.redirectTo({ url: window.ysf('url') });
              // location.href = window.ysf('url');
            }
          },
        });
      },
      error: function () {
        console.log('失败');
      },
    });
  }
};

const sendImOrderCard = (options: any = {}) => {
  // 当订单信息不存在时跳转到不含订单卡片的页面
  if (!options.orderInfo) {
    sendIm(options);
  }
  const orderInfo = options.orderInfo;
  if (window.isSdkReady) {
    window.ysf('config', {
      uid: options.id,
      name: options.name,
      shuntId: options.shuntId,
      data: JSON.stringify([
        { key: 'real_name', value: options.name || '' },
        { key: 'mobile_phone', value: options.mobile || '' },
        { key: 'userId', label: '月食ID', value: options.id || '' },
      ]),
      success: function () {
        window.ysf('product', {
          cardType: '1',
          sendByUser: 0,
          show: 0, // 1为打开， 其他参数为隐藏（包括非零元素）
          title: orderInfo.title,
          desc: orderInfo.desc || '',
          picture: orderInfo.picture,
          note: orderInfo.note || '',
          url: orderInfo.url,
          orderId: orderInfo.orderId,
          showCustomMsg: 1,
          success: function () {
            if (options.isApp) {
              Taro.redirectTo({ url: window.ysf('url') });
              // location.replace(window.ysf('url'));
            } else {
              Taro.redirectTo({ url: window.ysf('url') });
              // location.href = window.ysf('url');
            }
          },
        });
      },
      error: function () {
        console.log('失败');
      },
    });
  }
};

export const goQiYuLink = (shuntId: string) => {
  let mUrl = `${getEnvConfig().M_URL}/qiYuIm`;
  if (shuntId) {
    mUrl = mUrl + `?shuntId=${shuntId}`;
  }
  mUrl = encodeURIComponent(mUrl);
  Taro.redirectTo({
    url: `/subWebview/pages/webviewV1/index?url=${mUrl}`,
  });
};
