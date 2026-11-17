import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image } from '@tarojs/components';
import styles from './index.module.less';

type States = {};
type Props = {
  info: {
    serviceImg: string;
    serviceText: string;
  };
};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  async componentDidMount() {
    console.log('componentDidMount');
    this.setState({});
  }

  render() {
    const { serviceImg, serviceText } = this.props.info;
    return (
      <View className={styles.index}>
        <View className={styles.success}>
          <Image
            className={styles.img}
            src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/consultant/pay_success_icon.png"
          />
          <View className={styles.text}>支付成功</View>
        </View>
        <View className={styles.info}>
          <Image showMenuByLongpress src={serviceImg} className={styles.img} />
          <View className={styles.text}>{serviceText}</View>
        </View>
      </View>
    );
  }
}

export default Index;
