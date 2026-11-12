import { observer, inject } from 'mobx-react';
import { ENV_CONFIG } from '@/constants/values';
import BaseKyComponent from '@/components/BaseKyComponent';
import Taro from '@tarojs/taro';
import { WebView } from '@tarojs/components';
import styles from './index.module.less';

type IWebViewState = {
  url: string;
};

@inject('store')
@observer
class Webview extends BaseKyComponent<{}, IWebViewState> {
  state: IWebViewState = {
    url: '',
  };
  onLoad(e) {
    if (e.qiyuShuntId) {
      console.log(e.qiyuShuntId);
      this.setState({
        url: `https://zhiwotansuo.qiyukf.com/client?k=b17b7837c7d1fbed61fe2e10d4394d17&wp=1&robotShuntSwitch=0&shuntId=${e.qiyuShuntId}&language=zh-cn&templateId=6650985`,
      });
      return;
    }
    if (e.url) {
      let url = decodeURIComponent(e.url);
      // 如果url是以http或者https开头的，就不做处理
      if (!(url.indexOf('http') === 0)) {
        const env = Taro.getStorageSync(ENV_CONFIG);
        const baseUrl =
          env === 'dev2' ? 'https://m-dev2.knowyourself.cc' : 'https://m.knowyourself.cc';
        // 开头有没有/，没有就加上
        if (url.indexOf('/') !== 0) {
          url = '/' + url;
        }
        url = baseUrl + url;
      }
      console.log('ur', url);
      this.setState({
        url,
      });
    }
  }

  handleLoad = (e) => {
    console.log('加载成功');
    console.log(e);

    // Taro.setNavigationBarTitle({
    //   title: '123',
    // });
  };

  render() {
    return this.state.url ? (
      <WebView
        src={this.state.url}
        onLoad={(e) => {
          this.handleLoad(e);
        }}
        className={styles.WebView}
      />
    ) : null;
  }
}

export default Webview;
