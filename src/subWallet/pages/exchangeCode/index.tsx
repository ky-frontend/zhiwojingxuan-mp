import BaseKyComponent from '@/components/BaseKyComponent';
import { channelApi } from '@/services';
import Taro from '@tarojs/taro';
import { KYLoading } from '@/components/KYLoading';
import { replaceTo } from '@/utils/navigate';
import { Input, View } from '@tarojs/components';
import KYNavigation from '@/components/KYNavigation';
import KYPage from '@/components/KYPage';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';

type Props = {};
type States = {
  code: string;
  title: string;
  content: string;
  actions: any[];
};

@inject('store')
@observer
class ExchangeCode extends BaseKyComponent<Props, States> {
  timeNo = 0;
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      code: '',
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
      const res = await channelApi.getRedeemLyCard(this.state.code.trim());
      KYLoading.hide();
      if (res.code === 0) {
        // 成功
        Taro.showToast({ icon: 'none', title: '兑换成功' });
        setTimeout(() => {
          // Taro.navigateTo({ url: '/subCounselling/pages/storageCard/index' });
          replaceTo('/subCounselling/pages/storageCard/index');
        }, 1000);
      } else {
        if (res.code === 100) {
          Taro.showToast({ icon: 'none', title: '兑换码不正确' });
        }
        if (res.code === 101) {
          Taro.showToast({ icon: 'none', title: '该兑换码已被使用' });
        }
      }
    }
  }

  render() {
    return (
      <KYPage className={styles.exchangeCode}>
        <KYNavigation showBack title="兑换优惠充时卡" />
        {/* 输入框 */}
        <View className={styles.inputValue}>
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
          className={styles.exchangeBtn}
          style={!this.state.code ? { opacity: 0.5 } : {}}
          onClick={() => this.onExchange()}
        >
          立即兑换
        </View>
        <View className={styles.tips}>*输入有效兑换码兑换，每个兑换码仅能成功兑换一次</View>
      </KYPage>
    );
  }
}

export default ExchangeCode;
