import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import RichText from '@/components/RichText';
import { getCurrentFullRoute, navigateTo } from '@/utils/navigate';
import { checkLogin, gotoLogin } from '@/utils/identity';
import { CONFIRM_ORDER_INFO } from '@/constants/values';
import classNames from 'classnames';
import { KYLoading } from '@/components/KYLoading';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Text, Button } from '@tarojs/components';
import KYNumber from '@/components/KYNumber';
import Taro from '@tarojs/taro';
import { courseApi } from '@/services';
import { formatPrice } from '@/utils/util';
import styles from './index.module.less';

type States = {
  productId: string;
  productInfo: any;
  /** open=1 时展示价格与购买；默认隐藏（列表/分享入口） */
  isShow: boolean;
  skuInfo: any;
};
type Props = {};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      productId: '',
      productInfo: {},
      isShow: false,
      skuInfo: {},
    };
  }

  onLoad(opt) {
    if (opt.productId) {
      this.setState({ productId: opt.productId });
      this.getProctInfo(opt.productId);
      if (opt.open && String(opt.open) === '1') {
        this.setState({ isShow: true });
      }
    } else {
      Taro.showToast({ title: '参数错误', icon: 'none' });
      setTimeout(() => {
        Taro.navigateBack({
          fail: () => {
            Taro.reLaunch({ url: '/pages/index/index' });
          },
        });
      }, 1000);
    }
  }

  onShareAppMessage() {
    const { productInfo } = this.state;
    // 分享不带 open，接收方看不到支付入口
    return {
      title: productInfo.name,
      imageUrl: productInfo.headImage,
      path: `/subMarketings/pages/kyProduct/index?productId=${productInfo.id}`,
    };
  }

  async getProctInfo(id: string) {
    KYLoading.show();
    const res = await courseApi.getKYProductDetail(id);
    KYLoading.hide();
    if (res.code === 0) {
      this.setState({ productInfo: res.data.productInfo, skuInfo: res.data.skuInfo });
    } else {
      Taro.showToast({ title: res.message || '商品不存在', icon: 'none' });
      setTimeout(() => {
        Taro.navigateBack({
          fail: () => {
            Taro.reLaunch({ url: '/pages/index/index' });
          },
        });
      }, 1000);
    }
  }

  handleBuy = async () => {
    const { productInfo, isShow } = this.state;
    if (!isShow) return;
    if (productInfo.status === 'offline') return;

    const isLogin = await checkLogin();
    if (!isLogin) {
      gotoLogin(true, getCurrentFullRoute());
      return;
    }

    Taro.setStorageSync(CONFIRM_ORDER_INFO, {
      appKey: productInfo.appKey,
      appItemKey: productInfo.appItemKey,
      productId: productInfo.id,
      productName: productInfo.name,
      extra: {},
    });
    navigateTo('/subCommon/pages/confirmOrder/index');
  };

  render() {
    const { productInfo, isShow, skuInfo } = this.state;
    const isOffline = productInfo.status === 'offline';
    if (!productInfo.id) {
      return null;
    }

    return (
      <KYPage className={styles.index}>
        <View>
          <KYNavigation className={styles.nav} showBack />
          <View className={styles.header}>
            <Image className={styles.img} src={productInfo.headImage} mode="widthFix" />
            <View className={styles.info}>
              <View className={styles.title}>{productInfo.name}</View>
              <View className={styles.desc}>{productInfo.description}</View>
              <View className={classNames(styles.price, { [styles.hidden]: !isShow })}>
                <Text className={styles.flag}>¥</Text>
                <KYNumber type="Bold" color="#AF1818" className={styles.priceNum}>
                  {formatPrice(skuInfo.price)}
                </KYNumber>
                <Text className={styles.delPrice}>
                  ¥<KYNumber color="#C6C6C6">{formatPrice(skuInfo.referencePrice)}</KYNumber>
                </Text>
              </View>
            </View>
          </View>

          <View className={styles.detail}>
            <View className={styles.title}>商品详情</View>
            <RichText info={{ text: productInfo.detail || '' }} />
          </View>

          <View className={styles.btn}>
            <View className={styles.share}>
              <Button openType="share" className={styles.shareBtn} plain />
              <Image
                className={styles.shareImg}
                src="https://cdn-public.knowyourself.cc/icon/common/20250218_share.png"
              />
              分享
            </View>

            <View
              className={classNames(styles.btnText, {
                [styles.hidden]: !isShow,
                [styles.btnTextDisabled]: isOffline,
              })}
              onClick={isOffline || !isShow ? undefined : this.handleBuy}
            >
              {isOffline ? '该商品已下架' : '立即购买'}
            </View>
          </View>
        </View>
      </KYPage>
    );
  }
}

export default Index;
