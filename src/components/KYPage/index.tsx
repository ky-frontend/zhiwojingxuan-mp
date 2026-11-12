import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import { navigateTo } from '@/utils/navigate';
import Taro from '@tarojs/taro';
import { ENV_CONFIG } from '../../constants/values';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';

type Props = {
  className?: string;
  children: React.ReactNode;
};
type States = {
  env: string;
  /** develop | trial | release */
  version: string;
};

@inject('store')
@observer
class KYPage extends BaseKyComponent<Props, States> {
  state: Readonly<States> = {
    env: '',
    version: 'release',
  };
  componentDidMount() {
    const env = Taro.getStorageSync(ENV_CONFIG);
    this.setState({
      env: env == 'dev2' ? 'dev2' : 'prod',
      version: Taro.getAccountInfoSync().miniProgram.envVersion,
    });
  }
  render() {
    const { children, className } = this.props;
    const res = Taro.getSystemInfoSync();
    const { kyLoading } = this.store.globalDataStore;
    // 体验版、本地开发版展示环境切换；正式版不展示
    const showEnvSwitch = this.state.version === 'trial' || this.state.version === 'develop';

    return (
      <View
        id="wrap-page"
        style={{
          minHeight: `calc(${res.windowHeight}px`,
        }}
        className={className}
      >
        {children}
        {/* loading */}
        {kyLoading ? (
          <View className={styles.KYLoading}>
            <Image
              className={styles.icon}
              src="https://cdn-public.knowyourself.cc/icon/liaoyu/loading.gif"
            />
          </View>
        ) : null}
        {showEnvSwitch ? (
          <View
            className={styles.envview}
            onClick={() => {
              const pages = Taro.getCurrentPages();
              const currentPage = pages[pages.length - 1];
              if (currentPage.route == 'subCommon/pages/setting/index') {
                return;
              }
              navigateTo('/subCommon/pages/setting/index');
            }}
          >
            {this.state.env || 'prod'}
          </View>
        ) : null}
      </View>
    );
  }
}

export default KYPage;
