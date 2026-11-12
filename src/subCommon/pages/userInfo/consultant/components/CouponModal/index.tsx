import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Text, Image } from '@tarojs/components';
import { MarketingModelType } from '@ky-middleground/marketing-type';
import classNames from 'classnames';
import { formatDate, formatPrice } from '@/utils/util';
import KYNumber from '@/components/KYNumber';
import { KYLoading } from '@/components/KYLoading';
import { marketingApi } from '@/services';
import styles from './index.module.less';

type CouponModalProps = {
  appItemKey: string;
  productId: string;
  couponCodeId: string;
  close: () => void;
  handleConfirmCoupon: (data: MarketingModelType.UserReceiveCouponModelType | null) => void;
};

type CouponModalState = {
  iconOpen: boolean;
  curIndex: number;
  curCouponIndex: number;
  currentActive: number;
  isChooseCoupon: boolean;
  availableCouponList: MarketingModelType.UserReceiveCouponModelType[];
  unavailableCouponList: MarketingModelType.UserReceiveCouponModelType[];
};

@inject('store')
@observer
class CouponModal extends BaseKyComponent<CouponModalProps, CouponModalState> {
  state = {
    availableCouponList: [],
    unavailableCouponList: [],
    iconOpen: false,
    curIndex: -1,
    curCouponIndex: -1,
    currentActive: 1,
    isChooseCoupon: false,
  };

  async componentDidMount() {
    console.log('index componentDidMount');
    await this.getAvailableCouponList('first');
    await this.getUnAvailableCouponList();
  }

  showContent = (index: number) => {
    this.setState({ iconOpen: !this.state.iconOpen, curIndex: index });
  };

  // 获取可使用优惠列表
  getAvailableCouponList = async (flag?: string) => {
    const { appItemKey, productId } = this.props;
    KYLoading.show();
    const res = await marketingApi.getAvailableCouponList(appItemKey, productId);
    KYLoading.hide();
    if (res.code == 0) {
      this.setState(
        {
          availableCouponList: res.data,
        },
        () => {
          if (
            flag === 'first' &&
            this.props.couponCodeId &&
            this.state.availableCouponList.length > 0
          ) {
            const index = this.state.availableCouponList.findIndex(
              (item: any) => item.couponCode === this.props.couponCodeId,
            );
            this.setState({ isChooseCoupon: true, curCouponIndex: index });
          }
        },
      );
    }
  };
  // 获取不可使用优惠列表
  getUnAvailableCouponList = async () => {
    const { appItemKey, productId } = this.props;
    KYLoading.show();
    const res = await marketingApi.getUnAvailableCouponList(appItemKey, productId);
    KYLoading.hide();
    if (res.code == 0) {
      this.setState({
        unavailableCouponList: res.data,
      });
    }
  };

  handleConfirm = () => {
    const { availableCouponList, curCouponIndex, isChooseCoupon } = this.state;
    this.props.handleConfirmCoupon(isChooseCoupon ? availableCouponList[curCouponIndex] : null);
    this.props.close();
  };

  render() {
    const {
      availableCouponList,
      unavailableCouponList,
      iconOpen,
      curIndex,
      currentActive,
      isChooseCoupon,
      curCouponIndex,
    } = this.state;
    const { close } = this.props;
    const timestamp = new Date().getTime();

    return (
      <View className={styles.coupon_wrapper} onClick={close}>
        <View
          className={styles.coupon_wrapper_content}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <View className={styles.title}>
            优惠券
            <Image
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/chat/closeWindow.png"
              className={styles.img}
              onClick={close}
            />
          </View>
          <View className={styles.use}>
            <Text
              className={classNames({
                [styles.can]: true,
                [styles.textActive]: currentActive === 1,
              })}
              onClick={() => {
                this.setState({ currentActive: 1 });
              }}
            >
              可用{availableCouponList.length}
            </Text>
            <Text
              className={classNames({
                [styles.no]: true,
                [styles.textActive]: currentActive === 2,
              })}
              onClick={() => {
                this.setState({ currentActive: 2 });
              }}
            >
              不可用{unavailableCouponList.length}
            </Text>
          </View>

          {/* 优惠券 */}
          <View className={styles.coupon_modal}>
            {currentActive === 1 &&
              (availableCouponList.length ? (
                <View className={styles.listBox}>
                  {availableCouponList.map(
                    (item: MarketingModelType.UserReceiveCouponModelType, index) => (
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
                            <KYNumber
                              className={styles.coupon_not_top_r_num}
                              type="Bold"
                              color="#F39B16"
                            >
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
                                [styles.showOneLine]: iconOpen
                                  ? index == curIndex
                                    ? false
                                    : true
                                  : true,
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
                              // <Text
                              //   className={styles.coupon_not_bottom_btn}
                              //   onClick={() => {
                              //     Taro.redirectTo({ url: '/subCounselling/pages/index/index' });
                              //   }}
                              // >
                              //   使用
                              // </Text>
                              <Image
                                src={
                                  isChooseCoupon && curCouponIndex == index
                                    ? 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_checked_icon.png'
                                    : 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_unchecked_icon.png'
                                }
                                onClick={() => {
                                  if (curCouponIndex === index && isChooseCoupon) {
                                    this.setState({ isChooseCoupon: false });
                                  } else {
                                    this.setState({ isChooseCoupon: true, curCouponIndex: index });
                                  }
                                }}
                                className={styles.img}
                              />
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
                    ),
                  )}
                  <View className={styles.confirm}>
                    <Text className={styles.txt} onClick={this.handleConfirm}>
                      确认
                    </Text>
                  </View>
                </View>
              ) : (
                <View className={styles.empty}>
                  <Image
                    className={styles.img}
                    src="https://cdn-public.knowyourself.cc/icon/my/empty_Illustration_profit@3x.png"
                  />
                  <View className={styles.text}>暂无可使用优惠券</View>
                </View>
              ))}

            {currentActive === 2 &&
              (unavailableCouponList.length ? (
                <View className={styles.listBox}>
                  {unavailableCouponList.map(
                    (item: MarketingModelType.UserReceiveCouponModelType, index) => (
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
                            <KYNumber
                              className={styles.coupon_not_top_r_num}
                              type="Bold"
                              color="#F39B16"
                            >
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
                                [styles.showOneLine]: iconOpen
                                  ? index == curIndex
                                    ? false
                                    : true
                                  : true,
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
                            {/* {_.used == 1 ? (
                          <Image
                            src="https://cdn-public.knowyourself.cc/icon/my/2024_2_20_used.png"
                            className={classNames({
                              [styles.coupon_not_bottom_img]: true,
                            })}
                          />
                        ) : _.endTime > timestamp ? (
                          <Text
                            className={styles.coupon_not_bottom_btn}
                            onClick={() => {
                              Taro.redirectTo({ url: '/subCounselling/pages/index/index' });
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
                        )} */}
                            <Image
                              src="https://cdn-public.knowyourself.cc/icon/my/coupon_no_use.png"
                              className={classNames({
                                [styles.coupon_not_bottom_img]: true,
                              })}
                            />
                          </View>
                        </View>
                      </View>
                    ),
                  )}
                </View>
              ) : (
                <View className={styles.empty}>
                  <Image
                    className={styles.img}
                    src="https://cdn-public.knowyourself.cc/icon/my/empty_Illustration_profit@3x.png"
                  />
                  <View className={styles.text}>暂无可使用优惠券</View>
                </View>
              ))}
          </View>
        </View>
      </View>
    );
  }
}

export default CouponModal;
