import classnames from 'classnames';
import Taro from '@tarojs/taro';
import { replaceTo } from '@/utils/navigate';
import { View, Image } from '@tarojs/components';
import styles from './index.module.less';
import BaseKyComponent from '../BaseKyComponent';

type IKYNavigation = {
  title?: string;
  bgColor?: string;
  className?: string;
  titleClassName?: string;
  fixed?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  navigationRender?: () => React.ReactNode;
  showTopLoading?: boolean;
  backColor?: 'black' | 'white'; // 返回按钮颜色。默认黑色
};

class KYNavigation extends BaseKyComponent<IKYNavigation> {
  onBack = () => {
    const l = Taro.getCurrentPages().length;
    if (this.props.onBack) {
      l >= 1 ? this.props.onBack() : Taro.navigateBack();
      return;
    }
    l > 1 ? Taro.navigateBack() : replaceTo('/pages/index/index');
  };

  render() {
    const res = Taro.getSystemInfoSync();
    const {
      className,
      titleClassName,
      bgColor,
      fixed = true,
      showBack = true,
      title,
      backColor = 'black',
    } = this.props;
    const navStyle = { paddingTop: res.statusBarHeight + 'px' };
    if (bgColor) {
      navStyle['background'] = bgColor;
    }

    return (
      <View
        className={classnames(styles.KYNavigation, className)}
        style={{ paddingTop: res.statusBarHeight }}
      >
        {this.props.showTopLoading ? (
          <Image
            className={styles.loadingmimi}
            src="https://cdn-public.knowyourself.cc/icon/liaoyu/loading.gif"
          />
        ) : null}

        {this.props.navigationRender ? (
          this.props.navigationRender()
        ) : (
          <View
            className={classnames(styles.navContent, className, fixed ? styles.fixed : '')}
            style={navStyle}
          >
            {showBack ? (
              <Image
                src={
                  backColor == 'black'
                    ? 'https://cdn-public.knowyourself.cc/icon/user/20230314_titlebar_icon_goback.png'
                    : 'https://cdn-public.knowyourself.cc/icon/liaoyu/titlebar_icon_goback_white@3x.png'
                }
                className={styles.back}
                onClick={this.onBack}
              />
            ) : null}
            {title ? (
              <View className={classnames(styles.title, titleClassName)}>{title}</View>
            ) : null}
          </View>
        )}
      </View>
    );
  }
}

export default KYNavigation;
