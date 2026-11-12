import { observer, inject } from 'mobx-react';
import { CONFIRM_ORDER_INFO, USER_OPENID } from '@/constants/values';
import BaseKyComponent from '@/components/BaseKyComponent';
import { counsellingApi, orderApi, marketingApi, paymentApi } from '@/services';
import { KYTrack } from '@/modules/track';
import { T_ConsultantOrderPageButtonClick } from '@/modules/track/events';
import {
  CounsellingDoctorInfoResponse,
  CounsellingItemKeyEnum,
  CounsellingProductType,
} from '@ky-client/counselling-type';
import Taro from '@tarojs/taro';
import { ProductItemType } from '@ky-middleground/order-type';
import {
  MarketingPolicyType,
  PaymentChannelType,
  PaymentModeType,
  PreferentialWayEnum,
} from '@ky-client/exam-type';
import { replaceTo } from '@/utils/navigate';
import { KYLoading } from '@/components/KYLoading';
import { MarketingUserType } from '@ky-middleground/marketing-type';
import { formatAmount } from '@/modules/utils/formatting.util';
import classNames from 'classnames';
import KYNumber from '@/components/KYNumber';
import { View, Image } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import styles from './index.module.less';

type IStates = {
  info: CounsellingDoctorInfoResponse | any;
  order: {
    orderMoney: number;
    paidMoney: number;
  };
  coupon: MarketingUserType.UserMaxCouponRespType | any;
  needKnow: number;
  way: CounsellingItemKeyEnum;
  time: number;
  doctorId: string;
  orderId: string;
  productInfo: ProductItemType;
  showCouponTag: boolean;
  finallyPrice: number;
  couponInfo: string;
  policy: MarketingPolicyType[];
  visiable: boolean;
  open: boolean;
  loading: boolean;
  tipModel: boolean;
};

@inject('store')
@observer
class PayPage extends BaseKyComponent<{}, IStates> {
  payLock = false;

  constructor() {
    super({});
    this.state = {
      open: false,
      loading: false,
      orderId: '',
      doctorId: '',
      order: {
        orderMoney: -1,
        paidMoney: -1,
      },
      info: {} as CounsellingDoctorInfoResponse,
      coupon: {},
      needKnow: 1,
      way: CounsellingItemKeyEnum.JSWZCS,
      time: 0,
      productInfo: null as any as ProductItemType,
      showCouponTag: false,
      finallyPrice: -1,
      couponInfo: '',
      policy: [],
      visiable: false,
      tipModel: false,
    };
  }
  wzList = [];
  wzRecommend = 0;
  thList = [];
  thRecommend = 0;
  async onLoad(res) {
    if (res && res.doctorId) {
      KYLoading.show();
      const { data: info } = await counsellingApi.getDoctorInfo(res.doctorId);

      KYLoading.hide();
      this.setState({
        doctorId: res.doctorId,
      });
      this.setState({ info }, () => {
        this.getProduct();
        if (info.product.length > 0) {
          this.setState({ loading: true });
          this.getPrice(info.product[this.wzRecommend]);
        }
      });
    } else {
      Taro.showToast({
        title: '没有聊愈师Id',
        icon: 'none',
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }
  }

  orderCheck = async (info: { doctorId: string; appItemKey: CounsellingItemKeyEnum }) => {
    try {
      const res = await counsellingApi.OrderBeforeCreate(info);
      if (res.code === 0) {
        return res.data;
      } else {
        return false;
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
    console.log('聊愈师支付', orderId);
    const { order, productInfo, doctorId } = this.state;

    // const orderCheckStatus = await this.orderCheck({
    //   doctorId: doctorId,
    //   appItemKey: this.state.way,
    // });
    // if (!orderCheckStatus) {
    //   return;
    // }

    const paymentInfoArr = [
      {
        paymentChannel: 'WECHAT' as PaymentChannelType, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentMode: 'JSAPI' as PaymentModeType, // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: order.paidMoney,
      },
    ];

    const params = {
      /** 优惠券信息 */
      marketingPolicy: [],
      /** 订单来源 1购买 2赠送 */
      orderSource: '1',
      /** 商品信息*/
      items: [
        {
          productDetail: {
            appKey: productInfo.productDetail.appKey || 'ly',
            appItemKey: productInfo.productDetail.appItemKey || '',
            appName: productInfo.productDetail.appName || '',
            productId: productInfo.productDetail.productId,
            image: '',
          },
          skuId: productInfo.skuId,
          skuPrice: productInfo.skuPrice || 0,
          skuCount: productInfo.skuCount,
          /** 关联id */
          relationId: '0',
        },
      ],
      /** 支付信息*/
      paymentInfo: paymentInfoArr,
      extra: {
        doctorId,
      },
    };

    Taro.setStorage({
      key: CONFIRM_ORDER_INFO,
      data: {
        appKey: productInfo.productDetail.appKey,
        appItemKey: productInfo.productDetail.appItemKey,
        productId: productInfo.productDetail.productId,
        marketingPolicy: params.marketingPolicy,
        productData: this.state.productInfo,
        items: params.items,
        paymentPrice: order.paidMoney,
        extra: {
          doctorId: this.state.doctorId,
        },
        selectProduct:
          this.state.way == CounsellingItemKeyEnum.JSWZCS
            ? this.wzList[this.state.time]
            : this.thList[this.state.time],
      },
    });

    // 支付按钮加锁
    // if (this.payLock) return;
    // this.payLock = true;

    // if (orderId) {
    //   this.getPayInfo(orderId);
    // } else {
    //   // 创建订单
    //   KYLoading.show();
    //   const res = await orderApi.createOrder(params);
    //   if (res.code === 0) {
    //     const { orderId } = res.data;
    //     this.getPayInfo(orderId);
    //   } else {

    //     this.payLock = false;
    //     KYLoading.hide();
    //   }
    // }
  };

  /**
   * 获取支付信息
   */
  getPayInfo = async (orderId: string) => {
    this.payLock = true;
    const payerChannelId = Taro.getStorageSync(USER_OPENID);
    const paymentInfoArr = [
      {
        paymentChannel: 'WECHAT' as PaymentChannelType, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentMode: 'JSAPI' as PaymentModeType, // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: this.state.order.paidMoney,
      },
    ];

    const orderParams = {
      orderId,
      paymentInfo: paymentInfoArr,
      payerChannelId: payerChannelId, // openId,
    };
    KYLoading.show();
    const res = await paymentApi.createPayment(orderParams);
    KYLoading.hide();

    this.payLock = false;
    if (res.code === 0) {
      if (res.data && res.data.value && res.data.value === 'SUCCESS') {
        setTimeout(() => {
          // Taro.navigateBack();
          // Taro.redirectTo({
          //   url: `/subCounselling/pages/chat/index?doctorId=${this.state.doctorId}`,
          // });
          replaceTo(`/subCounselling/pages/chat/index`, {
            doctorId: this.state.doctorId,
          });
        }, 2000);
        return;
      }
      this.setState({ orderId: orderParams.orderId });

      const payInfo = res.data;
      Taro.requestPayment({
        timeStamp: payInfo.timeStamp, // 必填，生成签名的时间戳
        nonceStr: payInfo.nonceStr, // 必填，生成签名的随机串
        package: payInfo.package, // 必填，签名
        signType: payInfo.signType, // 必填，签名
        paySign: payInfo.paySign, // 必填，签名
        success: () => {
          setTimeout(() => {
            // Taro.navigateBack();
            // Taro.redirectTo({
            //   url: `/subCounselling/pages/chat/index?doctorId=${this.state.doctorId}`,
            // });
            replaceTo(`/subCounselling/pages/chat/index`, {
              doctorId: this.state.doctorId,
            });
          }, 2000);
        },
        fail: () => {
          // console.log('pay fail', res);
        },
      });
    }
  };

  getProduct = () => {
    this.wzList = this.state.info.product.filter((item) => item.appItemKey == 'jswzcs');
    this.wzList.some((item: CounsellingProductType, index) => {
      if (item.isRecommend) {
        this.wzRecommend = index;
      }
    });
    this.thList = this.state.info.product.filter((item) => item.appItemKey == 'jsth');
    this.thList.some((item: CounsellingProductType, index) => {
      if (item.isRecommend) {
        this.thRecommend = index;
      }
    });
    this.setState({ time: this.wzRecommend });
  };

  // 计算最新的价格与优惠券信息
  getPrice = async (data: CounsellingProductType) => {
    KYLoading.show();
    const policy: MarketingPolicyType[] = [];
    const { data: coupon } = await marketingApi.getMaxCoupon(data.appItemKey, data.productId);
    if (!data.activity) {
      if (coupon['jsth'] != null) {
        policy.push({
          type: 'coupon' as PreferentialWayEnum.Coupon,
          item: {
            userCouponId: coupon['jsth'].userCouponId,
            couponCode: coupon['jsth'].couponCode,
            count: 1,
          },
        });
      } else if (coupon['jswzcs'] != null) {
        policy.push({
          type: 'coupon' as PreferentialWayEnum.Coupon,
          item: {
            userCouponId: coupon['jswzcs'].userCouponId,
            couponCode: coupon['jswzcs'].couponCode,
            count: 1,
          },
        });
      }
    } else {
      policy.push({
        type: 'discount' as PreferentialWayEnum.Discount,
        item: {
          activityId: data.activity.activityId,
        },
      });
    }
    const { data: order } = await orderApi.getOrderCalculate({
      items: [
        {
          skuCount: data.count,
          productDetail: {
            productId: data.productId,
            image: '',
            appItemKey: data.appItemKey,
            appName: data.appName || '',
            appKey: data.appKey || '',
          },
          skuPrice: data.money || 0,
          skuId: data.skuInfo.skuId,
          relationId: '0', // 聊愈师？
        },
      ],
      marketingPolicy: policy,
      activityAliasId: this.state.doctorId,
    });

    KYLoading.hide();
    let showTag = true;
    let finallyPrice = -1;
    let couponInfo = '';
    if (coupon['jsth'] != null) {
      if (
        (order.orderMoney != order.paidMoney && data.activity && !data.activity.isCouponOverlay) ||
        coupon['jsth'].threshold > order.paidMoney ||
        coupon['jsth'].amount <= 0
      ) {
        showTag = false;
      }
      if (showTag) {
        finallyPrice =
          order.orderMoney - coupon['jsth']?.amount < 0
            ? 0
            : order.orderMoney - coupon['jsth']?.amount;
        if (coupon['jsth'].threshold == 0) {
          couponInfo = '无门槛' + '减' + formatAmount(coupon['jsth']['amount']).split('.')[0];
        } else {
          couponInfo =
            '满' +
            formatAmount(coupon['jsth']['threshold']).split('.')[0] +
            '减' +
            formatAmount(coupon['jsth']['amount']).split('.')[0];
        }
      } else {
        finallyPrice = order.paidMoney;
      }
    } else if (coupon['jswzcs'] != null) {
      if (
        (order.orderMoney != order.paidMoney && data.activity && !data.activity.isCouponOverlay) ||
        coupon['jswzcs'].threshold > order.orderMoney ||
        coupon['jswzcs'].amount <= 0
      ) {
        showTag = false;
      }
      if (showTag) {
        finallyPrice =
          order.orderMoney - coupon['jswzcs']?.amount < 0
            ? 0
            : order.orderMoney - coupon['jswzcs']?.amount;
        if (coupon['jswzcs'].threshold == 0) {
          couponInfo = '无门槛' + '减' + formatAmount(coupon['jswzcs']['amount']).split('.')[0];
        } else {
          couponInfo =
            '满' +
            formatAmount(coupon['jswzcs']['threshold']).split('.')[0] +
            '减' +
            formatAmount(coupon['jswzcs']['amount']).split('.')[0];
        }
      } else {
        finallyPrice = order.paidMoney;
      }
    } else {
      showTag = false;
      finallyPrice = order.paidMoney;
    }

    const finallyData: ProductItemType = {
      skuCount: data.count,
      productDetail: {
        productId: data.productId,
        image: '',
        appItemKey: data.appItemKey,
        appName: data.appName || '',
        appKey: data.appKey || '',
      },
      skuPrice: data.money || 0,
      skuId: data.skuInfo.skuId,
      relationId: '0', // 聊愈师？
    };
    this.setState({
      order,
      coupon,
      finallyPrice,
      showCouponTag: showTag,
      couponInfo,
      productInfo: finallyData,
      policy,
      loading: false,
    });
  };

  render() {
    const { info, way, needKnow, time, finallyPrice, showCouponTag, couponInfo, productInfo } =
      this.state;
    return (
      <KYPage className={styles.payPage}>
        <KYNavigation className={styles.back} showBack title="聊愈" />
        {info ? (
          <>
            <View className={styles.tip}>
              <View className={styles.title}>
                <View className={styles.box1}></View>
                即时咨询适用情况须知
                <View
                  className={styles.imgbox}
                  onClick={() => {
                    this.setState({ open: !this.state.open });
                  }}
                >
                  <Image
                    className={styles.img}
                    src={
                      this.state.open
                        ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/20240304_chevron_up@3x.png'
                        : 'https://cdn-public.knowyourself.cc/icon/liaoyu/20240304_chevron_down@3x.png'
                    }
                  />
                </View>
              </View>
              <View
                className={classNames({
                  [styles.content]: true,
                  [styles.isBlock]: this.state.open,
                })}
              >
                <View className={styles.text1}>
                  平台无法提供危机干预、精神疾病的诊断及治疗。在开启本次服务之前，需要了解您当下或近期是否存在以下情况，以判断即时咨询服务是否适用与您的情况：
                </View>
                <View className={styles.text2}>1. 有自杀的念头、计划或行为</View>
                <View className={styles.text2}>2. 有经医院确诊的精神疾患</View>
                <View className={styles.text2}>3. 有伤害自身或他人的想法或行为</View>
              </View>
              <View
                className={classNames({ [styles.footer]: true, [styles.isFlex]: this.state.open })}
              >
                <View
                  className={styles.item}
                  style={{ opacity: 0.5 }}
                  onClick={() => {
                    if (needKnow != 0) {
                      this.setState({ needKnow: 0, visiable: true });
                    }
                  }}
                >
                  <Image
                    className={styles.img}
                    src={
                      needKnow == 0
                        ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/ic_select_square@3x.png'
                        : 'https://cdn-public.knowyourself.cc/icon/liaoyu/control／radio@3x.png'
                    }
                  />
                  我存在以上情况
                </View>
                <View
                  className={styles.item}
                  onClick={() => {
                    if (needKnow != 1) {
                      this.setState({ needKnow: 1 });
                    }
                  }}
                >
                  <Image
                    className={styles.img}
                    src={
                      needKnow == 1
                        ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/ic_select_square@3x.png'
                        : 'https://cdn-public.knowyourself.cc/icon/liaoyu/control／radio@3x.png'
                    }
                  />
                  我不存在以上情况
                </View>
              </View>
            </View>
            <View className={styles.middle}>
              <View className={styles.title}>选择咨询方式</View>
              <View className={styles.btn}>
                <View
                  className={classNames({
                    [styles.item]: true,
                    [styles.selected]: way == CounsellingItemKeyEnum.JSWZCS,
                    [styles.itemAc]: this.wzList.length > 0,
                  })}
                  onClick={() => {
                    this.setState({
                      way: CounsellingItemKeyEnum.JSWZCS,
                      time: this.wzRecommend,
                      loading: true,
                    });
                    this.getPrice(this.wzList[0]);
                  }}
                >
                  {/* <Image
                    src={
                      way == CounsellingItemKeyEnum.JSWZCS
                        ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/20240304_wenzi_purple@3x.png'
                        : 'https://cdn-public.knowyourself.cc/icon/liaoyu/20240304_wenzi_black@3x.png'
                    }
                    className={styles.icon}
                  /> */}
                  即时对话
                  {/* <Image
                    className={classNames({
                      [styles.img]: true,
                      [styles.isShow]: info.doctorServiceStatus == 2,
                    })}
                    mode="heightFix"
                    src="https://cdn-public.knowyourself.cc/icon/liaoyu/liaoyu_payment_ic_occupied@3x.png"
                  /> */}
                  <View
                    className={classNames({
                      [styles.xiuxi]: true,
                      [styles.isShow]:
                        info.doctorServiceStatus == 1 || info.doctorServiceStatus == 2,
                    })}
                  >
                    {info.doctorServiceStatus == 2 ? '被占用' : '休息中'}
                  </View>
                </View>
                <View
                  className={classNames({
                    [styles.item]: true,
                    [styles.selected]: way == CounsellingItemKeyEnum.JSTH,
                    [styles.itemAc]: this.thList.length > 0,
                  })}
                  onClick={() => {
                    this.setState({
                      way: CounsellingItemKeyEnum.JSTH,
                      time: this.thRecommend,
                      loading: true,
                    });
                    this.getPrice(this.thList[0]);
                  }}
                >
                  {/* <Image
                    src={
                      way == CounsellingItemKeyEnum.JSTH
                        ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/20240304_tonghua_purple@3x.png'
                        : 'https://cdn-public.knowyourself.cc/icon/liaoyu/20240304_tonghua_black@3x.png'
                    }
                    className={styles.icon}
                  /> */}
                  即时通话
                </View>
              </View>
            </View>
            <View className={styles.middle}>
              <View className={styles.title}>选择咨询时长</View>
              <View className={styles.btn}>
                {way == 'jswzcs'
                  ? this.wzList.map((item: CounsellingProductType, index) => {
                      return (
                        <View
                          className={classNames({
                            [styles.item]: true,
                            [styles.item1]: true,
                            [styles.selected]: time == index,
                            [styles.itemAc]: item.appItemKey == way,
                          })}
                          key={index}
                          onClick={() => {
                            this.setState({ time: index, loading: true });
                            this.getPrice(item);
                          }}
                        >
                          {item.productShowName}
                          {/* <Image
                            className={classNames({
                              [styles.img]: true,
                              [styles.isShow]: item.isRecommend == 1 && !item.activity,
                            })}
                            mode="heightFix"
                            src="https://cdn-public.knowyourself.cc/icon/liaoyu/编组 9@3x.png"
                          /> */}
                          <View
                            className={classNames({
                              [styles.recommend]: true,
                              [styles.isShow]: item.isRecommend == 1 && !item.activity,
                            })}
                          >
                            推荐
                          </View>
                          {item.activity ? (
                            <View
                              className={classNames({
                                [styles.discount]: true,
                              })}
                            >
                              {item.activity.discountActivity.discount / 10}折
                            </View>
                          ) : null}
                        </View>
                      );
                    })
                  : this.thList.map((item: CounsellingProductType, index) => {
                      return (
                        <View
                          className={classNames({
                            [styles.item]: true,
                            [styles.item1]: true,
                            [styles.selected]: time == index,
                            [styles.itemAc]: item.appItemKey == way,
                          })}
                          key={index}
                          onClick={() => {
                            this.setState({ time: index, loading: true });
                            this.getPrice(item);
                          }}
                        >
                          {item.productShowName}
                          <Image
                            className={classNames({
                              [styles.img]: true,
                              [styles.isShow]: item.isRecommend == 1 && !item.activity,
                            })}
                            mode="heightFix"
                            src="https://cdn-public.knowyourself.cc/icon/liaoyu/编组 9@3x.png"
                          />
                          {item.activity ? (
                            <View
                              className={classNames({
                                [styles.discount]: true,
                              })}
                            >
                              {item.activity.discountActivity.discount / 10}折
                            </View>
                          ) : null}
                        </View>
                      );
                    })}
              </View>
            </View>
            {finallyPrice != -1 ? (
              <View className={styles.count}>
                <View className={styles.sum}>总计</View>
                <View className={styles.down}>
                  <View className={styles.logo}>¥</View>
                  <KYNumber className={styles.num} type="Bold">
                    {formatAmount(finallyPrice)}
                  </KYNumber>
                  <View
                    className={classNames({
                      [styles.tag]: true,
                      [styles.show]: showCouponTag,
                    })}
                  >
                    {couponInfo}
                  </View>
                  <View className={styles.text3}>（支付后将开始服务）</View>
                </View>
              </View>
            ) : null}
            <View className={styles.footerBtn}>
              <View
                className={styles.inner}
                onClick={() => {
                  if (this.state.loading) {
                    return;
                  }
                  if (
                    (info.doctorServiceStatus != 3 && way != CounsellingItemKeyEnum.JSWZCS) ||
                    info.doctorServiceStatus == 3
                  ) {
                    this.setState({ tipModel: true });
                  }
                }}
                style={
                  (info.doctorServiceStatus != 3 && way != CounsellingItemKeyEnum.JSWZCS) ||
                  info.doctorServiceStatus == 3
                    ? {}
                    : { opacity: '0.4' }
                }
              >
                提交订单
              </View>
            </View>
          </>
        ) : null}

        <View
          className={classNames({
            [styles.box]: true,
            [styles.ifShow]: this.state.visiable,
          })}
        >
          <View
            className={classNames({
              [styles.dialog]: true,
            })}
          >
            <Image
              mode="widthFix"
              src="https://cdn-public.knowyourself.cc/icon/liaoyu/20240305_uppic.png"
              className={styles.img}
            />
            <View className={styles.diaTitle}>抱歉，即时咨询服务不适用于您目前的情况</View>
            <View className={styles.content}>
              建议您联络信任的亲友为您提供支持，并寻求三甲医院精神或心理专科的帮助。求助热线：
              <View style={{ color: '#646ED9' }}>010-82951332</View>
            </View>
            <View className={styles.btn}>
              <View
                className={classNames({ [styles.item]: true })}
                onClick={() => {
                  Taro.navigateBack();
                }}
              >
                我知道了
              </View>
            </View>
          </View>
        </View>

        <View
          className={classNames({
            [styles.tipModal]: true,
            [styles.ifShow]: this.state.tipModel,
          })}
        >
          <View className={styles.c}>
            <View className={styles.title}>温馨提示</View>
            <View className={styles.content}>为保障您的体验服务，请下载知我心理app下单</View>
            <View className={styles.b}>
              <View
                className={styles.item}
                onClick={() => {
                  this.onPay();
                  // 埋点: 聊愈下单页开始聊愈按钮点击
                  KYTrack(
                    T_ConsultantOrderPageButtonClick({
                      consultant_id: this.state.doctorId,
                      consultant_name: '',
                      order_type: productInfo.productDetail.appItemKey,
                      order_duration: this.state.time,
                    }),
                  );
                  // Taro.redirectTo({
                  //   url: '/subCommon/pages/confirmOrder/index',
                  // });
                  replaceTo('/subCommon/pages/confirmOrder/index');
                }}
              >
                继续下单
              </View>
              <View
                className={styles.item}
                onClick={() => {
                  this.setState({ tipModel: false });
                }}
              >
                我知道了
              </View>
            </View>
          </View>
        </View>
      </KYPage>
    );
  }
}

export default PayPage;
