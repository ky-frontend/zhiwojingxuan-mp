import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image } from '@tarojs/components';
import { formatPrice } from '@/utils/util';
import styles from './index.module.less';

type States = {
  selected: string;
};
type Props = {
  productList: any[];
  close: (modal, select) => void;
  changeProduct: (productId: string) => void;
  goConfirmOrder: () => void;
};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  state = {
    selected: '',
  };
  async componentDidMount() {
    this.setState({ selected: this.props.productList[0].productId });
    this.props.changeProduct(this.props.productList[0].productId);
  }

  render() {
    const { selected } = this.state;
    const { productList } = this.props;

    return (
      <View className={styles.index}>
        <View className={styles.content}>
          <View className={styles.title}>
            选择服务产品
            <Image
              onClick={() => {
                this.props.close(false, false);
              }}
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/chat/closeWindow@x2.png"
            />
          </View>
          <View className={styles.list}>
            {productList.map((item, index) => {
              return (
                <View
                  key={index}
                  className={styles.item}
                  onClick={() => {
                    this.setState({ selected: item.productId });
                    this.props.changeProduct(item.productId);
                  }}
                >
                  <View className={styles.left}>
                    <Image
                      className={styles.img}
                      src={
                        selected !== item.productId
                          ? 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_unchecked_icon.png'
                          : 'http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/common/radio_checked_icon.png'
                      }
                    />

                    {item.outName}
                  </View>

                  <View className={styles.right}>{formatPrice(item.price)}</View>
                </View>
              );
            })}
          </View>
          <View className={styles.btn}>
            <View
              className={styles.confirm}
              onClick={() => {
                this.props.close(false, false);
                this.props.goConfirmOrder();
              }}
            >
              确认
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default Index;
