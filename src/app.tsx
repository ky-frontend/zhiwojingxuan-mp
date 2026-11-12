import { Component, PropsWithChildren } from 'react';
import { Provider } from 'mobx-react';
import Taro from '@tarojs/taro';

import './app.less';
import { store } from './store';
import { KYLoading } from './components/KYLoading';
import { platformApi } from './services';

class App extends Component<PropsWithChildren<any>> {
  async componentDidMount() {
    // utm 统计
    const params = Taro.getCurrentInstance().router?.params;
    // 检验params中的可以是否含有utm_
    if (params) {
      const utmParams = Object.keys(params).filter((key) => key.includes('utm_'));
      if (utmParams.length > 0 && (params.utm_source || params.utm_medium || params.utm_campaign)) {
        //
        KYLoading.show();
        const res = await platformApi.createAccessLog({
          utmCampaign: params.utm_campaign || '',
          utmMedium: params.utm_medium || '',
          utmSource: params.utm_source || '',
        });
        KYLoading.hide();
        if (res.code !== 0) {
          Taro.showToast({
            title: res.message || '创建访问日志失败',
            icon: 'none',
          });
        }
      }
    }
  }

  componentDidShow() {
    store.globalDataStore.bumpAppShowTick();
  }

  componentDidHide() {
    console.log('app componentDidHide');
  }

  // this.props.children 就是要渲染的页面
  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}

export default App;
