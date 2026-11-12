import Taro from '@tarojs/taro';
import { WebView } from '@tarojs/components';

const WebviewPage = () => {
  const router = Taro.getCurrentInstance().router;
  const { url = '' } = router?.params || {};

  // 解码原始URL
  const decodedUrl = decodeURIComponent(url);

  return <WebView src={decodedUrl} />;
};

export default WebviewPage;
