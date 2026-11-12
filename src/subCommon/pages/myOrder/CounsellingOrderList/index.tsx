import BaseKyComponent from '@/components/BaseKyComponent';
import KYNumber from '@/components/KYNumber';
import { View, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { formatDate } from '@/utils/util';
import { formatPrice } from '@/modules/utils/format';
import { KYLoading } from '@/components/KYLoading';
import { orderApi } from '@/services';
import type { OrderRefundFieldsType } from '@ky-middleground/order-type';
import { AppKeyEnum } from '@ky-middleground/commodity-type';
import { AppItemKeyTypeEnum } from '@ky-frontend/common';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames';
import { getAppItemKeyText, refundStatusToName } from './utils/order.util';
import styles from './index.module.less';

type IProps = {
  hasMore: number;
};
type States = {
  // loading: boolean;
  orderView: OrderRefundFieldsType[];
};

@inject('store')
@observer
class CounsellingOrderView extends BaseKyComponent<IProps, States> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      orderView: [],
    };
  }

  showPage = false;

  async componentDidMount() {
    this.getView();
  }

  componentDidUpdate(prevProps: Readonly<IProps>): void {
    if (prevProps.hasMore != this.props.hasMore) {
      this.getView();
    }
  }
  async getView() {
    KYLoading.show();
    const res = await orderApi.getOrderList({
      appKey: AppKeyEnum.LY,
      pagination: {
        offset: this.state.orderView.length,
        limit: 10,
      },
    });

    KYLoading.hide();
    if (res.code === 0) {
      const { orderList }: any = res.data;
      this.setState({
        orderView: [...this.state.orderView, ...orderList],
      });
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
        duration: 2000,
      });
    }
  }
  // onReachBottom() {
  //   console.log(this.state.orderView.length);
  //   this.getView();
  // }

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
    const { orderView } = this.state;

    return (
      <View
        className={classNames({
          [styles.counsellingOrderView]: true,
          [styles.counsellingOrderViewBG]: orderView.length === 0,
        })}
      >
        {orderView.length != 0 ? (
          <View className={styles.item}>
            {orderView.map((item: any, index) => {
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
                      {formatDate(item.paidTime, 'YYYY-MM-DD HH:mm')}
                    </View>
                  </View>
                  <View className={styles.content} onClick={() => this.toastToApp()}>
                    <Image
                      src={
                        item.appItemKey === AppItemKeyTypeEnum.LyCard
                          ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/liaoyu／chat@2x.png'
                          : 'https://cdn-public.knowyourself.cc/icon/liaoyu/chat_20230316.png'
                      }
                      className={styles.icon}
                    />
                    <View className={styles.info}>
                      <View className={styles.maintext}>
                        <View className={styles.title}>
                          {getAppItemKeyText(item.appItemKey)}
                          {itemExtra.orderType === 2 ? '(赠送)' : ''}
                        </View>
                        <View
                          className={classNames(
                            styles.tag,
                            styles['tag' + itemExtra.lastRefundStatus],
                          )}
                        >
                          {refundStatusToName(itemExtra.lastRefundStatus)}
                        </View>
                      </View>
                      <View className={styles.doctor}>
                        {item.appItemKey !== AppItemKeyTypeEnum.LyCard &&
                          `聊愈师：${itemExtra.doctorData?.userAliasCounsellingName}`}
                      </View>
                      {item.appItemKey !== AppItemKeyTypeEnum.LyCard ? (
                        <View className={styles.price}>
                          <View className={styles.origin}>
                            ¥{formatPrice(item.extra.orderTotalMoney)}
                          </View>
                          <View className={styles.p2}>¥</View>
                          <KYNumber className={styles.p3}>
                            {formatPrice(item.extra.paidTotalMoney)}
                          </KYNumber>
                        </View>
                      ) : (
                        <View className={styles.price}>
                          <View className={styles.p2}>¥</View>
                          <KYNumber className={styles.p3}>{formatPrice(item.paidMoney)}</KYNumber>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className={styles.footer}>
                    <View
                      className={styles.more}
                      onClick={() => {
                        this.toastToApp();
                      }}
                    >
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
          <View className={styles.noData}>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/liaoyu/empty_img_20230321.png"
            />
            <View className={styles.text}>暂无订单</View>
          </View>
        )}
      </View>
    );
  }
}

export default CounsellingOrderView;
