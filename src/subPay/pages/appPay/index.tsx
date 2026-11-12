import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { Button, View } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import { paymentApi } from '@/services';
import Taro from '@tarojs/taro';
import styles from './index.module.less';

type IAppPayState = {
  status: boolean;
  paySuccess: boolean;
};

@inject('store')
@observer
class AppPay extends BaseKyComponent<{}, IAppPayState> {
  state = {
    status: false,
    paySuccess: false,
  };

  async onLoad(e) {
    const { orderId } = e;
    Taro.showLoading({ title: '支付中...' });
    const coderep = await Taro.login();
    const resp = await paymentApi.quanminfuApp({
      orderId: orderId,
      jsCode: coderep.code,
      paymentInfo: [
        {
          paymentChannel: 'QMF_WECHAT',
          paymentMode: 'JSAPI',
          paidMoney: 1,
        },
      ],
    });
    console.log('resp', resp);
    if (resp.code === 0) {
      Taro.requestPayment({
        ...resp.data,
        success: (res) => {
          console.log('pay success', res);
          Taro.hideLoading();
          this.setState({ paySuccess: true, status: true });
          Taro.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000,
          });
        },
        fail: (err) => {
          console.log('pay fail', err);
          Taro.hideLoading();
          this.setState({ paySuccess: false, status: true });
          Taro.showToast({
            title: '支付失败',
            icon: 'error',
            duration: 2000,
          });
        },
      });
    } else {
      Taro.hideLoading();
      this.setState({ paySuccess: false, status: true });
      Taro.showToast({
        title: resp.message || '支付失败',
        icon: 'error',
        duration: 2000,
      });
    }
  }

  render() {
    return (
      <KYPage className={styles.AppPay}>
        {this.state.status ? (
          <View className={styles.zhifuzhi}>
            <View className={styles.zhifuchengg}>
              {this.state.paySuccess ? '支付成功' : '支付失败'}
            </View>
            <Button
              openType="launchApp"
              appParameter={this.state.paySuccess ? 'success' : 'fail'}
              className={styles.fanhuiapp}
              onLaunchApp={() => {
                Taro.reLaunch({ url: '/pages/index/index' });
              }}
            >
              返回app
            </Button>
          </View>
        ) : (
          <View className={styles.zhifuzhi}>支付中...</View>
        )}
      </KYPage>
    );
  }
}

export default AppPay;
