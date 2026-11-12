import BaseKyComponent from '@/components/BaseKyComponent';
import { orderApi, paymentApi, walletApi } from '@/services';
import KYNumber from '@/components/KYNumber';
import classNames from 'classnames';
import { navigateTo, replaceTo } from '@/utils/navigate';
import { USER_OPENID } from '@/constants/values';
import { detectDevice } from '@/utils/util';
import { PaymentChannelType, PaymentModeType } from '@ky-client/exam-type';
import { KYLoading } from '@/components/KYLoading';
import Taro from '@tarojs/taro';
import { View, Image, Button } from '@tarojs/components';
import KYNavigation from '@/components/KYNavigation';
import KYPage from '@/components/KYPage';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';

type Props = {};
type States = {
  choose: number;
  list: {
    productId: string;
    skuId: string;
    productName: string;
    productShowName: string;
    count: number;
    appKey: string;
    appItemKey: string;
    money: number;
    moneyCount: string;
  }[];
  orderId: string;
  balance: number;
  visitable: boolean;
};

@inject('store')
@observer
class ReceviceCoupon extends BaseKyComponent<Props, States> {
  payLock = false;
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      choose: -1,
      list: [],
      orderId: '',
      balance: 0,
      visitable: false,
    };
  }

  async componentDidMount() {
    // const { token, orderId, index } = getQuery();
    KYLoading.show();
    await this.getUserBalance();
    KYLoading.hide();
  }

  async getWalletYyfProductList() {
    const res = await walletApi.getWalletProductInfo();
    return res;
  }

  async getUserBalance(isRefresh = false) {
    const res = await walletApi.getUserBalance();
    if (res.code === 0) {
      this.setState({
        balance: res.data.balance,
      });
      if (isRefresh) {
        Taro.showToast({ title: '刷新成功', icon: 'none' });
      }
    }
  }

  formatNumber(val: number | string) {
    // 将数字转换为字符串
    let numStr = val.toString();

    // 使用正则表达式在数字之间插入点
    numStr = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return numStr;
  }

  async createOrder() {
    if (detectDevice() !== 'Android') {
      Taro.showToast({ title: '请下载知我心理APP进行月亮币充值', icon: 'none' });
      return;
    }

    if (this.state.choose < 0) {
      Taro.showToast({ title: '请选择充值金额', icon: 'none' });
      return;
    }
    const productInfo = this.state.list[this.state.choose];
    const paymentInfoArr = [
      {
        paymentChannel: 'WECHAT' as PaymentChannelType, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentMode: 'JSAPI' as PaymentModeType, // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: productInfo.money,
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
            appKey: productInfo.appKey,
            appItemKey: productInfo.appItemKey,
            appName: productInfo.productName,
            productId: productInfo.productId,
            image: '',
          },
          skuId: productInfo.skuId,
          skuPrice: productInfo.money,
          skuCount: productInfo.count,
          /** 关联id */
          relationId: '',
        },
      ],
      /** 支付信息*/
      paymentInfo: paymentInfoArr,
      extra: {
        // 额外信息
        productId: productInfo.productId,
        productName: productInfo.productName,
      },
    };
    // 支付按钮加锁;
    if (this.payLock) return;
    this.payLock = true;
    KYLoading.show();
    const res = await orderApi.createOrder(params);
    if (res.code === 0) {
      const { orderId } = res.data;
      this.getPayInfo(orderId);
    } else {
      this.payLock = false;
      KYLoading.hide();
    }
  }

  /**
   * 获取支付信息
   */
  getPayInfo = async (orderId: string) => {
    this.payLock = true;
    const payerChannelId = Taro.getStorageSync(USER_OPENID);
    const productInfo = this.state.list[this.state.choose];
    const paymentInfoArr = [
      {
        paymentChannel: 'WECHAT' as PaymentChannelType, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentMode: 'JSAPI' as PaymentModeType, // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: productInfo.money,
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
          // Taro.redirectTo({ url: '/subWallet/pages/myWallet/index' });
          replaceTo('/subWallet/pages/myWallet/index');
        }, 2500);
      }
      this.setState({ orderId: orderParams.orderId });

      const payInfo = res.data;
      Taro.requestPayment({
        timeStamp: payInfo.timeStamp, // 必填，生成签名的时间戳
        nonceStr: payInfo.nonceStr, // 必填，生成签名的随机串
        package: payInfo.package, // 必填，签名
        signType: payInfo.signType, // 必填，签名
        paySign: payInfo.paySign, // 必填，签名
        success: (res2) => {
          console.log('pay res', res2);
          setTimeout(() => {
            // Taro.redirectTo({ url: '/subWallet/pages/myWallet/index' });
            replaceTo('/subWallet/pages/myWallet/index');
          }, 2500);
        },
        fail: (err) => {
          console.log('pay fail', err);
        },
      });
    }
  };

  render() {
    return (
      <KYPage className={styles.myWallet}>
        <KYNavigation title="账户余额" />
        <View className={styles.money}>
          <View className={styles.coinBox}>
            <View className={styles.coin}>我的月亮币</View>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/admin/flush_blue.png"
              className={styles.refresh}
              onClick={async () => {
                await this.getUserBalance(true);
              }}
            />
            <Image
              onClick={() => {
                // Taro.navigateTo({
                //   url: '/subWebview/pages/md/index?protocolId=yueliangbichangjianwenti',
                // });
                navigateTo('/subWebview/pages/md/index?protocolId=yueliangbichangjianwenti');
              }}
              className={styles.question}
              src="https://cdn-public.knowyourself.cc/icon/my/titlebar_icon_query_black@3x.png"
            />
            <Image
              className={styles.bill}
              src="https://cdn-public.knowyourself.cc/icon/my/titlebar_icon_text@3x.png"
              onClick={() => {
                // Taro.navigateTo({
                //   url: `/subWallet/pages/myBill/index`,
                // });
                navigateTo('/subWallet/pages/myBill/index');
              }}
            />
          </View>
          <View className={styles.com}>
            <Image
              className={styles.moonpic}
              src="https://cdn-public.knowyourself.cc/icon/common/account_icon_coin@2x.png"
            />
            <KYNumber color="black" type="Bold" className={styles.t}>
              {this.formatNumber((this.state.balance / 100).toFixed(2))}
            </KYNumber>
          </View>
        </View>
        {/* 临时隐藏月亮币充值区域 */}
        {false && (
          <>
            <View className={styles.charge}>
              <View className={styles.chargecoin}> 月亮币充值</View>
              <View className={styles.introcom}>
                <View className={styles.intro} onClick={() => this.setState({ visitable: true })}>
                  充值说明
                </View>
                <View className={styles.reg}></View>
              </View>
            </View>
            <View className={styles.main}>
              <View className={styles.box}>
                {this.state.list.map((item, index) => {
                  return (
                    <View
                      className={`${this.state.choose == index ? styles.xbox : styles.lbox}`}
                      key={index}
                      onClick={() => this.setState({ choose: index })}
                    >
                      <View className={styles.moonfc}>
                        <KYNumber color="black" type="Bold" className={styles.fontnum}>
                          {String(item.moneyCount)}
                        </KYNumber>
                        <View className={styles.mooncoin}>月亮币</View>
                      </View>

                      <View className={styles.CN}>¥ {(item.money / 100).toFixed(2)}</View>
                    </View>
                  );
                })}
              </View>
            </View>
            <Button
              className={styles.button}
              onClick={() => {
                Taro.showToast({ title: '请前往知我心理APP进行月亮币充值', icon: 'none' });
              }}
            >
              立即充值
            </Button>
            <View
              className={classNames({
                [styles.show]: this.state.visitable,
                [styles.modal]: true,
              })}
            >
              <View className={styles.content}>
                <Image
                  className={styles.img}
                  src="https://cdn-public.knowyourself.cc/icon/my/moon_coin_exchange_rule_240229.png"
                  mode="widthFix"
                />
              </View>
              <Image
                onClick={() => {
                  this.setState({ visitable: false });
                }}
                className={styles.close}
                mode="widthFix"
                src="https://cdn-public.knowyourself.cc/icon/wechat/20240321_close.png"
              />
            </View>
          </>
        )}
      </KYPage>
    );
  }
}

export default ReceviceCoupon;
