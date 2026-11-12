import { goQiYuLink } from '@/modules/qiyu';
import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYNavigation from '@/components/KYNavigation';
import KYPage from '@/components/KYPage';
import styles from './index.module.less';

type Props = {};
type States = {};
@inject('store')
@observer
class QiYuIm extends BaseKyComponent<Props, States> {
  async onLoad(option) {
    goQiYuLink(option.shuntId || '');
  }
  componentWillUnmount() {
    console.log('index componentWillUnmount');
  }

  componentDidShow() {
    console.log('index componentDidShow');
  }

  componentDidHide() {
    console.log('index componentDidHide');
  }

  render() {
    return (
      <KYPage className={styles.index}>
        <KYNavigation showBack className={styles.nav} />
        <View className={styles.qiYuIm}></View>
      </KYPage>
    );
  }
}

export default QiYuIm;
