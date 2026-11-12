import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { isNumber } from '@/utils/math.util';
import { navigateTo } from '@/utils/navigate';
import { isToday } from '@/modules/utils/formatting.util';
import { platformApi } from '@/services';
import { PlatformResourceSpotContentType } from '@ky-middleground/platform-type';
import { Image, Swiper, SwiperItem, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { TOKEN_KEY } from '@/constants/values';
import styles from './index.module.less';
import { KYLoading } from '../KYLoading';

type Props = {
  // data: PlatformResourceSpotContentType[];
  // style: any;
  id: string;
  showWay?: 'swiper' | 'pop';
  innerBoxStyle?: any;
  /** 按原图比例撑开，避免固定高度拉伸发糊 */
  autoHeight?: boolean;
};
type States = {
  swiperDate: PlatformResourceSpotContentType[];
  adVisitable: boolean;
  bannerHeight: number;
};

const getBannerContentWidth = () => {
  const { windowWidth } = Taro.getSystemInfoSync();
  // .swiperBox 左右 margin 各 16px，设计稿 750 下会转成 16rpx
  return windowWidth - (windowWidth * 32) / 750;
};
@inject('store')
@observer
class KYResourceSlot extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      swiperDate: [],
      adVisitable: false,
      bannerHeight: 0,
    };
  }

  handleBannerLoad = (
    e: { detail: { width?: number | string; height?: number | string } },
    index: number,
  ) => {
    if (!this.props.autoHeight || index !== 0) return;
    const width = Number(e.detail.width);
    const height = Number(e.detail.height);
    if (!width || !height) return;
    const bannerHeight = Math.ceil((getBannerContentWidth() / width) * height);
    if (bannerHeight !== this.state.bannerHeight) {
      this.setState({ bannerHeight });
    }
  };

  parseWeixinUrl(url: string) {
    try {
      const appidMatch = url.match(/[?&]appid=([^&]+)/);
      const pathMatch = url.match(/[?&]path=([^&]+)/);
      if (!appidMatch) return null;
      return {
        appId: decodeURIComponent(appidMatch[1]),
        path: pathMatch ? decodeURIComponent(pathMatch[1]) : '',
      };
    } catch (error) {
      console.error('解析微信链接失败', error);
      return null;
    }
  }

  /** 对齐首页 banner 跳转逻辑 */
  handleHomeBannerJump = (url: string) => {
    const token: string = Taro.getStorageSync(TOKEN_KEY) || '';
    if (!token) {
      navigateTo('/pages/login/index');
      return;
    }
    if (url.startsWith('weixin://')) {
      const { appId, path } = this.parseWeixinUrl(url) || {};
      if (appId) {
        Taro.navigateToMiniProgram({
          appId,
          path: path || '',
        });
      }
      return;
    }
    if (url.startsWith('http')) {
      navigateTo('/subCounselling/pages/storageCard/index');
      return;
    }
    navigateTo(url);
  };

  handleResourceJump = (url: string) => {
    if (!url) return;
    // LiaoyuIndexBanners2 与首页 ZhiWoHomeTopBanner 跳转保持一致
    if (this.props.id === 'LiaoyuIndexBanners2') {
      this.handleHomeBannerJump(url);
      return;
    }
    if (url.includes('#小程序://')) {
      Taro.navigateToMiniProgram({
        shortLink: url,
      });
      return;
    }
    if (url.startsWith('http')) {
      navigateTo(`/pages/webview/index?url=${encodeURIComponent(url)}`);
      return;
    }
    navigateTo(url);
  };

  async componentDidMount() {
    const { id } = this.props;
    if (id === 'PsyIndexPopupAd') {
      const timeStampResourceSLot = Taro.getStorageSync('timeStampResourceSLot');
      if (isNumber(timeStampResourceSLot) && isToday(timeStampResourceSLot)) {
        return;
      }
    }
    KYLoading.show();
    const res = await platformApi.getResourceSpotContent(id);
    KYLoading.hide();
    if (res.code === 0 && res.data.length > 0) {
      if (id === 'PsyIndexPopupAd') {
        Taro.setStorageSync('timeStampResourceSLot', Date.now());
        this.setState({ adVisitable: true });
      }
      this.setState({
        swiperDate: (res.data[0] as any)?.content,
      });
    }
  }

  swiperComponent = () => {
    const { innerBoxStyle, autoHeight } = this.props;

    const { swiperDate, bannerHeight } = this.state;
    const swiperStyle = autoHeight
      ? { width: '100%', height: bannerHeight ? `${bannerHeight}px` : '0px' }
      : innerBoxStyle;

    return (
      <Swiper style={swiperStyle} className={styles.SwiperBoxes} autoplay>
        {swiperDate.map((item: any, index) => {
          return (
            <SwiperItem key={index}>
              <Image
                className={autoHeight ? styles.bannerImg : styles.img}
                src={item.picUrl}
                mode={autoHeight ? 'widthFix' : undefined}
                style={autoHeight ? { width: '100%' } : innerBoxStyle}
                onLoad={autoHeight ? (e) => this.handleBannerLoad(e, index) : undefined}
                onClick={() => this.handleResourceJump(item.redirectForMp)}
              />
            </SwiperItem>
          );
        })}
      </Swiper>
    );
  };

  render() {
    const { showWay = 'swiper', autoHeight } = this.props;
    const { swiperDate, adVisitable, bannerHeight } = this.state;

    if (swiperDate.length === 0) {
      return null;
    }

    return showWay === 'swiper' ? (
      <View
        className={`${styles.swiperBox} ${autoHeight ? styles.swiperBoxAuto : ''}`}
        style={autoHeight && bannerHeight ? { height: `${bannerHeight}px` } : undefined}
      >
        {this.swiperComponent()}
      </View>
    ) : adVisitable ? (
      <View className={styles.adBoxes}>
        <View className={styles.ad}>
          {this.swiperComponent()}
          <View
            className={styles.btn}
            onClick={() => {
              this.setState({ adVisitable: false });
            }}
          >
            <Image
              src="https://cdn-public.knowyourself.cc/icon/common/20240712_close.png"
              className={styles.img}
            />
          </View>
        </View>
      </View>
    ) : null;
  }
}

export default KYResourceSlot;
