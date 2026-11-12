import BaseKyComponent from '@/components/BaseKyComponent';
import { marketingApi } from '@/services';
import { KYLoading } from '@/components/KYLoading';
import { navigateTo } from '@/utils/navigate';
import Taro from '@tarojs/taro';
import KYModal from '@/components/KYModal';
import { Input, View } from '@tarojs/components';
import KYNavigation from '@/components/KYNavigation';
import KYPage from '@/components/KYPage';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';

type Props = {};
type States = {
  code: string;
  isShow: boolean;
  title: string;
  content: string;
  actions: any[];
};

@inject('store')
@observer
class ReceviceCoupon extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      code: '',
      isShow: false,
      title: '',
      content: '',
      actions: [],
    };
  }

  async componentDidMount() {
    console.log(this.props);
  }

  //点击兑换
  async onExchange() {
    if (this.state.code) {
      KYLoading.show();
      const res = await marketingApi.exchangeCode(this.state.code);
      KYLoading.hide();
      if (res.code === 0) {
        this.setState({
          isShow: true,
          title: '兑换成功',
          content: '恭喜您成功使用兑换码，已将您获得的优惠券放入“我的优惠券”中',
          actions: ['我知道了', '去看看'],
        });
      } else {
        Taro.showToast({
          title: res.message,
          icon: 'none',
          duration: 2000,
        });
      }
    }
  }

  dialogEvent = (index: number) => {
    this.setState(
      {
        isShow: false,
        title: '',
        content: '',
        actions: [],
      },
      () => {
        if (index == 1) {
          // Taro.redirectTo({ url: '/subCommon/pages/coupon/index' });
          navigateTo('/subCommon/pages/coupon/index');
        }
      },
    );
  };

  render() {
    const { isShow } = this.state;
    return (
      <KYPage className={styles.ReceviceCoupon}>
        <KYNavigation showBack title="兑换优惠券" />
        {/* 输入框 */}
        <View className={styles.shurukuang}>
          <Input
            className={styles.input}
            placeholder="请输入兑换码"
            value={this.state.code}
            maxlength={-1}
            onInput={(event) => {
              this.setState({ code: event.detail.value });
            }}
          />
        </View>
        <View
          className={styles.lingqubtn}
          style={!this.state.code ? { opacity: 0.5 } : {}}
          onClick={() => this.onExchange()}
        >
          立即兑换
        </View>
        <View className={styles.tips}>*输入有效兑换码可获得惊喜优惠券</View>

        <KYModal
          visiable={isShow}
          actions={['我知道了', '去看看']}
          title={this.state.title || ''}
          content={this.state.content || ''}
          event={this.dialogEvent}
        ></KYModal>
      </KYPage>
    );
  }
}

export default ReceviceCoupon;
