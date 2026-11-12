import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import styles from './index.module.less';

type Props = {};
type States = {
  src: string;
  title: string;
};
@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      src: '',
      title: '',
    };
  }

  async onLoad(opt: { img: string; title: string }) {
    const { img, title } = opt;
    if (!img || !title) {
      Taro.showToast({ title: '参数错误', icon: 'none' });
    }

    this.setState({ src: img, title });
  }

  render() {
    const { src, title } = this.state;
    return (
      <KYPage className={styles.index}>
        <KYNavigation showBack />
        <View className={styles.info}>
          <image show-menu-by-longpress src={src} className={styles.img} />
          <View className={styles.text}>{title}</View>
        </View>
      </KYPage>
    );
  }
}

export default Index;
