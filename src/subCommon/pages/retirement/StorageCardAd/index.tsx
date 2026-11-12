import Taro from '@tarojs/taro';
import BaseKyComponent from '@/components/BaseKyComponent';
import { observer, inject } from 'mobx-react';
import KYPage from '@/components/KYPage';
import KYNumber from '@/components/KYNumber';
import classNames from 'classnames';
import { View, Text, Image } from '@tarojs/components';
import { navigateTo, reLaunchTo, replaceTo } from '@/utils/navigate';
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
    '1、以上折扣信息以优选聊愈师定价：对话3.5元/分钟，通话4.5元/分钟计算，消费时以实际为准。',
    '2、新人特惠商品仅限从未下过即时咨询订单的用户购买，限购1次。',
    '3、充值后储值资产归属于购买手机号，充值成功后赠送金额自动计入卡内余额，不可转赠。',
    '4、如有多笔充值订单按购买时间先后顺序消耗，优先消耗充值本金，充值本金消耗完毕后再消耗赠送金额。',
    '5、使用储值卡消费即时咨询时，不可与优惠券同时使用。',
  ];

  componentDidMount(): void {
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
      this.setState({ balance: data.balanceMoney });
    }
  };

  // 获取充值产品列表
  getCardProductList = async () => {
    const { code, data } = await counsellingApi.cardProductList();
    if (code === 0) {
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
    // Taro.reLaunch({ url: '/subCounselling/pages/index/index' });
    reLaunchTo('/subCounselling/pages/index/index');
    // Taro.navigateBack();
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
          {/* 头部 */}
          <View className={styles.header}>
            <View className={styles.header_left}>
              <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/lyCardTitle@3x.png"
              />
            </View>
            <View className={styles.header_right} onClick={this.handleGoChangeCode}>
              <Text className={styles.txt}>去聊愈</Text>
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
                className={styles.image}
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
                {item}
              </View>
            ))}
            <View className={classNames(styles.buy_notice_content, styles.buy_notice_content_last)}>
              6、非不可抗力/特殊情况充值后不予退款，有问题请
              <Text className={styles.txt} onClick={this.handleContact}>
                联系客服
              </Text>
              ，相关规则见{' '}
              <Text className={styles.txt} onClick={this.handleGoProtocol}>
                《即时咨询卡服务协议》
              </Text>
              。
            </View>
          </View>
        </KYPage>
      )
    );
  }
}

export default StorageCard;
