import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
// import { Button, View, Image } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
// import { userApi } from '@/services';
import styles from './index.module.less';

type PageStateProps = {};

interface Index {
  props: PageStateProps;
}

@inject('store')
@observer
class Index extends BaseKyComponent {
  async componentDidMount() {
    console.log('index componentDidMount');
    // const res = await userApi.getCountryCodeList();
    // console.log(res);
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
        <KYNavigation showBack={false} />1
      </KYPage>
    );
  }
}

export default Index;
