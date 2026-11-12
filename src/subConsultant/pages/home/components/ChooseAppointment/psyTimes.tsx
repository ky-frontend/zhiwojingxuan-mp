import BaseKyComponent from '@/components/BaseKyComponent';
import styles from './index.module.less';
import KYNumber from '@/components/KYNumber';
// import { Toast } from 'antd-mobile';
import withRouter from '@/components/WithRouter';
import { View, Text } from '@tarojs/components';
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
type IProps = {
  times: ScheduleTimes;
  selectdTimes: string;
  onClickDate: (date: string) => void;
};
type States = {};

// OrderList
class AppointmentTimes extends BaseKyComponent<IProps, States> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  // 选择单日时间
  onSelectDay = (date: string) => {
    const atime = this.props.times.find((val) => val.date == date);
    if (atime?.status == 1 || atime?.status == 2) {
      return;
    }
    this.props.onClickDate(date);
  };

  render() {
    const { times, selectdTimes } = this.props;
    return (
      <View className={styles.daysRow}>
        {times.map((item, index) => {
          const isSelected = selectdTimes == item.date;
          const isrest = item.status == 2;
          const leftcount = item.availableNum;
          // item.date 2023-11-07
          const week = item.week;
          const day = item.date.split('-')[2];
          const month = item.date.split('-')[1];

          return (
            <View
              key={'times' + index}
              className={styles.daysItem}
              onClick={() => {
                this.onSelectDay(item.date);
              }}
            >
              <View className={isSelected ? styles.topItemSelcted : styles.topItem}>
                <View className={styles.week}>{week}</View>
                <KYNumber className={styles.day}>
                  {month}.{day}
                </KYNumber>
              </View>
              {isrest ? (
                <Text className={styles.rest}>休息</Text>
              ) : (
                <View>
                  {leftcount == 0 ? (
                    <Text className={styles.rest}>已满</Text>
                  ) : (
                    <View className={styles.left}>
                      <Text>余</Text>
                      <Text className={styles.leftCount}>{leftcount}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  }
}

export default withRouter(AppointmentTimes);
