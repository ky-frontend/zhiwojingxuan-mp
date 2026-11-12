import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import Taro from '@tarojs/taro';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { View, Text } from '@tarojs/components';
import { ENV_CONFIG } from '../../../constants/values';
import styles from './index.module.less';

type States = {
  env: string;
  /** 体验版或本地开发版可切换环境 */
  canSwitchEnv: boolean;
};

@inject('store')
@observer
class Setting extends BaseKyComponent<{}, States> {
  state: States = {
    env: '',
    canSwitchEnv: false,
  };

  async componentDidMount() {
    const env = Taro.getStorageSync(ENV_CONFIG);
    const version = Taro.getAccountInfoSync().miniProgram.envVersion;
    this.setState({
      env: env === 'dev2' ? 'dev2' : 'prod',
      // 体验版 + 本地开发版可切换；正式版不可
      canSwitchEnv: version === 'trial' || version === 'develop',
    });
  }

  /** 体验版/开发版可在 prod / dev2 间切换 */
  handleSwitchEnv = () => {
    if (!this.state.canSwitchEnv) return;
    const { env } = this.state;
    const nextEnv = env === 'dev2' ? 'prod' : 'dev2';
    const nextLabel = nextEnv === 'dev2' ? '测试环境(dev2)' : '正式环境(prod)';

    Taro.showModal({
      title: `确认切换到${nextLabel}？`,
      content: '切换后将清除本地缓存并重新进入首页',
      success: (res) => {
        if (!res.confirm) return;
        Taro.clearStorageSync();
        Taro.setStorageSync(ENV_CONFIG, nextEnv);
        this.setState({ env: nextEnv });
        Taro.showToast({ title: `环境已切换-${nextEnv}`, icon: 'none' });
        // 开发工具里 exitMiniProgram 往往不会真正杀进程，改用 reLaunch 保证立刻按新环境请求
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/index/index' });
        }, 400);
      },
    });
  };

  render() {
    const { env, canSwitchEnv } = this.state;
    const switchLabel = env === 'dev2' ? '切换到正式环境' : '切换到测试环境';

    return (
      <KYPage className={styles.Setting}>
        <KYNavigation title="设置" />

        {/* 正式版无入口；体验版/本地开发版可双向切换 */}
        {canSwitchEnv ? (
          <>
            <View className={styles.envCard}>
              <View className={styles.envLabel}>当前环境</View>
              <View className={styles.envValue}>{env || '-'}</View>
            </View>

            <View className={styles.changeENV} onClick={this.handleSwitchEnv}>
              <Text className={styles.changeENVText}>{switchLabel}</Text>
            </View>
          </>
        ) : null}
      </KYPage>
    );
  }
}

export default Setting;
