import Taro from '@tarojs/taro';
import { DomainKey } from '@ky-frontend/common';
import { KYLoading } from '@/components/KYLoading';
import { replaceTo } from '@/utils/navigate';
import { getEnvConfig } from '@/utils/util';
import { VERSION } from '@/constants';
import UserApi from './user.api';
import { GatewayUtil } from '../utils/gateway.util';
import ExamApi from './exam.api';
import PlatformApi from './platform.api';
import ConsultantApi from './consultant.api';
import CounsellingApi from './counselling.api';
import OrderApi from './order.api';
import MarketingApi from './marketing.api';
import ExtraApi from './extra.api';
import PaymentApi from './payment.api';
import Notification from './notification.api';
import WalletApi from './wallet.api';
import ChannelApi from './channel.api';
import CoachApi from './coach.api';
import HomeApi from './home.api';

// const env = Taro.getStorageSync('ENV');

const gateway = GatewayUtil.createGateway({
  // baseURL: env == 'dev2' ? API_BASE_URL_DEV2 : API_BASE_URL,
  // baseURL: process.env.NODE_ENV === 'development' ? API_BASE_URL_DEV2 : API_BASE_URL,
  // 仅测试用
  baseURL: getEnvConfig().API_URL,
  headers: {
    'x-appid': 2048,
    'x-version': VERSION,
  },
  loginLoseEffect: () => {
    Taro.showToast({
      title: '登录过期，请重新登录',
      icon: 'error',
    });
    const env = Taro.getStorageSync('ENV_CONFIG');
    Taro.clearStorageSync();
    Taro.setStorageSync('ENV_CONFIG', env);
    // Taro.redirectTo({ url: '/pages/login/index' });
    replaceTo('/pages/login/index');
  },
  interceptorsResponse: (resp: any) => {
    // 获取当前链接去登录，登录成功后跳转回当前页面
    if (resp?.data?.code === 2 && resp?.data?.domain === DomainKey.Base) {
      const env = Taro.getStorageSync('ENV_CONFIG');
      Taro.clearStorageSync();
      Taro.setStorageSync('ENV_CONFIG', env);
      // Taro.redirectTo({ url: '/pages/login/index' });
      replaceTo('/pages/login/index');
    }
    if (resp?.data?.code !== 0) {
      const message = resp?.data?.message;
      // message 可能是个{}对象
      // Toast.show(typeof message === 'string' ? message : '接口请求失败');
      Taro.showToast({
        title: typeof message === 'string' ? message : '接口请求失败',
        icon: 'none',
      });
      KYLoading.hide();
    }
    return resp;
  },
} as any);

const userApi = new UserApi(gateway);
const examApi = new ExamApi(gateway);
const platformApi = new PlatformApi(gateway);
const consultantApi = new ConsultantApi(gateway);
const counsellingApi = new CounsellingApi(gateway);
const orderApi = new OrderApi(gateway);
const marketingApi = new MarketingApi(gateway);
const extraApi = new ExtraApi(gateway);
const walletApi = new WalletApi(gateway);
const paymentApi = new PaymentApi(gateway);
const notificationApi = new Notification(gateway);
const channelApi = new ChannelApi(gateway);
const coachApi = new CoachApi(gateway);
const homeApi = new HomeApi(gateway);

export {
  userApi,
  examApi,
  platformApi,
  consultantApi,
  counsellingApi,
  orderApi,
  marketingApi,
  extraApi,
  paymentApi,
  notificationApi,
  walletApi,
  channelApi,
  coachApi,
  homeApi,
};
