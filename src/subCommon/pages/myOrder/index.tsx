import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import styles from './index.module.less';
import CommonOrderList from './CommonOrderList';

type Props = {};
type States = {
  offset: number;
};
@inject('store')
@observer
class MyOrder extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      offset: 0,
    };
  }

  onReachBottom() {
    this.setState({ offset: this.state.offset + 1 });
  }

  render() {
    return (
      <KYPage className={styles.MyOrder}>
        <KYNavigation showBack title="我的订单" className={styles.MyOrder_navBg} />
        <CommonOrderList hasMore={this.state.offset} appKey={'coach' as any} />
      </KYPage>
    );
  }
}

export default MyOrder;
