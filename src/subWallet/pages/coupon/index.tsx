import { observer, inject } from 'mobx-react';
import { formatDate, formatPrice } from '@/utils/util';
import { MarketingModelType } from '@ky-middleground/marketing-type';
import { marketingApi } from '@/services';
import KYNumber from '@/components/KYNumber';
import { replaceTo } from '@/utils/navigate';
import classNames from 'classnames';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image, Text } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import { KYLoading } from '@/components/KYLoading';
import KYNavigation from '@/components/KYNavigation';
import styles from './index.module.less';

type CouponProps = {};

type CouponState = {
  dataList: MarketingModelType.UserReceiveCouponModelType[];
  iconOpen: boolean;
  curIndex: number;
};

@inject('store')
@observer
class Coupon extends BaseKyComponent<CouponProps, CouponState> {
  state = {
    dataList: [],
    iconOpen: false,
    curIndex: -1,
  };
  offset = 0;

  async componentDidMount() {
    this.getList();
  }
  showContent = (index: number) => {
    this.setState({ iconOpen: !this.state.iconOpen, curIndex: index });
  };
  onReachBottom() {
    this.getList();
  }
  getList = async () => {
    KYLoading.show();
    const res = await marketingApi.getCouponList(this.state.dataList.length, 10);
    KYLoading.hide();
    if (res.code == 0) {
      this.setState({
        dataList: [...this.state.dataList, ...res.data],
      });
    }
  };
  render() {
    // 当前的时间戳
    const timestamp = new Date().getTime();
    const { dataList, iconOpen, curIndex } = this.state;

    return (
      <KYPage className={styles.coupon}>
        <KYNavigation className={styles.back} showBack title="优惠券" />
        {dataList.length ? (
          <View className={styles.listBox}>
            {dataList.map((item: MarketingModelType.UserReceiveCouponModelType, index) => (
              <View
                key={index}
                className={classNames({
                  [styles.coupon_not]: true,
                  [styles.coupon_has]:
                    item.endTime > timestamp
                      ? item.useTime
                        ? item.useTime > timestamp
                          ? true
                          : false
                        : true
                      : false,
                })}
              >
                <View
                  className={classNames({
                    [styles.upper]: true,
                    [styles.coupon_not_top_has]:
                      item.endTime > timestamp
                        ? item.useTime
                          ? item.useTime > timestamp
                            ? true
                            : false
                          : true
                        : false,
                  })}
                >
                  <View className={styles.coupon_not_top_l}>
                    <Text className={styles.coupon_not_top_l_t}>{item.couponName}</Text>
                    <Text className={styles.coupon_not_top_l_b}>
                      有效期:{formatDate(item.startTime, 'YYYY.M.D')}-
                      {formatDate(item.endTime, 'YYYY.M.D')}
                    </Text>
                  </View>
                  <View className={styles.price}>
                    <KYNumber
                      className={styles.coupon_not_top_r_symbol}
                      type="Bold"
                      color="#F39B16"
                    >
                      ¥
                    </KYNumber>
                    <KYNumber className={styles.coupon_not_top_r_num} type="Bold" color="#F39B16">
                      {formatPrice(item.amount).split('.')[0]}
                    </KYNumber>
                  </View>
                </View>
                <View
                  className={classNames({
                    [styles.coupon_not_bottom]: true,
                    [styles.coupon_not_bottom_has]: true,
                  })}
                >
                  <View className={styles.coupon_not_bottom_l}>
                    <Text
                      className={classNames({
                        [styles.coupon_not_bottom_des]: true,
                        // [styles.showOneLine]: index != curIndex && !iconOpen,
                        [styles.showOneLine]: iconOpen ? (index == curIndex ? false : true) : true,
                      })}
                    >
                      {item.useRuleDesc}
                    </Text>
                    {/* 文字太短不显示图标 */}
                    {item.useRuleDesc.length > 14 && (
                      <View className={styles.img} onClick={() => this.showContent(index)}>
                        <Image
                          className={styles.imgArr}
                          src={
                            iconOpen && curIndex == index
                              ? 'https://cdn-public.knowyourself.cc/icon/my/ic_up_and_down_arrow.png'
                              : 'https://cdn-public.knowyourself.cc/icon/my/2024_2_21_arr.png'
                          }
                        />
                      </View>
                    )}
                  </View>
                  <View className={styles.state}>
                    {item.used == 1 ? (
                      <Image
                        src="https://cdn-public.knowyourself.cc/icon/my/2024_2_20_used.png"
                        className={classNames({
                          [styles.coupon_not_bottom_img]: true,
                        })}
                      />
                    ) : item.endTime > timestamp ? (
                      <Text
                        className={styles.coupon_not_bottom_btn}
                        onClick={() => {
                          replaceTo('/subCounselling/pages/index/index');
                        }}
                      >
                        使用
                      </Text>
                    ) : (
                      <Image
                        src="https://cdn-public.knowyourself.cc/icon/my/coupon_no_use.png"
                        className={classNames({
                          [styles.coupon_not_bottom_img]: true,
                        })}
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
            {/* 底部提示 */}
            <Text className={styles.coupon_b_txt}>- 已过期的优惠券仅展示30天 -</Text>
          </View>
        ) : (
          <View className={styles.empty}>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/my/empty_Illustration_profit@3x.png"
            />
            <View className={styles.text}>暂无可使用优惠券</View>
          </View>
        )}
      </KYPage>
    );
  }
}

export default Coupon;
