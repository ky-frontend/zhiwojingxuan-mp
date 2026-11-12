import Taro from '@tarojs/taro';
import BaseKyComponent from '@/components/BaseKyComponent';
import { observer, inject } from 'mobx-react';
import { getCurrentFullRoute, navigateTo, replaceTo } from '@/utils/navigate';
import { checkLogin, gotoLogin } from '@/utils/identity';
import KYPage from '@/components/KYPage';
import KYNumber from '@/components/KYNumber';
import classNames from 'classnames';
import { View, Text, Image } from '@tarojs/components';
import KYNavigation from '@/components/KYNavigation';
import { counsellingApi } from '@/services';
import { AppKeyEnum } from '@ky-middleground/commodity-type';
import { CONFIRM_ORDER_INFO } from '@/constants/values';
import { CounsellingCardProductTag, CounsellingCardProductType } from '@ky-client/counselling-type';
import { formatPrice } from '@/utils/util';
import styles from './index.module.less';

type Props = {};
type States = {
  // 选中索引
  activeIndex: number;
  // 产品列表
  productList: CounsellingCardProductType[];
  // 优惠充时卡余额
  balance: number;
};

@inject('store')
@observer
class StorageCard extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      activeIndex: 0,
      productList: [],
      balance: 0,
    };
  }
  // 购买须知文案
  buyNoticeArr = [
    '平台按优选定价(对话105元/30分钟，通话135元/30分钟）折算参考时长，实际可服务时长和服务单价根据即时咨询师服务定价综合计算。',
    '新人特惠商品仅限首次购买即时咨询服务的用户，限购1次，具体适用范围及服务内容以支付详情页展示为准。',
    '本充时卡通过充值方式激活，一经激活，交易金额将即时从余额中扣除；充时卡消费优惠不可与优惠券同时使用；充时卡咨询订单退款仍将原路返回至充时卡余额。',
    '即时咨询服务优惠充时卡充时金额分为实际充时金额和赠送金额：实际充时金额为用户实际支付的金额，充时后对应的服务内容归属于购买手机号，不可转赠、不可提现；赠送金额为按照充时满赠或其他优惠政策额外赠送的金额。',
    '如有多笔充时订单，余额将依购买时间先后顺序消耗，且同笔订单中优先消耗充时金额，全部充时金额消耗完毕再消耗赠送金额。',
    '如您选择不再使用充时卡或相关服务时，可以向平台提出退款要求，平台会根据退款规则审核后及时为您办理相关手续。同笔订单，当充时金额仍有余额时，可在扣除当前剩余充时金额的6%的手续费后一次性退款剩余余额，对应赠送金额自动清零；当前余额小于总赠送金额，则不退款。涉及多笔订单，分别退款。',
  ];
  buyTitle = ['', '适用范围', '使用方式', '充时卡余额', '消耗顺序', '退款规则'];

  async componentDidMount(): Promise<void> {
    const isLogin = await checkLogin();
    if (!isLogin) {
      console.log('当前路由', getCurrentFullRoute());
      gotoLogin(true, getCurrentFullRoute());
      return;
    }
    this.getCardInfo();
    this.getCardProductList();
  }

  handleToggleItem = (index: number) => {
    this.setState({
      activeIndex: index,
    });
  };
  // 获取余额
  getCardInfo = async () => {
    const { code, data } = await counsellingApi.cardInfo();
    if (code === 0) {
      console.log('余额===========', data);
      this.setState({ balance: data.balanceMoney });
    }
  };

  // 获取充值产品列表
  getCardProductList = async () => {
    const { code, data } = await counsellingApi.cardProductList();
    if (code === 0) {
      console.log('充值产品列表===========', data);
      // 遍历data, 找到data里tag属性，默认选中新用户， 否则选中最多人选
      const activeIndex = data.findIndex(
        (item) =>
          item.tag &&
          (item.tag === CounsellingCardProductTag.MOST ||
            item.tag === CounsellingCardProductTag.NEW),
      );
      this.setState({ productList: data, activeIndex });
    }
  };

  handleGoRecord = () => {
    // Taro.navigateTo({ url: '/subCounselling/pages/storageCardRecord/index' });
    navigateTo('/subCounselling/pages/storageCardRecord/index');
  };

  handleGoChangeCode = () => {
    // Taro.navigateTo({ url: '/subWallet/pages/exchangeCode/index' });
    navigateTo('/subWallet/pages/exchangeCode/index');
  };

  handleConfirmOrder = () => {
    const { productList, activeIndex } = this.state;
    Taro.setStorage({
      key: CONFIRM_ORDER_INFO,
      data: {
        appKey: AppKeyEnum.LY,
        appItemKey: productList[activeIndex].appItemKey,
        productId: productList[activeIndex].productId,
        extra: {
          productName: productList[activeIndex].productName,
          image: productList[activeIndex].productImage,
        },
      },
    });
    // Taro.redirectTo({ url: '/subCommon/pages/confirmOrder/index' });
    replaceTo('/subCommon/pages/confirmOrder/index');
  };

  handleContact = () => {
    // Taro.navigateTo({ url: `/subWebview/pages/webviewV1/index?qiyuShuntId=1098754` });
    navigateTo(`/subWebview/pages/webviewV1/index?qiyuShuntId=1098754`);
  };

  handleGoProtocol = () => {
    // Taro.navigateTo({
    //   url: `/subWebview/pages/md/index?protocolId=jishizixunchuzhikaxieyi`,
    // });
    navigateTo(`/subWebview/pages/md/index?protocolId=jishizixunchuzhikaxieyi`);
  };

  render() {
    const { activeIndex, productList, balance } = this.state;
    return (
      productList.length > 0 && (
        <KYPage className={styles.StorageCard}>
          <KYNavigation bgColor="#fff" showBack />
          {/* 头部 */}
          <View className={styles.header}>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/0000new-icon/kyclass/20250723_title.png"
            />
            <View className={styles.header_right} onClick={this.handleGoChangeCode}>
              <Text className={styles.txt}>兑换码</Text>
            </View>
          </View>
          {/* 我的余额 */}
          <View className={styles.myBalance}>
            <Text className={styles.txt}>我的余额：</Text>
            <View className={styles.money_wrapper}>
              <Text className={styles.symbol}>¥</Text>
              <KYNumber type="Bold" className={styles.money}>
                {formatPrice(balance)}
              </KYNumber>
            </View>
            <View className={styles.record} onClick={this.handleGoRecord}>
              <Text className={styles.txt}>记录</Text>
              <Image
                className={styles.img}
                src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
              />
            </View>
          </View>
          {/* 套餐列表 */}
          <View className={styles.package}>
            {productList.map((item, index) => (
              <View
                className={classNames(styles.package_item, {
                  [styles.active]: index === activeIndex,
                })}
                key={index}
                onClick={() => this.handleToggleItem(index)}
              >
                {/*右上角 */}
                {item.tag && (
                  <View
                    className={classNames({
                      [styles.sign]: true,
                      [styles.more]: item.tag === CounsellingCardProductTag.MOST,
                      [styles.new]: item.tag === CounsellingCardProductTag.NEW,
                    })}
                  >
                    {item.tag === CounsellingCardProductTag.NEW && (
                      <Text className={styles.txt}>新人特惠，限购一次</Text>
                    )}
                    {item.tag === CounsellingCardProductTag.MOST && (
                      <Text className={styles.txt}>最多人选</Text>
                    )}
                  </View>
                )}
                <View className={styles.left}>
                  <View className={styles.left_money}>
                    <View className={styles.symbol}>¥</View>
                    <KYNumber className={styles.money}>{item.money / 100}</KYNumber>
                  </View>
                  <View className={styles.left_money_free}>
                    <View className={styles.song}>送</View>
                    <View className={styles.song_money}>
                      <View className={styles.symbol}>¥</View>
                      <KYNumber className={styles.song_money_detail}>
                        {item.giveMoney / 100}
                      </KYNumber>
                    </View>
                  </View>
                </View>
                <View className={styles.right}>
                  <View className={styles.total_money}>
                    共¥{(item.money + item.giveMoney) / 100}
                  </View>
                  <View className={styles.detail}>{item.desc}</View>
                  <View className={styles.zhe}>{`每单低至约${item.discount}`}</View>
                </View>
              </View>
            ))}
          </View>
          {/* 充值按钮 */}
          <View className={styles.btn_wrapper} onClick={this.handleConfirmOrder}>
            <View className={styles.btn}>
              <Text className={styles.txt}>立即充值</Text>
              <Text className={styles.symbol}>¥</Text>
              <KYNumber type="Bold" className={styles.money}>
                {productList[activeIndex].money / 100}
              </KYNumber>
            </View>
          </View>
          {/* 购买须知 */}
          <View className={styles.buy_notice}>
            <View className={styles.buy_notice_header}>- 购买须知 -</View>

            {this.buyNoticeArr.map((item, index) => (
              <View className={styles.buy_notice_content} key={index}>
                {index + 1}、
                <Text className={styles.t}>
                  {this.buyTitle[index].length > 0 ? this.buyTitle[index] + '：' : ''}
                </Text>
                {item}
              </View>
            ))}
            {/* <View className={classNames(styles.buy_notice_content, styles.buy_notice_content_last)}>
              6、非不可抗力/特殊情况充值后不予退款，有问题请
              <Text className={styles.txt} onClick={this.handleContact}>
                联系客服
              </Text>
              ，相关规则见{' '}
              <Text className={styles.txt} onClick={this.handleGoProtocol}>
                《即时咨询卡服务协议》
              </Text>
              。
            </View> */}
          </View>
        </KYPage>
      )
    );
  }
}

export default StorageCard;
