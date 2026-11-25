import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Text } from '@tarojs/components';
import { KYTrack } from '@/modules/track';
import {
  T_CounselingOrderPayResult,
  T_ConsultantOrderPayResult,
  T_ConsultantOrderPageView,
} from '@/modules/track/events';
import KYNumber from '@/components/KYNumber';
import { CONFIRM_ORDER_INFO, USER_INFO, USER_OPENID } from '@/constants/values';
import { isType } from '@/modules/utils/tools';
import {
  coachApi,
  consultantApi,
  counsellingApi,
  courseApi,
  marketingApi,
  orderApi,
  paymentApi,
  walletApi,
} from '@/services';
import { KYLoading } from '@/components/KYLoading';
import { AppItemKeyTypeEnum, AppKeyTypeEnum } from '@ky-frontend/common';
import { gotoLogin } from '@/utils/identity';
import {
  MarketingPolicyType,
  PaymentChannelType,
  PaymentModeType,
  PreferentialWayEnum,
} from '@ky-client/exam-type';
import {
  currentPageRouteParams,
  getCurrentFullRoute,
  navigateTo,
  replaceTo,
} from '@/utils/navigate';
import { ImgUrlFormat, formatPrice } from '@/modules/utils/format';
import storage from '@/modules/utils/storage';
import classNames from 'classnames';
import { CounsellingItemKeyEnum } from '@ky-client/counselling-type';
import { OrderCreateRequestType } from '@ky-middleground/order-type';
import { AppKeyEnum } from '@ky-middleground/commodity-type';
import { MarketingModelType } from '@ky-middleground/marketing-type';
import CouponModal from '../userInfo/consultant/components/CouponModal';
import styles from './index.module.less';

type IProps = {};

type IStates = {
  isAgree: boolean;
  extra: any;
  productInfo: any;
  paymentAmount: number;
  initLoading: boolean;
  orderId: string;
  userInfo: any;
  // 是否微信支付
  isWeChatCheck: boolean;
  // 是否月亮币支付
  isMoonCheck: boolean;
  // 月亮币余额
  balance: number;
  couponAmount: number;

  isShowCouponModal: boolean;
  policy: MarketingPolicyType[];
  useCoupon: boolean;
  // 是否有优惠券,区别于useCoupon， 这个用来记录优惠卷初始状态，因为选择优惠充时卡的时候会更改useCoupon，单纯看useCoupon这个字段辨别不了。
  isHaveCoupon: boolean;
  // 即时咨询优惠充时卡余额
  storageCardBalance: number;
  // 优惠充时卡是否选中
  isStorageCardCheck: boolean;
};

// 协议相关map
const protocolMap = {
  [AppKeyTypeEnum.Zxs]: {
    default: {
      protocolId: 'zixunfuwuzhiqingtongyishu',
      text: '《心理咨询服务知情同意书》',
    },
  },
  [AppKeyTypeEnum.Ly]: {
    default: {
      protocolId: 'newzhiqingfuwutongyishu',
      text: '《聊愈服务知情同意书》',
    },
    [AppItemKeyTypeEnum.LyCard]: {
      protocolId: 'jishizixunchuzhikaxieyi',
      text: '《即时咨询优惠充时卡服务协议》',
    },
  },
  ['coach']: {
    default: {
      protocolId: 'xinlijiaolianfuwuxieyi',
      text: '《心理教练服务协议》',
    },
  },
};

@inject('store')
@observer
class ConfirmOrder extends BaseKyComponent<IProps, IStates> {
  state = {
    isAgree: false,
    extra: {} as any,
    productInfo: null as any,
    paymentAmount: 0,
    initLoading: true,
    orderId: '',
    policy: [] as MarketingPolicyType[],
    couponAmount: -1,
    userInfo: null as any,
    isWeChatCheck: true,
    isMoonCheck: false,
    balance: 0,
    availableCouponList: [],
    unavailableCouponList: [],
    isShowCouponModal: false,
    useCoupon: false,
    isHaveCoupon: false,
    storageCardBalance: 0,
    isStorageCardCheck: false,
  };
  payLock = false;
  confirmOrderInfoData: any = {};
  sourceParams: any = {};
  get ciStore() {
    return this.store.consultantIndexStore;
  }

  async componentDidMount() {
    this.handleUrlParams();
    this.getUserBalance();
    // const res = await userApi.getCountryCodeList();
    this.confirmOrderInfoData = Taro.getStorageSync(CONFIRM_ORDER_INFO);
    // 如果是聊愈单就请求余额
    if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Ly) {
      this.checkStorageCard();
    }
    const userInfo = await storage.getItem(USER_INFO);
    if (userInfo && userInfo.id) {
      if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Zxs) {
        const consultationAgreementStatus = Taro.getStorageSync(
          `ConsultationAgreement_${userInfo.id}`,
        );
        this.setState({
          isAgree: consultationAgreementStatus === 'true',
          userInfo,
        });
      } else if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Ly) {
        // 如果不是买疗愈优惠充时卡的情况， 就要算优惠
        if (this.confirmOrderInfoData.appItemKey !== AppItemKeyTypeEnum.LyCard) {
          const counsellingAgreementStatus = Taro.getStorageSync(
            `CounsellingAgreement_${userInfo.id}`,
          );

          const keys = Object.keys(this.confirmOrderInfoData.selectProduct);
          if (!keys.includes('activity')) {
            const { data: coupon } = await marketingApi.getMaxCoupon(
              this.confirmOrderInfoData.selectProduct.appItemKey,
              this.confirmOrderInfoData.selectProduct.productId,
            );

            const policy: MarketingPolicyType[] = [];
            let price = 0;
            if (coupon['jsth'] != null) {
              policy.push({
                type: 'coupon' as PreferentialWayEnum.Coupon,
                item: {
                  userCouponId: coupon['jsth'].userCouponId,
                  couponCode: coupon['jsth'].couponCode,
                  count: 1,
                  couponName: coupon['jsth'].couponName,
                },
              });
              price = coupon['jsth'].amount;
              this.setState({ policy, couponAmount: price, useCoupon: true, isHaveCoupon: true });
            } else if (coupon['jswzcs'] != null) {
              policy.push({
                type: 'coupon' as PreferentialWayEnum.Coupon,
                item: {
                  userCouponId: coupon['jswzcs'].userCouponId,
                  couponCode: coupon['jswzcs'].couponCode,
                  count: 1,
                  couponName: coupon['jswzcs'].couponName,
                },
              });
              price = coupon['jswzcs'].amount;
              this.setState({ policy, couponAmount: price, useCoupon: true, isHaveCoupon: true });
            }
          } else {
            // 如果有activity 字段说明有折扣
            const policy: MarketingPolicyType[] = [
              {
                type: 'discount' as PreferentialWayEnum.Discount,
                item: {
                  activityId: this.confirmOrderInfoData.selectProduct?.activity?.activityId || '',
                },
              },
            ];
            this.setState({ policy });
          }

          this.setState({
            isAgree: counsellingAgreementStatus === 'true',
            userInfo,
          });
        }

        // 如果是疗愈优惠充时卡的情况， 不用算优惠卷
        if (this.confirmOrderInfoData.appItemKey === AppItemKeyTypeEnum.LyCard) {
          this.setState({
            userInfo,
          });
        }
      }
    }

    if (!this.confirmOrderInfoData) {
      Taro.showToast({
        title: '参数错误',
        icon: 'none',
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
      return;
    }

    const { appKey, appItemKey, productId, extra } = this.confirmOrderInfoData;
    if (isType(extra, 'Object')) {
      this.setState({ extra });
    }
    KYLoading.show();
    const res = await this.getProductInfo();
    KYLoading.hide();
    console.log('test+++++++++++++++++++++++123');
    if (res?.code === 0) {
      const productInfo: any = res.data || {};

      console.log('test+++++++++++++++++++++++123productInfo', productInfo);
      productInfo.appKey = appKey;
      productInfo.appItemKey = appItemKey;
      let paymentAmount = 0;
      switch (productInfo.appKey) {
        case AppKeyTypeEnum.Zxs: {
          productInfo.productId = productId;
          productInfo.image = productInfo.headImage;
          productInfo.originPrice = productInfo.price;
          // productInfo.name = productInfo.productName ?? '50分钟单次咨询';
          productInfo.name =
            productInfo.appItemKey === AppItemKeyTypeEnum.Partner
              ? '伴侣咨询'
              : productInfo.appItemKey === AppItemKeyTypeEnum.Zxs
                ? '个人咨询'
                : '';
          paymentAmount = productInfo.price;
          productInfo._skuInfo = {
            skuId: productInfo.skuInfo.skuId,
            price: productInfo.skuInfo.price,
          };
          break;
        }
        case AppKeyTypeEnum.Ly: {
          // 如果是买的优惠充时卡的情况
          if (productInfo.appItemKey === AppItemKeyTypeEnum.LyCard) {
            productInfo.name = productInfo.productName;
            productInfo.image = productInfo.productImage;
            productInfo.originPrice = productInfo.money;
            paymentAmount = productInfo.money;
            productInfo._skuInfo = productInfo.skuInfo || {};
            break;
          }
          const { productData, paymentPrice } = this.confirmOrderInfoData;
          productInfo.productId = productData.productDetail.productId;
          productInfo.image = 'https://cdn-public.knowyourself.cc/icon/liaoyu/chat_20230316.png';
          productInfo.name = productData.productDetail.appName || '';
          paymentAmount = paymentPrice;
          break;
        }
        case 'coach': {
          // 心理教练
          productInfo.productId = productId;
          productInfo.image = extra.coachImage;
          productInfo.originPrice = productInfo.price;
          productInfo.name = productInfo.productName;
          paymentAmount = productInfo.price;
          productInfo._skuInfo = {
            skuId: productInfo.skuInfo.skuId,
            price: productInfo.skuInfo.price,
          };
          break;
        }
        case AppKeyTypeEnum.External: {
          // KY 课（短链卖课）
          productInfo.productId = productInfo.productInfo.id;
          productInfo.image = productInfo.productInfo.headImage;
          productInfo.originPrice = productInfo.skuInfo.referencePrice;
          paymentAmount = productInfo.skuInfo.price;
          productInfo.name = productInfo.productInfo.name;
          productInfo._skuInfo = productInfo.skuInfo || {};
          break;
        }
      }
      this.setState({
        productInfo,
        paymentAmount,
        initLoading: false,
      });
    }

    if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Ly) {
      if (this.confirmOrderInfoData.appItemKey !== AppItemKeyTypeEnum.LyCard) {
        // 埋点: 浏览聊愈下单页面
        KYTrack(
          T_ConsultantOrderPageView({
            consultant_id: this.confirmOrderInfoData.extra.doctorId,
            consultant_name: '',
            consultant_state: '',
          }),
        );
      }
    }
  }

  /**
   * 处理渠道的参数
   */
  handleUrlParams() {
    const queryInfo = currentPageRouteParams();
    if (queryInfo.utm_campaign) {
      this.sourceParams['utmCampaign'] = queryInfo.utm_campaign;
    }
    if (queryInfo.utm_source) {
      this.sourceParams['utmSource'] = queryInfo.utm_source;
    }
    if (queryInfo.utm_medium) {
      this.sourceParams['utmMedium'] = queryInfo.utm_medium;
    }
    if (queryInfo.utm_term) {
      this.sourceParams['utmTerm'] = queryInfo.utm_term;
    }
    if (queryInfo.utm_content) {
      this.sourceParams['utmContent'] = queryInfo.utm_content;
    }
    console.log('sourceParams', this.sourceParams);
  }

  async getProductInfo() {
    let res = null as any;
    const { appKey, productId, appItemKey } = this.confirmOrderInfoData;

    if (appKey === AppKeyTypeEnum.Zxs) {
      res = await consultantApi.getProductInfo(productId);
    } else if (appKey === AppKeyTypeEnum.Ly) {
      // 如果是疗愈并且是优惠充时卡的时候
      if (appItemKey === AppItemKeyTypeEnum.LyCard) {
        res = await counsellingApi.cardProductInfo(productId);
        console.log('优惠充时卡产品信息============', res);
      } else {
        res = {
          code: 0,
          data: null,
        };
      }
    } else if (appKey === 'coach') {
      res = await coachApi.getProductInfo(productId);
      // 教练
    } else if (
      appKey === AppKeyTypeEnum.External ||
      appKey === AppKeyEnum.External ||
      appItemKey === AppItemKeyTypeEnum.Course
    ) {
      // KY 课
      res = await courseApi.getKYProductDetail(productId);
    }
    return res;
  }

  async getUserBalance() {
    const res = await walletApi.getUserBalance();
    if (res.code === 0) {
      this.setState({
        balance: res.data.balance,
      });
    }
  }

  /**
   * 查看是否开了即时咨询优惠充时卡,开了就查询余额
   */
  checkStorageCard = async () => {
    const { code, data } = await counsellingApi.cardInfo();
    if (code === 0 && data !== null) {
      this.setState({ storageCardBalance: data.balanceMoney });
    }
  };

  orderCheck = async (info: { appKey: string; appItemKey: string }) => {
    try {
      if (info.appKey === AppKeyTypeEnum.Zxs) {
        const res = await consultantApi.orderCheck((this.state.extra as any)?.counselorId || '');
        if (res.code === 0) {
          return true;
        } else {
          return false;
        }
      } else if (
        info.appKey === AppKeyTypeEnum.Ly &&
        info.appItemKey !== AppItemKeyTypeEnum.LyCard
      ) {
        const res = await counsellingApi.OrderBeforeCreate({
          doctorId: this.state.extra?.doctorId || '',
          appItemKey: info.appItemKey as CounsellingItemKeyEnum,
        });
        if (res.code === 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  /**
   * 点击立即支付
   * @returns
   */
  onPay = async (orderId?: string) => {
    const {
      isAgree,
      productInfo,
      isMoonCheck,
      isWeChatCheck,
      isStorageCardCheck,
      storageCardBalance,
    } = this.state;
    if (!isMoonCheck && !isWeChatCheck && !isStorageCardCheck) {
      Taro.showToast({
        title: '请选择支付方式',
        icon: 'none',
      });
      return;
    }

    if (productInfo.appItemKey === AppKeyTypeEnum.Zxs && !isAgree) {
      Taro.showToast({
        title: '请先同意《心理咨询服务知情同意书》',
        icon: 'none',
      });
      return;
    }

    if (productInfo.appKey === AppKeyTypeEnum.Ly && !isAgree) {
      if (productInfo.appItemKey === AppItemKeyTypeEnum.LyCard) {
        Taro.showToast({
          title: '请先同意《即时咨询卡服务协议》',
          icon: 'none',
        });
        return;
      } else {
        Taro.showToast({
          title: '请先同意《聊愈服务知情同意书》',
          icon: 'none',
        });
        return;
      }
    }
    if (productInfo.appKey === 'coach' && !isAgree) {
      Taro.showToast({
        title: '请先同意《心理教练服务协议》',
        icon: 'none',
      });
      return;
    }

    // 判断优惠充时卡余额, 如果1.是聊愈单2.并且不是买的优惠充时卡3.并且开通了优惠充时卡4.并且余额不足
    if (
      productInfo.appKey === AppKeyTypeEnum.Ly &&
      productInfo.appItemKey !== AppItemKeyTypeEnum.LyCard &&
      isStorageCardCheck &&
      storageCardBalance < this.confirmOrderInfoData.selectProduct.money
    ) {
      Taro.showToast({
        title: '余额不足，请切换其他支付方式',
        icon: 'none',
      });
      return;
    }

    const orderCheckStatus = await this.orderCheck({
      appKey: productInfo.appKey,
      appItemKey: productInfo.appItemKey,
    });
    if (!orderCheckStatus) {
      return;
    }

    const paymentChannelDeal: PaymentChannelType = (() => {
      if (isWeChatCheck) return 'WECHAT';
      if (isMoonCheck) return 'YUELIANGBI';
      if (isStorageCardCheck) return 'LYCARD';
      // 默认返回
      return 'ALIPAY';
    })();

    const paymentInfoArr = [
      {
        paymentChannel: paymentChannelDeal, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE' ｜ "LYCARD";
        paymentMode: isWeChatCheck || isStorageCardCheck ? ('JSAPI' as PaymentModeType) : 'BALANCE', // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: this.calculateOrderAmount(),
      },
    ];
    let params: OrderCreateRequestType = null as any;

    if (productInfo.appKey === AppKeyTypeEnum.Ly) {
      const { extra, items } = this.confirmOrderInfoData;
      if (productInfo.appItemKey === AppItemKeyTypeEnum.LyCard) {
        params = {
          /** 优惠券信息 */
          marketingPolicy: [],
          /** 订单来源 1购买 2赠送 */
          orderSource: '1',
          /** 商品信息*/
          items: [
            {
              productDetail: {
                appKey: productInfo.appKey,
                appItemKey: productInfo.appItemKey,
                appName: productInfo.name || '',
                productId: productInfo.productId,
                image: productInfo.image,
              },
              skuId: productInfo._skuInfo.skuId,
              skuPrice: productInfo._skuInfo.price,
              skuCount: 1,
              /** 关联id */
              relationId: '',
            },
          ],
          /** 支付信息*/
          paymentInfo: paymentInfoArr,
          extra,
          ...this.sourceParams,
        };
      } else {
        params = {
          /** 优惠券信息  优惠充时卡可以享受折扣但是不能享受优惠券,这里判断如果选中优惠充时卡支付并且没有折扣的时候，这里传空，就是扣原价*/
          marketingPolicy:
            isStorageCardCheck && !this.confirmOrderInfoData.selectProduct?.activity
              ? []
              : this.state.policy,
          /** 订单来源 1购买 2赠送 */
          orderSource: '1',
          /** 商品信息*/
          items,
          /** 支付信息*/
          paymentInfo: paymentInfoArr,
          extra,
          activityAliasId: extra.doctorId,
          ...this.sourceParams,
        };
      }
    } else if (
      productInfo.appItemKey === AppItemKeyTypeEnum.Zxs ||
      productInfo.appItemKey === AppItemKeyTypeEnum.Partner
    ) {
      params = {
        /** 优惠券信息 */
        marketingPolicy: [],
        /** 订单来源 1购买 2赠送 */
        orderSource: '1',
        /** 商品信息*/
        items: [
          {
            productDetail: {
              appKey: productInfo.appKey,
              appItemKey: productInfo.appItemKey,
              appName: productInfo.name || '',
              productId: productInfo.productId,
              image: productInfo.image,
            },
            skuId: productInfo._skuInfo.skuId,
            skuPrice: productInfo._skuInfo.price,
            skuCount: 1,
            /** 关联id */
            relationId: '',
          },
        ],
        /** 支付信息*/
        paymentInfo: paymentInfoArr,
        extra: {
          // 额外信息
          productId: productInfo.productId,
          productName: productInfo.name,
          ...this.state.extra,
        },
        ...this.sourceParams,
      };
    } else if (productInfo.appKey === 'coach') {
      params = {
        /** 优惠券信息 */
        marketingPolicy: [],
        /** 订单来源 1购买 2赠送 */
        orderSource: '1',
        /** 商品信息*/
        items: [
          {
            productDetail: {
              appKey: productInfo.appKey,
              appItemKey: productInfo.appItemKey,
              appName: productInfo.name || '',
              productId: productInfo.productId,
              image: productInfo.image,
            },
            skuId: productInfo._skuInfo.skuId,
            skuPrice: productInfo._skuInfo.price,
            skuCount: 1,
            /** 关联id */
            relationId: '',
          },
        ],
        /** 支付信息*/
        paymentInfo: paymentInfoArr,
        extra: {
          // 额外信息
          productId: productInfo.productId,
          productName: productInfo.name,
          outName: productInfo.outName,
          ...this.state.extra,
        },
        ...this.sourceParams,
      };
    } else if (
      productInfo.appKey === AppKeyTypeEnum.External ||
      productInfo.appKey === AppKeyEnum.External ||
      productInfo.appItemKey === AppItemKeyTypeEnum.Course
    ) {
      // KY 课
      params = {
        marketingPolicy: [],
        orderSource: '1',
        items: [
          {
            productDetail: {
              appKey: productInfo.appKey,
              appItemKey: productInfo.appItemKey,
              appName: productInfo.name || '',
              productId: productInfo.productId,
              image: productInfo.image,
            },
            skuId: productInfo._skuInfo.skuId,
            skuPrice: productInfo._skuInfo.price,
            skuCount: 1,
            relationId: '',
          },
        ],
        paymentInfo: paymentInfoArr,
        extra: {
          productId: productInfo.productId,
          productName: productInfo.name,
          ...this.state.extra,
        },
        ...this.sourceParams,
      };
    }

    // 支付按钮加锁
    if (this.payLock) return;
    this.payLock = true;

    if (orderId) {
      this.getPayInfo(orderId);
    } else {
      // 创建订单
      KYLoading.show();
      const res = await orderApi.createOrder(params);
      if (res.code === 0) {
        const { orderId: orderId2 } = res.data;
        this.getPayInfo(orderId2);
      } else {
        this.payLock = false;
        KYLoading.hide();
      }
    }
  };

  /**
   * 咨询师信息
   */
  getScheduleTime = () => {
    let scheduleTime = '';
    if (this.state.productInfo.appItemKey === AppItemKeyTypeEnum.Partner) {
      scheduleTime = (this.state.extra as any)?.scheduleTime.split('-')[0];
    } else {
      scheduleTime = (this.state.extra as any)?.scheduleTime;
    }
    return scheduleTime;
  };

  goLink() {
    const { appKey, extra, appItemKey } = this.confirmOrderInfoData;
    if (appKey === AppKeyTypeEnum.Zxs) {
      // 延迟跳转, 否则咨询页查询tipbar接口有问题
      setTimeout(() => {
        // Taro.redirectTo({ url: '/subConsultant/pages/index/index' });
        replaceTo(`/subConsultant/pages/index/index`);
      }, 2500);
    } else if (appKey === AppKeyTypeEnum.Ly) {
      if (appItemKey === AppItemKeyTypeEnum.LyCard) {
        setTimeout(() => {
          // Taro.redirectTo({ url: `/subCounselling/pages/index/index` });
          replaceTo(`/subCounselling/pages/index/index`);
        }, 2000);
      } else {
        setTimeout(() => {
          // Taro.redirectTo({ url: `/subCounselling/pages/chat/index?doctorId=${extra.doctorId}` });
          replaceTo(`/subCounselling/pages/chat/index`, {
            doctorId: extra.doctorId,
          });
        }, 2000);
      }
    } else if (appKey === 'coach') {
      Taro.redirectTo({
        url:
          '/subCommon/pages/payResult/index?customService=1&appkey=coach&productId=' +
          extra.productId +
          '&coachId=' +
          extra.coachId,
      });
    } else if (
      appKey === AppKeyTypeEnum.External ||
      appKey === AppKeyEnum.External ||
      appItemKey === AppItemKeyTypeEnum.Course
    ) {
      const productId =
        this.state.productInfo?.productId || this.confirmOrderInfoData.productId || '';
      Taro.redirectTo({
        url: `/subCommon/pages/payResult/index?type=course&Id=${productId}`,
      });
    }
  }

  /**
   * 获取支付信息
   */
  getPayInfo = async (orderId: string) => {
    this.payLock = true;
    const { isWeChatCheck, isMoonCheck, isStorageCardCheck, paymentAmount } = this.state;
    const payerChannelId = Taro.getStorageSync(USER_OPENID);
    if (!payerChannelId) {
      Taro.showToast({
        title: '未获取到用户支付id，请重新登录',
        icon: 'none',
      });
      setTimeout(() => {
        Taro.clearStorageSync();
        // Taro.redirectTo({ url: '/pages/login/index' });
        const currentPath = getCurrentFullRoute();
        gotoLogin(false, currentPath);
      }, 1500);
    }
    const paymentChannelDeal: PaymentChannelType = (() => {
      if (isWeChatCheck) return 'WECHAT';
      if (isMoonCheck) return 'YUELIANGBI';
      if (isStorageCardCheck) return 'LYCARD';
      // 默认返回
      return 'ALIPAY';
    })();
    const paymentInfoArr = [
      {
        // paymentChannel: this.state.isWeChatCheck ? ('WECHAT' as PaymentChannelType) : 'YUELIANGBI', // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentChannel: paymentChannelDeal, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentMode: isWeChatCheck || isStorageCardCheck ? ('JSAPI' as PaymentModeType) : 'BALANCE', // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: this.calculateOrderAmount(),
      },
    ];

    const orderParams = {
      orderId,
      paymentInfo: paymentInfoArr,
      payerChannelId: payerChannelId, // openId,
    };
    KYLoading.show();
    let payFunc = paymentApi.createPayment;
    const { appKey, appItemKey } = this.confirmOrderInfoData;
    // 心理咨询 / 教练 / 课：走 /payment/create；其余走全民付
    const useNormalPayment =
      appKey === AppKeyEnum.Zxs ||
      appKey === 'coach' ||
      appItemKey === AppItemKeyTypeEnum.Course ||
      appItemKey === 'course';
    if (!useNormalPayment) {
      orderParams.paymentInfo[0].paymentChannel = 'QMF_WECHAT';
      payFunc = paymentApi.createPaymentV2;
    }
    const res = await payFunc(orderParams);
    KYLoading.hide();

    this.payLock = false;
    if (res.code === 0) {
      if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Zxs) {
        Taro.setStorage({
          key: `ConsultationAgreement_${this.state.userInfo.id}`,
          data: 'true',
        });
      } else if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Ly) {
        Taro.setStorage({
          key: `CounsellingAgreement_${this.state.userInfo.id}`,
          data: 'true',
        });
      }
      if (res.data && res.data.value && res.data.value === 'SUCCESS') {
        this.KYTrackAll(res, orderId);
        this.goLink();
      }
      // ?这儿为什么重复写了
      // if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Zxs) {
      //   Taro.setStorage({
      //     key: `ConsultationAgreement_${this.state.userInfo.id}`,
      //     data: 'true',
      //   });
      // } else if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Ly) {
      //   Taro.setStorage({
      //     key: `CounsellingAgreement_${this.state.userInfo.id}`,
      //     data: 'true',
      //   });
      // }
      this.setState({ orderId: orderParams.orderId });

      const payInfo = res.data;
      Taro.requestPayment({
        timeStamp: payInfo.timeStamp, // 必填，生成签名的时间戳
        nonceStr: payInfo.nonceStr, // 必填，生成签名的随机串
        package: payInfo.package, // 必填，签名
        signType: payInfo.signType, // 必填，签名
        paySign: payInfo.paySign, // 必填，签名
        success: (res2) => {
          this.KYTrackAll(res, orderId);
          this.goLink();
        },
        fail: (err) => {
          console.log('pay fail', err);
        },
      });
    }
  };

  handleCouponClick = () => {
    // 折后价格或者选中了优惠充时卡就不能点击优惠卷
    if (this.state.isStorageCardCheck || this.confirmOrderInfoData.selectProduct?.activity) return;
    this.setState({ isShowCouponModal: true });
  };

  handleConfirmCoupon = (coupon: MarketingModelType.UserReceiveCouponModelType) => {
    if (coupon) {
      const policy: MarketingPolicyType[] = [];
      policy.push({
        type: 'coupon' as PreferentialWayEnum.Coupon,
        item: {
          userCouponId: coupon?.userCouponId,
          couponCode: coupon?.couponCode,
          count: 1,
        },
      });
      console.log('policy value', policy);
      this.getPrice(policy, coupon.amount);
    } else {
      this.getPrice([], 0);
    }
  };

  // 计算最新的价格与优惠券信息
  getPrice = async (data: MarketingPolicyType[], couponAmount: number) => {
    KYLoading.show();
    const res = await orderApi.getOrderCalculate({
      items: this.confirmOrderInfoData.items,
      marketingPolicy: data,
      activityAliasId: this.confirmOrderInfoData.extra.doctorId,
    });

    KYLoading.hide();
    if (res.code === 0) {
      this.setState({ paymentAmount: res.data.paidMoney, policy: data, couponAmount });
    }
  };

  // 埋点包装下
  KYTrackAll = (res, orderId) => {
    if (this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Zxs) {
      // 埋点: 知我心理支付咨询订单结果
      try {
        KYTrack(
          T_CounselingOrderPayResult({
            $is_first_time: this.confirmOrderInfoData.isFirst || false,
            app_item_key: this.confirmOrderInfoData.appItemKey,
            order_id: orderId,
            order_price: this.state.paymentAmount,
            counselor_id: this.confirmOrderInfoData.extra.counselorId,
            counselor_name: this.confirmOrderInfoData.extra.nickName,
            is_success: res.code === 0,
            fail_reason: res?.message || '',
          }),
        );
      } catch (error) {
        console.log('error', error);
      }
    }

    if (
      this.confirmOrderInfoData.appKey === AppKeyTypeEnum.Ly &&
      this.confirmOrderInfoData.appItemKey !== AppItemKeyTypeEnum.LyCard
    ) {
      // 埋点: 知我心理支付聊愈订单结果
      try {
        KYTrack(
          T_ConsultantOrderPayResult({
            $is_first_time: this.confirmOrderInfoData.isFirst || false,
            order_type: this.confirmOrderInfoData.selectProduct.productName,
            // app_item_key: this.confirmOrderInfoData.appItemKey,
            order_id: orderId,
            order_price: this.state.paymentAmount,
            coupon_discount_amount: this.state.couponAmount,
            coupon_id:
              this.state.policy.length > 0 ? (this.state.policy[0].item as any).userCouponId : '',
            coupon_name:
              this.state.policy.length > 0 ? (this.state.policy[0].item as any).couponCode : '',
            coupon_amount:
              this.state.policy.length > 0 ? (this.state.policy[0].item as any).couponName : '',
            consultant_id: this.confirmOrderInfoData.extra.doctorId,
            consultant_name: '',
            is_success: res.code === 0,
            fail_reason: res?.message || '',
          }),
        );
      } catch (error) {
        console.log('error', error);
      }
    }
  };

  // 获取产品名称
  getProductName = () => {
    const { productInfo } = this.state;
    if (productInfo.appKey === AppKeyEnum.Zxs) {
      return (this.state.extra as any)?.nickName || '';
    } else if (productInfo.appKey === AppKeyEnum.LY) {
      // 如果是疗愈单 并且是买的是优惠充时卡
      if (productInfo.appItemKey === AppItemKeyTypeEnum.LyCard) {
        return productInfo.productName;
      } else if (this.confirmOrderInfoData.selectProduct.appItemKey === 'jswzcs') {
        // 如果是疗愈单 并且是买的不是优惠充时卡
        return `${this.confirmOrderInfoData.selectProduct.count}分钟即时对话咨询1次`;
      } else {
        return `${this.confirmOrderInfoData.selectProduct.count}分钟通话咨询`;
      }
    } else if (productInfo.appKey === 'coach') {
      return productInfo.outName;
    } else if (
      productInfo.appKey === AppKeyTypeEnum.External ||
      productInfo.appKey === AppKeyEnum.External ||
      productInfo.appItemKey === AppItemKeyTypeEnum.Course
    ) {
      return productInfo.name || '';
    }
  };

  // 获取产品的价格
  getPriceText = () => {
    const { productInfo, paymentAmount } = this.state;
    if (productInfo.appItemKey === AppItemKeyTypeEnum.LyCard) {
      return `¥${formatPrice(productInfo.originPrice)}`;
    } else if (productInfo.appKey === 'coach') {
      return `¥${formatPrice(productInfo.originPrice)}`;
    } else if (
      productInfo.appKey === AppKeyTypeEnum.External ||
      productInfo.appKey === AppKeyEnum.External ||
      productInfo.appItemKey === AppItemKeyTypeEnum.Course
    ) {
      return `¥${formatPrice(paymentAmount || productInfo.originPrice)}`;
    } else {
      // const price = this.state.useCoupon
      //   ? this.confirmOrderInfoData.selectProduct.money
      //   : paymentAmount;
      const price = this.confirmOrderInfoData.selectProduct.money;
      return `¥${formatPrice(price)}`;
    }
  };

  isCourseOrder = () => {
    const { productInfo } = this.state;
    const appKey = productInfo?.appKey || this.confirmOrderInfoData?.appKey;
    const appItemKey = productInfo?.appItemKey || this.confirmOrderInfoData?.appItemKey;
    return (
      appKey === AppKeyTypeEnum.External ||
      appKey === AppKeyEnum.External ||
      appItemKey === AppItemKeyTypeEnum.Course
    );
  };

  // 因为优惠充时卡可以享受折扣，但是不能使用优惠卷，所以这里需要区分带过来的价格是折扣还是优惠
  calculateOrderAmount = () => {
    const { selectProduct } = this.confirmOrderInfoData;
    const { paymentAmount, isStorageCardCheck } = this.state;
    // 如果有activity字段，就是有折扣
    if (selectProduct?.activity) {
      return paymentAmount;
    }
    // 否则判断是否选择优惠充时卡
    return isStorageCardCheck ? selectProduct.money : paymentAmount;
  };

  render() {
    const {
      isAgree,
      productInfo,
      paymentAmount,
      isWeChatCheck,
      isMoonCheck,
      balance,
      isShowCouponModal,
      storageCardBalance,
      isStorageCardCheck,
      isHaveCoupon,
      useCoupon,
    } = this.state;

    // const priceArr = (paymentAmount / 100).toString().split('.');
    const priceArr = (this.calculateOrderAmount() / 100).toString().split('.');

    const balanceDisabled =
      this.confirmOrderInfoData.appItemKey === AppItemKeyTypeEnum.LyCard || balance < paymentAmount;

    // 获取相关协议信息
    const protocolInfo =
      protocolMap[productInfo?.appKey]?.[productInfo?.appItemKey] ||
      protocolMap[productInfo?.appKey]?.default;
    return (
      <KYPage className={styles.confirm_order}>
        <KYNavigation showBack className={styles.navBg} title="确认订单"></KYNavigation>
        {productInfo ? (
          <View className={styles.content}>
            <Image
              src={
                productInfo.image
                  ? ImgUrlFormat.widthHeightFunc(productInfo.image, 80 * 3)
                  : 'https://cdn-public.knowyourself.cc/icon/liaoyu/chat_20230316.png'
              }
              className={classNames(styles.img, {
                [styles.coachImg]: productInfo.appKey === 'coach',
              })}
            />
            <View className={styles.txt}>
              <View className={styles.top}>
                <Text className={styles.top_l}>{this.getProductName()}</Text>

                {/* 只有咨询师才会显示 */}
                {productInfo.appKey === AppKeyEnum.Zxs ? (
                  <KYNumber className={styles.top_r}>
                    ¥{formatPrice(productInfo.originPrice)}
                  </KYNumber>
                ) : (
                  <KYNumber className={styles.top_r}>{this.getPriceText()}</KYNumber>
                )}
              </View>

              {productInfo.appKey === AppKeyEnum.Zxs && (
                <View>
                  <View className={styles.p2}>{productInfo.name || '50分钟单次咨询'}</View>
                  {productInfo.originPrice ? (
                    <View className={styles.p2}>{this.getScheduleTime()}</View>
                  ) : null}
                </View>
              )}
            </View>
          </View>
        ) : null}

        {/* 选择优惠卷 */}
        {productInfo &&
          productInfo.appKey === AppKeyEnum.LY &&
          productInfo.appItemKey !== AppItemKeyTypeEnum.LyCard && (
            <View className={styles.coupon}>
              <View className={styles.coupon_top} onClick={this.handleCouponClick}>
                <Text className={styles.t_l}>优惠券</Text>
                <View className={styles.t_r}>
                  <Text
                    className={classNames({
                      [styles.discount]: true,
                      [styles.show]: !this.state.useCoupon,
                    })}
                  >
                    暂无可用优惠券
                  </Text>
                  <Text
                    className={classNames({
                      [styles.txt]: true,
                      [styles.show]: this.state.useCoupon,
                    })}
                  >
                    {this.state.useCoupon &&
                    (this.state.policy[0] && (this.state.policy[0]?.item as any))?.userCouponId
                      ? `减 ${formatPrice(this.state.couponAmount)}`
                      : '本次不使用'}
                  </Text>
                  <Image
                    src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
                    className={styles.img}
                    style={!this.state.useCoupon ? { display: 'none' } : { display: 'block' }}
                  />
                </View>
              </View>
              <View className={styles.coupon_bottom}>
                <Text className={styles.b_l}>合计</Text>
                <Text className={styles.b_r}>¥{formatPrice(this.calculateOrderAmount())}</Text>
              </View>
            </View>
          )}

        {/* 支付方式 */}
        <View className={styles.pay_way}>
          <View className={styles.pay_way_top}>选择支付方式</View>
          <View className={styles.pay_way_item}>
            <View className={styles.left}>
              <Image
                src="https://cdn-public.knowyourself.cc/icon/exam/wechat_pay_icon_20231107.png"
                className={styles.img}
              />
              <Text className={styles.txt}>微信支付</Text>
            </View>
            <Image
              src={
                isWeChatCheck
                  ? 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_checked_icon.png'
                  : 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_unchecked_icon.png'
              }
              onClick={() => {
                // 如果原先有优惠卷，现在又是false,需要恢复优惠券
                if (isHaveCoupon && !useCoupon) {
                  this.setState({ useCoupon: true });
                }
                this.setState({
                  isWeChatCheck: !isWeChatCheck,
                  isMoonCheck: false,
                  isStorageCardCheck: false,
                });
              }}
              className={styles.right_img}
            />
          </View>

          {balance > 0 && productInfo?.appKey !== 'coach' && !this.isCourseOrder() ? (
            <View>
              <View
                className={classNames({
                  [styles.pay_way_item]: true,
                  [styles.moon]: true,
                })}
              >
                <View className={styles.left}>
                  <Image
                    src={
                      balanceDisabled
                        ? 'https://cdn-public.knowyourself.cc/icon/exam/yueliangbi_icon_20231129.png'
                        : 'https://cdn-public.knowyourself.cc/icon/exam/yueliangbi_icon_20231107.png'
                    }
                    className={styles.img}
                  />
                  <Text
                    className={classNames({
                      [styles.txt]: true,
                      [styles.text_no]: balanceDisabled,
                    })}
                  >
                    月亮币支付
                  </Text>
                </View>
                <Image
                  src={
                    balanceDisabled
                      ? 'https://cdn-public.knowyourself.cc/icon/common/radio_ forbid_icon.png'
                      : isMoonCheck
                        ? 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_checked_icon.png'
                        : 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_unchecked_icon.png'
                  }
                  onClick={() => {
                    if (!balanceDisabled) {
                      // 如果原先有优惠卷，现在又是false,需要恢复优惠券
                      if (isHaveCoupon && !useCoupon) {
                        this.setState({ useCoupon: true });
                      }
                      this.setState({
                        isMoonCheck: !isMoonCheck,
                        isWeChatCheck: false,
                        isStorageCardCheck: false,
                      });
                    }
                  }}
                  className={styles.right_img}
                />
              </View>
              <View
                className={classNames({
                  [styles.moon_mount]: true,
                  [styles.moon_mount_blance]: !balanceDisabled,
                })}
              >
                余额: <Text className={styles.moon_txt}>{formatPrice(balance)}</Text>
              </View>
            </View>
          ) : (
            ''
          )}
          {productInfo &&
            productInfo.appKey == AppKeyEnum.LY &&
            productInfo.appItemKey !== AppItemKeyTypeEnum.LyCard && (
              <View>
                <View
                  className={classNames({
                    [styles.pay_way_item]: true,
                    [styles.moon]: true,
                  })}
                >
                  <View className={styles.left}>
                    <Image
                      src="https://cdn-public.knowyourself.cc/icon/liaoyu/storageCardIcon@3x.png"
                      className={styles.img}
                    />
                    <Text
                      className={classNames({
                        [styles.txt]: true,
                      })}
                    >
                      即时咨询优惠充时卡
                    </Text>
                  </View>
                  <Image
                    src={
                      isStorageCardCheck
                        ? 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_checked_icon.png'
                        : 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_unchecked_icon.png'
                    }
                    onClick={() => {
                      //  如果原先有优惠卷，选择优惠充时卡的时候需要将优惠券置灰
                      if (isHaveCoupon) {
                        this.setState({ useCoupon: false });
                      }
                      this.setState({
                        isStorageCardCheck: !isStorageCardCheck,
                        isWeChatCheck: false,
                        isMoonCheck: false,
                      });
                    }}
                    className={styles.right_img}
                  />
                </View>
                <View
                  className={classNames({
                    [styles.moon_mount]: true,
                  })}
                >
                  余额: <Text className={styles.moon_txt}>{formatPrice(storageCardBalance)}</Text>
                </View>
              </View>
            )}
        </View>

        {/* 底部 */}
        <View className={styles.bottom}>
          {/* 同意书：课订单不展示协议勾选 */}
          {!this.isCourseOrder() ? (
            <View className={styles.agree}>
              {isAgree ? (
                <Image
                  src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_checked_icon.png"
                  className={styles.you}
                  onClick={() => {
                    this.setState({
                      isAgree: !isAgree,
                    });
                  }}
                />
              ) : (
                <Image
                  src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_unchecked_icon.png"
                  className={styles.empty}
                  onClick={() => {
                    this.setState({
                      isAgree: !isAgree,
                    });
                  }}
                />
              )}
              {productInfo && protocolInfo ? (
                <Text
                  className={styles.txt}
                  onClick={() => {
                    navigateTo(`/subWebview/pages/md/index`, {
                      protocolId: protocolInfo.protocolId,
                    });
                  }}
                >
                  我同意
                  <Text className={styles.txtLink}>{protocolInfo.text}</Text>
                </Text>
              ) : null}
            </View>
          ) : null}
          {productInfo ? (
            <View className={styles.btn_wrapper}>
              <View className={styles.bottom_l}>
                <Text>
                  <Text className={styles.txt}>支付</Text>
                  <KYNumber className={styles.num1} type="Bold">
                    {priceArr[0] || 0}
                    {productInfo.appKey === AppKeyTypeEnum.Ly ? '.' : ''}
                  </KYNumber>
                  {productInfo.appKey === AppKeyTypeEnum.Ly ? (
                    <KYNumber className={styles.num2} type="Bold">
                      {priceArr[1]?.padEnd(1, '0') || '00'}
                    </KYNumber>
                  ) : (
                    ''
                  )}

                  <Text className={styles.symbol}> 元</Text>
                </Text>
              </View>
              <View className={styles.btn} onClick={() => this.onPay()}>
                <Text className={styles.btn_txt}>立即支付</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 选择优惠券弹框 */}
        {isShowCouponModal && (
          <CouponModal
            appItemKey={productInfo.appItemKey}
            productId={productInfo.productId}
            close={() => {
              this.setState({ isShowCouponModal: false });
            }}
            handleConfirmCoupon={this.handleConfirmCoupon}
            couponCodeId={this.state.policy[0]?.item['couponCode']}
          />
        )}
      </KYPage>
    );
  }
}

export default ConfirmOrder;
