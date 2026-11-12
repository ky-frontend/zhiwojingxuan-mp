import BaseKyComponent from '@/components/BaseKyComponent';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNumber from '@/components/KYNumber';
import classNames from 'classnames';
import KYNavigation from '@/components/KYNavigation';
import { counsellingApi } from '@/services';
import { CounsellingCardLogType } from '@ky-client/counselling-type';
import { formatPrice } from '@/utils/util';
import styles from './index.module.less';

type Props = {};
type States = {
  pageConfig: {
    limit: number;
    pageSize: number;
  };
  recordData: CounsellingCardLogType[];
  // 是否有更多数据
  hasMore: boolean;
};

@inject('store')
@observer
class StorageCardRecord extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      // 页码配置
      pageConfig: {
        limit: 10,
        pageSize: 0,
      },
      recordData: [],
      hasMore: true,
    };
  }

  componentDidMount(): void {
    this.getCardLogList();
  }

  onReachBottom() {
    if (this.state.hasMore) {
      this.getCardLogList();
    }
  }

  // 获取优惠充时卡消费记录列表
  getCardLogList = async () => {
    const { pageConfig, recordData } = this.state;
    const { code, data } = await counsellingApi.cardLogList(pageConfig);
    if (code === 0) {
      console.log('优惠充时卡消费记录列表===========', data);
      this.setState({
        recordData: [...recordData, ...data.list],
        hasMore: data.total > pageConfig.pageSize + data.list.length,
        pageConfig: { ...pageConfig, pageSize: pageConfig.pageSize + data.list.length },
      });
    }
  };

  render() {
    const { recordData } = this.state;
    return (
      <KYPage className={styles.StorageCardRecord}>
        <KYNavigation bgColor="#fff" showBack title="使用记录" />
        {recordData.length > 0 ? (
          <>
            {recordData.map((item, index) => (
              <View className={styles.record_item} key={index}>
                <View className={styles.left}>
                  <View className={styles.name}>{item.title}</View>
                  <View className={styles.date}>{item.paidTimeDate}</View>
                </View>
                <View className={styles.right}>
                  <KYNumber
                    className={classNames(styles.money, {
                      [styles.decrease]: item.changeType === 'reduce',
                    })}
                  >
                    {(item.changeType === 'reduce' ? '-' : '+') + formatPrice(item.money)}
                  </KYNumber>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View className={styles.empty}>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/liaoyu/empty_img_20230321.png"
            />
            <View className={styles.txt}>暂无记录</View>
          </View>
        )}
      </KYPage>
    );
  }
}

export default StorageCardRecord;
