import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image } from '@tarojs/components';
import { ConsultantBaseEnum } from '@ky-client/consultant-type';
import { AppItemKeyTypeEnum } from '@ky-frontend/common';
import Taro from '@tarojs/taro';
import KYNumber from '@/components/KYNumber';
import { formatPrice } from '@/modules/utils/format';
import { orderApi } from '@/services';
import { OrderRefundFieldsType } from '@ky-middleground/order-type';
import { AppKeyEnum } from '@ky-middleground/commodity-type';
import { formatBeijingDate, formatDate } from '@/utils/util';
import { KYLoading } from '@/components/KYLoading';
import classNames from 'classnames';
import styles from './index.module.less';
import { refundStatusToName } from './utils/order.util';

type IProps = {
  appKey: AppKeyEnum;
  hasMore: number;
};
type States = {
  appKey: AppKeyEnum;
  loading: boolean;
  hasMore: boolean;
  orderView: OrderRefundFieldsType[];
};

class CommonOrderView extends BaseKyComponent<IProps, States> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      hasMore: true,
      loading: true,
      appKey: props.appKey,
      orderView: [],
    };
  }

  showPage = false;

  static getDerivedStateFromProps(nextProps: IProps, prevState: States) {
    if (nextProps.appKey !== prevState.appKey) {
      return {
        appKey: nextProps.appKey,
        loading: true,
        hasMore: true,
        orderView: [],
      };
    }
    return null;
  }

  limit = 10;
  async componentDidMount() {
    this.getList();
  }

  componentDidUpdate(prevProps: Readonly<IProps>): void {
    if (prevProps.hasMore != this.props.hasMore) {
      this.getList(true);
    }
    if (prevProps.appKey !== this.state.appKey) {
      this.getList();
    }
  }

  /**
   * 格式化订单时间
   * @param appKey
   * @param dateStr
   * @returns
   */
  formatOrderTime = (appKey: AppKeyEnum, dateStr: string) => {
    if (appKey === AppKeyEnum.Zxs) {
      return formatBeijingDate(dateStr, 'YYYY-MM-DD HH:mm');
    }
    return formatDate(dateStr, 'YYYY-MM-DD HH:mm');
  };

  async getList(loadMore = false) {
    const pagination = {
      offset: 0,
      limit: this.limit,
    };
    if (loadMore) {
      pagination.offset = this.state.orderView.length;
    } else {
      pagination.offset = 0;
      pagination.limit = this.state.orderView.length || pagination.limit;
    }
    console.log('----getList----', this.state.appKey, pagination);
    this.setState({
      loading: true,
    });
    KYLoading.show();
    const res = await orderApi.getOrderList({
      appKey: this.state.appKey,
      pagination,
    });
    KYLoading.hide();
    if (res.code === 0) {
      const { orderList }: any = res.data;

      orderList.forEach((item: any) => {
        item.image = item.orderItems[0]?.image;
        item.title = item.orderItems[0]?.productName;
        // 退款状态
        item.extra.lastRefundStatus = item.status;

        switch (item.appKey) {
          case AppKeyEnum.YYF: {
            item.subTitle = item.extra?.talentName ? `主理人：${item.extra.talentName}` : '';
            break;
          }
          case AppKeyEnum.ASK: {
            item.subTitle = item.extra?.answerCount ? `${item.extra.answerCount}人回答` : '';
            break;
          }
          case AppKeyEnum.XLCP: {
            item.title = item.orderItems[0].skuName;
            break;
          }
          case AppKeyEnum.Zxs: {
            item.image = 'https://cdn-public.knowyourself.cc/icon/consultant/consultant_icon.png';
            item.subTitle = item.extra?.nickName ? `咨询师：${item.extra.nickName}` : '';
            item.subTitle2 = `咨询方式：${
              item.extra?.orderType === ConsultantBaseEnum.OrderTypeEnum.FACE_TO_FACE
                ? '面对面咨询'
                : '视频咨询'
            }`;
            break;
          }
          case 'coach': {
            item.title = item.extra?.outName || item.title;
          }
        }

        switch (item.appItemKey) {
          /** 当appItemkey是 AppItemKeyTypeEnum.Jssw，需处理一下字段信息 */
          case AppItemKeyTypeEnum.Jssw:
            if (item.extra) {
              item.orderMoney = item.extra.orderMoney || 0;
              item.refundMoney = item.extra.orderRefundMoney || 0;
              item.paidMoney = item.extra.orderMoney || 0;
            }
            break;
          case AppItemKeyTypeEnum.BeginningTarot:
            if (item.extra && item.extra.giveCount) {
              item.subTitle = `买${item.extra.count}次，送${item.extra.giveCount}次`;
            }
            break;
          case AppItemKeyTypeEnum.LifeTarot:
            if (item.extra && item.extra.giveCount) {
              item.subTitle = `买${item.extra.count}次，送${item.extra.giveCount}次`;
            }
            break;
          case AppItemKeyTypeEnum.LoveTarot:
            if (item.extra && item.extra.giveCount) {
              item.subTitle = `买${item.extra.count}次，送${item.extra.giveCount}次`;
            }
            break;
          case AppItemKeyTypeEnum.ExamCard:
            item.title = item.orderItems[0].productName;
            break;
          case AppItemKeyTypeEnum.Zxs: {
            item.title = '个体咨询';
            break;
          }
          case AppItemKeyTypeEnum.Partner: {
            item.title = '伴侣咨询';
            break;
          }
          default:
            break;
        }
      });

      if (loadMore) {
        this.setState({
          orderView: [...this.state.orderView, ...orderList],
          loading: false,
        });
      } else {
        this.setState({
          orderView: orderList,
          loading: false,
        });
      }
      if (!orderList.length) {
        this.setState({
          hasMore: false,
        });
      }
      if (!this.showPage) {
        this.showPage = true;
      }
    } else {
      this.setState({
        hasMore: false,
        loading: false,
      });
    }
  }

  toastToApp = () => {
    Taro.showToast({
      title: '请前往知我心理APP操作',
      icon: 'none',
      duration: 2000,
    });
  };
  onCopy = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: '复制成功', duration: 2000 }),
      fail: () => Taro.showToast({ title: '复制失败', duration: 2000 }),
    });
  };

  render() {
    const { orderView, appKey } = this.state;
    console.log('appKey', appKey);

    return (
      <View
        className={classNames({
          [styles.commonOrderList]: true,
          [styles.commonOrderListBG]: orderView.length === 0,
        })}
      >
        {orderView.length ? (
          <View className={styles.item}>
            {orderView.map((item: any) => {
              const itemExtra = item.extra || {};

              return (
                <View className={styles.ordercell} key={'order_' + item.orderId}>
                  <View className={styles.header}>
                    <View className={styles.hline}></View>
                    <View className={styles.orderNum}>
                      {item.orderId}
                      <Image
                        className={styles.img}
                        onClick={this.onCopy.bind(this, item.orderId)}
                        src="https://cdn-public.knowyourself.cc/icon/liaoyu/icon_copy_20230330.png"
                      />
                    </View>
                    <View className={styles.time}>
                      {this.formatOrderTime(
                        item.appKey,
                        item.orderSource === '1' ? item.paidTime : item.createdAt,
                      )}
                    </View>
                  </View>
                  <View className={styles.content} onClick={() => this.toastToApp()}>
                    <Image
                      src={
                        item.image ||
                        'https://cdn-public.knowyourself.cc/icon/liaoyu/chat_20230316.png'
                      }
                      className={classNames(styles.icon, {
                        [styles.coachImage]: item.appKey === 'coach',
                      })}
                    />
                    <View className={styles.info}>
                      <View className={styles.maintext}>
                        <View className={styles.title}>{item.title}</View>
                        {refundStatusToName(itemExtra.lastRefundStatus) ? (
                          <View
                            className={classNames(
                              styles.tag,
                              styles['tag' + itemExtra.lastRefundStatus],
                            )}
                          >
                            {refundStatusToName(itemExtra.lastRefundStatus)}
                          </View>
                        ) : null}
                      </View>
                      <View className={styles.subTitle}>{item.subTitle}</View>

                      <View className={classNames(styles.subTitle, styles.subTitle2)}>
                        {item.subTitle2}
                      </View>
                      <View className={styles.price}>
                        {[AppKeyEnum.ASK, AppKeyEnum.YYF, AppKeyEnum.XLCP].includes(
                          item.appKey,
                        ) ? null : (
                          <View className={styles.origin}>¥{formatPrice(item.orderMoney)}</View>
                        )}
                        <View className={styles.p2}>¥</View>
                        <KYNumber className={styles.p3}>{formatPrice(item.paidMoney)}</KYNumber>
                      </View>
                    </View>
                  </View>
                  <View
                    className={classNames({
                      [styles.footer]: true,
                      [styles.show]: appKey !== 'coach',
                    })}
                  >
                    <View className={styles.more} onClick={() => this.toastToApp()}>
                      更多
                    </View>
                    {itemExtra.canComment && !itemExtra.comment ? (
                      <View className={styles.gopingjia} onClick={() => this.toastToApp()}>
                        立即评价
                      </View>
                    ) : (
                      <View className={styles.seepingjia} onClick={() => this.toastToApp()}>
                        {itemExtra.comment ? '查看评价' : '查看详情'}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          !this.state.loading && (
            <View className={styles.noData}>
              <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/empty_img_20230321.png"
              />
              <View className={styles.text}>暂无订单</View>
            </View>
          )
        )}
      </View>
    );
  }
}

export default CommonOrderView;
