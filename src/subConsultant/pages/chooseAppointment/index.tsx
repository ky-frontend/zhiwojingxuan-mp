import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { consultantApi } from '@/services';
import { IRouteProps } from '@/components/WithRouter';
import { getQuery } from '@/modules/utils/navigate';
import classNames from 'classnames';
import { replaceTo } from '@/utils/navigate';
import {
  ConsultantBaseEnum,
  ConsultantModelType,
  ConsultantUserType,
} from '@ky-client/consultant-type';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import KYNavigation from '@/components/KYNavigation';
import { CONFIRM_ORDER_INFO } from '@/constants/values';
import AppointmentTimes from './psyTimes';
import styles from './index.module.less';

type ScheduleTimes = {
  /** 日期，格式为 "2023-11-07" */
  date: string;
  /** 周几，例如 "周一" 或 "周二" */
  week: string;
  /** 状态 0可用 1不可用 2休息  */
  status: number;
  /** 可预约数量 */
  availableNum: number;
}[];

type IProps = IRouteProps;
type States = {
  productInfo: ConsultantModelType.ConsultantProduct;
  nickName: string;
  loading: boolean;
  times: ScheduleTimes;
  hours: ConsultantUserType.ConsultantScheduleType[];
  selectdTimes: string;
  selectdHours: string;
  orderId: string;
  way: string;
  productList: ConsultantModelType.ConsultantProduct[];
  haveFaceToFace: boolean;
};
// ChooseAppointment
class ChooseAppointment extends BaseKyComponent<IProps, States> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      productInfo: {} as ConsultantModelType.ConsultantProduct,
      nickName: '',
      loading: true,
      times: [],
      hours: [],
      selectdTimes: '1',
      selectdHours: '',
      orderId: '',
      way: '0',
      productList: [],
      haveFaceToFace: false,
    };
  }
  showPage = false;
  async componentDidMount() {
    this.setState({ orderId: getQuery('orderId') ?? '' });
    this.getProduct();
    this.getDatas(ConsultantBaseEnum.OrderTypeEnum.VIDEO);
  }
  async getProduct() {
    const id: string = getQuery('id');
    const productList = await consultantApi.getProductList(id);
    // 获取产品信息
    // const product = await consultantApi.getProductId(id);
    // if (product.code == 0) {
    //   this.setState({ productId: product.data.productId ?? '', nickName: product.data.nickName });
    // }
    if (productList.code === 0) {
      this.setState({
        productList: productList.data,
        productInfo: productList.data[0],
      });
    }
    // 获取产品信息
    // const product = await consultantApi.getProductId(id);
    // if (product.code == 0) {
    //   this.setState({ productId: product.data.productId ?? '', nickName: product.data.nickName });
    // }
  }

  // 获取天
  async getDatas(way: ConsultantBaseEnum.OrderTypeEnum) {
    const id: string = getQuery('id');
    const res = await consultantApi.getAvailableScheduleV2(id, way);
    const temp = res.data.scheduleList ?? [];
    if (temp.length <= 0) {
      return;
    }
    const atime = temp.find((val) => val.status == 0 && val.availableNum > 0);
    this.setState(
      {
        nickName: res.data.consultantUserInfo?.nickName ?? '',
        times: temp,
        selectdTimes: atime?.date ?? '',
        haveFaceToFace: res.data.consultantUserInfo?.isFaceToFace === 1 ? true : false,
      },
      () => {
        this.getHours(atime?.date ?? '');
      },
    );
  }

  // 获取小时
  async getHours(date: string) {
    if (date.length === 0) {
      this.setState({ hours: [], selectdHours: '' });
      return;
    }
    const id: string = getQuery('id');
    const atime = this.state.times.find((val) => val.date == date);
    const hours = await consultantApi.getGetScheduleTimeV2(
      atime?.date ?? '',
      atime?.week ?? '',
      id,
      this.state.way === '0'
        ? ConsultantBaseEnum.OrderTypeEnum.VIDEO
        : ConsultantBaseEnum.OrderTypeEnum.FACE_TO_FACE,
    );
    if (hours.code !== 0) {
      return;
    }
    // 默认选择一个可选择的时间
    const selected = hours.data.find((val) => val.status == 1);
    this.setState({
      selectdHours: selected?.scheduleId ?? '',
      hours: hours.data,
    });
  }

  // 选择单日时间-重新获取小时数据
  onSelectDay = (date: string) => {
    this.setState({
      selectdTimes: date,
    });
    this.getHours(date);
  };

  onSelectHoure = (item: ConsultantUserType.ConsultantScheduleType) => {
    if (item.status != 1) {
      return;
    }

    this.setState({
      selectdHours: item.scheduleId,
    });
  };
  onTapSure = () => {
    if (this.state.productInfo.productId.length === 0) {
      Taro.showToast({
        title: '请选择产品',
        icon: 'none',
      });
      return;
    }
    if (this.state.selectdHours.length === 0) {
      Taro.showToast({
        title: '请选择时间',
        icon: 'none',
      });
      return;
    }

    if (this.state.orderId.length > 0) {
      // 修改时间
      this.editTime();
    } else {
      this.goToConfirmOrder();
    }
  };
  async editTime() {
    // Modal.confirm({
    //   content: '确定修改时间？提交后将向咨询师发送申请，原定时间将会被释放。',
    //   onConfirm: async () => {
    //     const aHour = this.state.hours.find((val) => val.scheduleId == this.state.selectdHours);
    //     KYLoading.show();
    //     const res = await consultantApi.updateAppointmentTime(
    //       this.state.orderId,
    //       aHour?.scheduleId ?? '',
    //     );
    //     if (res.code != 0) {
    //       Toast.show(res.message);
    //        Taro.showToast(res.message);
    //       return;
    //     }
    //     Toast.show('修改成功');
    //      Taro.showToast('修改成功');
    //     KYLoading.hide();
    //   },
    //   onCancel: () => {
    //     console.log('Canceled');
    //   },
    // });
  }
  goToConfirmOrder() {
    if (this.state.productInfo.productId.length === 0) {
      return;
    }
    // 选择时间-创建订单
    const aHour =
      this.state.hours.find((val) => val.scheduleId === this.state.selectdHours) || null;
    if (!aHour) {
      Taro.showToast({ title: '请重新选择以下预约时间～' });
      return;
    } else {
      const scheduleTime =
        (aHour?.month ?? '') + '月' + (aHour?.day ?? '') + '日 ' + (aHour?.time ?? '');
      Taro.setStorage({
        key: CONFIRM_ORDER_INFO,
        data: {
          appKey: this.state.productInfo.appKey,
          appItemKey: this.state.productInfo.appItemKey,
          productId: this.state.productInfo.productId,
          extra: {
            orderType:
              this.state.way === '0'
                ? ConsultantBaseEnum.OrderTypeEnum.VIDEO
                : ConsultantBaseEnum.OrderTypeEnum.FACE_TO_FACE,
            counselorId: getQuery('id') ?? '',
            scheduleId: aHour?.scheduleId ?? '',
            nickName: this.state.nickName,
            scheduleTime: scheduleTime,
          },
        },
      });
      // 跳转确认订单页面
      // Taro.redirectTo({ url: '/subCommon/pages/confirmOrder/index' });
      replaceTo('/subCommon/pages/confirmOrder/index');
    }
  }
  changeTab = (tab: string, way: ConsultantBaseEnum.OrderTypeEnum) => {
    if (this.state.way !== tab) {
      this.setState({ way: tab });
      this.getDatas(way);
    }
  };

  render() {
    const hours = this.state.hours ?? [];
    const selectdHours = this.state.selectdHours;
    // status 0 咨询师未排期，1排期了可用 2排期了不可下单
    const mor = hours
      .filter((val) => val.timePeriodName == 1 && val.status != 0)
      .sort((a, b) => a.timeStamp - b.timeStamp);
    const afer = hours
      .filter((val) => val.timePeriodName == 2 && val.status != 0)
      .sort((a, b) => a.timeStamp - b.timeStamp);
    const even = hours
      .filter((val) => val.timePeriodName == 3 && val.status != 0)
      .sort((a, b) => a.timeStamp - b.timeStamp);
    const allHours = [mor, afer, even].filter((array) => array.length > 0); // even
    const titles = [
      {
        icon: 'https://cdn-public.knowyourself.cc/icon/chat/time_morning.png',
        title: '上午',
      },
      {
        icon: 'https://cdn-public.knowyourself.cc/icon/chat/time_afternoon.png',
        title: '下午',
      },
      {
        icon: 'https://cdn-public.knowyourself.cc/icon/chat/time_night.png',
        title: '夜晚',
      },
    ];

    return (
      <KYPage className={styles.chooseAppointment}>
        <KYNavigation showBack className={styles.navBg} bgColor="#fff"></KYNavigation>
        <View className={styles.title}>
          <View className={styles.line}></View>
          咨询方式
        </View>

        <View className={styles.selection}>
          <View
            onClick={() => {
              this.changeTab('0', ConsultantBaseEnum.OrderTypeEnum.VIDEO);
            }}
            className={classNames(styles.item, { [styles.ac]: this.state.way == '0' })}
          >
            视频咨询
          </View>
          <View
            onClick={() => {
              this.changeTab('1', ConsultantBaseEnum.OrderTypeEnum.FACE_TO_FACE);
            }}
            className={classNames(styles.item, {
              [styles.ac]: this.state.way == '1',
              [styles.disappear]: !this.state.haveFaceToFace,
            })}
          >
            面对面咨询
          </View>
        </View>

        <View
          className={classNames(styles.title, {
            [styles.disappear]: this.state.productList.length <= 1,
          })}
        >
          <View className={styles.line}></View>
          咨询对象
        </View>

        <View
          className={classNames(styles.selection, {
            [styles.disappear]: this.state.productList.length <= 1,
          })}
        >
          {this.state.productList.map((item, index) => (
            <View
              key={'product' + index}
              onClick={() => {
                this.setState({ productInfo: item });
              }}
              className={classNames(styles.item, {
                [styles.ac]: this.state.productInfo.productId === item.productId,
              })}
            >
              {item.appItemKey === 'zxs' ? '个体咨询' : '伴侣咨询'}
            </View>
          ))}
        </View>
        <View>
          {/* 头部 可约时间 */}
          <View className={styles.top}>
            <View className={styles.topTitle}>
              <View className={styles.line}></View>
              <Text className={styles.time}>可约时间</Text>
              <Text className={styles.bjsj}>（北京时间）</Text>
            </View>
            {/* <View className={styles.topSeper}></View> */}
          </View>
          {/* 内容 */}
          <View className={styles.content}>
            {/* 选择天 */}
            <AppointmentTimes
              times={this.state.times}
              selectdTimes={this.state.selectdTimes}
              onClickDate={(date: string) => {
                this.onSelectDay(date);
              }}
            ></AppointmentTimes>

            <View className={styles.daysline}></View>

            {/* 选择上午 */}
            {allHours.map((ahour, i) => {
              const titleIndex = ahour[0].timePeriodName - 1;
              return (
                <View className={styles.hours} key={'hours1' + i}>
                  {/* icon + 上午 */}
                  <View className={styles.hoursHeader}>
                    <Image className={styles.headerIcon} src={titles[titleIndex].icon}></Image>
                    <View className={styles.headerTitle}>{titles[titleIndex].title}</View>
                  </View>
                  {ahour.filter((val) => val.status == 1).length == 0 ? (
                    <View className={styles.hoursEmpty}>时间已约满</View>
                  ) : (
                    <View className={styles.hourContent}>
                      {ahour.map((item, j) => {
                        const isSelected = selectdHours == item.scheduleId;
                        let className = styles.timeNormal;
                        if (isSelected) {
                          className = styles.timeSelected;
                        }
                        if (item.status == 2) {
                          className = styles.timeDisable;
                        }
                        return (
                          <Text
                            className={className}
                            key={'hours2' + j}
                            onClick={() => {
                              this.onSelectHoure(item);
                            }}
                          >
                            {item.time}
                          </Text>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        {/* </List> */}
        {/* 底部确认修改 */}
        <View className={styles.bottomBtn_wrapper}>
          <View
            className={styles.bottomBtn}
            style={
              this.state.selectdTimes === ''
                ? {
                    opacity: 0.5,
                    pointerEvents: 'none',
                    cursor: 'not-allowed',
                  }
                : {}
            }
            onClick={() => {
              this.onTapSure();
            }}
          >
            {this.state.orderId.length > 0 ? '确认修改' : '确认选择'}
          </View>
        </View>
      </KYPage>
    );
  }
}

export default ChooseAppointment;
