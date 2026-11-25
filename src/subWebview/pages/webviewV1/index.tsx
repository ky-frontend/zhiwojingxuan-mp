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
    const env = Taro.getStorageSync(ENV_CONFIG);
    const baseUrl =
      env === 'dev2' ? 'https://m-dev2.knowyourself.cc' : 'https://m.knowyourself.cc';

    // 七鱼：不直开第三方域（会受限）。本小程序专用静态页 iframe 嵌套七鱼
    // 页面文件：仓库 static/qiyu-iframe.html，需挂到业务域名（仅此静态文件，不改公共 H5/其他小程序）
    if (e.qiyuShuntId) {
      this.setState({
        url: `${baseUrl}/zwjingxuan/qiyu-iframe.html?shuntId=${e.qiyuShuntId}`,
      });
      return;
    }
    if (e.url) {
      let url = decodeURIComponent(e.url);
      // 如果url是以http或者https开头的，就不做处理
      if (!(url.indexOf('http') === 0)) {
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
