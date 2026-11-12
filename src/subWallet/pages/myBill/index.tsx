import BaseKyComponent from '@/components/BaseKyComponent';
import { observer, inject } from 'mobx-react';
import KYPage from '@/components/KYPage';
import { View } from '@tarojs/components';
import KYNavigation from '@/components/KYNavigation';
import { WalletListResponse } from '@ky-middleground/wallet-type';
import { walletApi } from '@/services';
import classNames from 'classnames';
import { formatPriceNoZero } from '@/utils/util';
import styles from './index.module.less';

type Props = {};
type States = {
  offset: number;
  limit: number;
  billList: WalletListResponse[];
  isNoData: boolean;
};

@inject('store')
@observer
class MyBill extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      offset: 0,
      limit: 20,
      billList: [],
      isNoData: false,
    };
  }

  async componentDidMount(): Promise<void> {
    this.init();
  }

  init = async () => {
    const { offset, limit, billList } = this.state;
    const { code, data } = await walletApi.getWalletList({ offset, limit });
    if (code === 0) {
      console.log('data', data);

      this.setState({
        billList: [...billList, ...data.list],
        offset: offset + data.list.length,
        isNoData: data.list.length < limit,
      });
    }
  };

  onReachBottom() {
    if (!this.state.isNoData) {
      this.init();
    }
  }

  render() {
    const { billList } = this.state;
    return (
      <KYPage className={styles.outter}>
        <KYNavigation title="我的账单" bgColor="#fff" />

        {billList.length > 0 &&
          billList.map((v, i) => (
            <View className={styles.billitem} key={i}>
              <View className={styles.leftarea}>
                <View className={styles.titleword}>{v.title}</View>
                <View className={styles.time}>{v.startTime}</View>
              </View>
              <View className={styles.rightarea}>
                <View
                  className={classNames(styles.reducenum, {
                    [styles.addnum]: !['consume', 'deduction'].includes(v.type),
                  })}
                >
                  {`${['consume', 'deduction'].includes(v.type) ? '-' : '+'}` +
                    `${formatPriceNoZero(v.money)}`}
                </View>
                <View className={styles.underword}>月亮币</View>
              </View>
            </View>
          ))}
      </KYPage>
    );
  }
}

export default MyBill;
