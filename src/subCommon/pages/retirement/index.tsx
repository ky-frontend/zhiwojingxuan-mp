import { observer, inject } from 'mobx-react';
import { Picker, View, Image } from '@tarojs/components';
import { formatDate } from '@/utils/dayjs.util';
import Taro from '@tarojs/taro';
import KYNavigation from '@/components/KYNavigation';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import classNames from 'classnames';
import styles from './index.module.less';
import StorageCardAd from './StorageCardAd';

type Props = {};
type States = {
  gender: number;
  birth: string;
  show: boolean;
  result: any;
};
@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      gender: 0,
      birth: formatDate(new Date().getTime(), 'YYYY-MM'),
      show: false,
      result: {
        age: '',
        delayMonth: '',
        time: '',
      },
    };
  }

  reset = () => {
    this.setState({
      gender: 0,
      birth: formatDate(new Date().getTime(), 'YYYY-MM'),
    });
  };
  selectOption = ['请选择', '男职工', '原法定退休年龄55周岁女职工', '原法定退休年龄50周岁女职工'];

  //tagAge 1965|1970|1975 diff 3|6 diffMonth 4|2,age 60 | 55|
  getData = (tagAge: number, diff: number, diffMonth: number, age: number) => {
    const year = Number(this.state.birth.split('-')[0]);
    const month = Number(this.state.birth.split('-')[1]);
    const diffYear = (year - tagAge) / diffMonth;
    let delayMonth1 = '';
    let delayAge = '';
    let delayTime = '';

    if (diffYear >= 0 && diffYear < diff) {
      // 延迟的月份
      const delayMonth = diffYear * 12 + Math.ceil(month / diffMonth);
      // 退休时间

      // 年份是否要+1 生日的月份与延迟的月份/12的余数 是否大于12
      const mm = month + (delayMonth % 12) > 12 ? 1 : 0;

      // 退休年纪
      const retirementAge = age + Math.floor(delayMonth / 12); //62 岁
      // 退休年纪的月份
      const retirementMonth = delayMonth % 12; // 11

      // 退休时间的年份 出生年纪+ 退休的年纪
      const retirementYear = year + retirementAge + mm; //2037
      // 退休时间的月份
      const retirementTimeMonth =
        (month + (delayMonth % 12)) % 12 === 0 ? 12 : (month + (delayMonth % 12)) % 12; //
      delayMonth1 = delayMonth.toFixed(0);
      delayAge = retirementAge + '岁' + (retirementMonth === 0 ? '' : retirementMonth + '个月');
      delayTime = retirementYear + '年' + retirementTimeMonth + '月';
    } else if (diffYear < 0) {
      // 正常退休年龄
      delayMonth1 = '0';
      delayAge = age + '岁';
      delayTime = Number(age + year) + '年' + month + '月';
    } else {
      // 正常退休年龄
      delayMonth1 = '36';
      delayAge = age + 3 + '岁';
      delayTime = Number(age + year + 3) + '年' + month + '月';
    }

    this.setState({
      show: true,
      result: {
        delayMonth: delayMonth1,
        age: delayAge,
        time: delayTime,
      },
    });
  };
  calculator = () => {
    // const BeginYear = new Date().getFullYear() < 2025 ? 2025 : new Date().getFullYear();
    switch (this.state.gender) {
      case 0:
        Taro.showToast({ title: '请选择性别及人员类型', icon: 'none' });
        return;
      case 1:
        this.getData(1965, 3, 4, 60);
        break;
      case 2:
        this.getData(1970, 3, 4, 55);
        break;
      case 3:
        this.getData(1975, 6, 2, 50);
        break;
    }
  };

  render() {
    const { birth, gender, show, result } = this.state;
    return (
      <KYPage className={styles.retirement}>
        <KYNavigation bgColor="#fff" showBack />
        <View className={styles.title}>法定退休年龄计算器</View>
        <View className={styles.container}>
          <View className={styles.upper}>
            <View className={styles.left}>出生年月</View>
            <Picker
              className={styles.picker}
              mode="date"
              value={birth}
              onChange={(e) => {
                this.setState({ birth: e.detail.value, show: false });
              }}
              fields="month"
            >
              <View className="picker">{birth}</View>
            </Picker>
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
          <View className={styles.upper}>
            <View className={styles.left}>性别及人员类型</View>
            <Picker
              mode="selector"
              value={gender}
              className={styles.picker}
              range={this.selectOption}
              onChange={(e) => {
                this.setState({ gender: Number(e.detail.value), show: false });
              }}
            >
              <View className="picker">{this.selectOption[gender]}</View>
            </Picker>
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
        </View>

        <View className={styles.btns}>
          <View className={classNames(styles.btn, styles.left)} onClick={this.reset}>
            重置
          </View>
          <View className={classNames(styles.btn, styles.right)} onClick={this.calculator}>
            查询
          </View>
        </View>
        <View className={styles.text}>
          说明：按照《关于实施渐进式延迟法定退休年龄的决定》附表对照关系，您通过法定退休年龄计算器，选择出生年月、性别及人员类型，即可计算出对应的改革后法定退休年龄、改革后退休时间、延迟月数。
        </View>

        <View className={show ? styles.result : styles.hide}>
          <View className={styles.title}>计算结果</View>
          <View className={styles.content}>
            <View className={styles.item}>
              您的改革后法定退休年龄为
              <View className={styles.inline}>{result.age}</View>
            </View>
            <View className={styles.item}>
              您的改革后退休时间为
              <View className={styles.inline}>{result.time}</View>
            </View>
            <View className={styles.item}>
              您的延迟月数为<View className={styles.inline}>{result.delayMonth}个月</View>
            </View>
          </View>
        </View>

        <StorageCardAd />
      </KYPage>
    );
  }
}

export default Index;
