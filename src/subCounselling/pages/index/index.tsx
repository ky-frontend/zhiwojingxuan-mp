import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import Taro from '@tarojs/taro';
import KYTabBar from '@/components/KYTabBar';
import { FixTxt } from '@/types/common.type';
import { throttle } from '@/modules/utils/tools';
import styles from './index.module.less';
import Coach from './Coach';

type IStates = {
  navBackColor: number;
  tabFixedTop: number;
  tabFixed: boolean;
  loading: boolean;
};

@inject('store')
@observer
class Index extends BaseKyComponent<{}, IStates> {
  state = {
    tabFixedTop: 0,
    tabFixed: false,
    navBackColor: 1,
    loading: false,
  };
  get coachStore() {
    return this.store.coachInfoStore;
  }
  $instance = Taro.getCurrentInstance();
  tabFixedRender = false;
  kypagescrollFunc: any;

  async onLoad() {
    this.setState({ loading: true });
    await this.getList();
    this.kypagescrollFunc = throttle(this.onPageScrollThrottle.bind(this), 0, true);
  }

  async getList() {
    this.coachStore.initCoachParams();
    this.coachStore.coachListHasMore = 'more';
    await Promise.all([this.coachStore.getTroubleTagList(), this.coachStore.getCoachList()]);
  }

  getTabFixedTop = (top: number) => {
    this.setState({ tabFixedTop: top, loading: false }, () => {
      console.log('tabFixedTop', top);
    });
  };

  onPageScroll(e) {
    this.kypagescrollFunc && this.kypagescrollFunc(e);
  }
  onPullDownRefresh() {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 2000);
  }
  onPageScrollThrottle(e) {
    if (e.scrollTop < this.state.tabFixedTop) {
      this.setState({
        navBackColor:
          e.scrollTop > 0 ? (this.state.tabFixedTop - e.scrollTop) / this.state.tabFixedTop : 1,
      });
    } else {
      this.setState({
        navBackColor: 0,
      });
    }
    if (e.scrollTop >= this.state.tabFixedTop && !this.tabFixedRender) {
      this.tabFixedRender = true;
      this.setState({
        tabFixed: true,
      });
    }
    if (e.scrollTop < this.state.tabFixedTop && this.tabFixedRender) {
      this.tabFixedRender = false;
      this.setState({
        tabFixed: false,
      });
    }
  }

  onReachBottom() {
    if (this.coachStore.coachListHasMore === 'no') return;
    this.coachStore.coachListHasMore = 'more';
    this.coachStore.getCoachList();
  };

  onShareAppMessage() {
    return {
      title: FixTxt.indexPageText,
      path: '/pages/index/index',
      imageUrl: 'https://cdn-public.knowyourself.cc/icon/wechat/shareImg.jpg',
    };
  }
  render() {
    const { tabFixed } = this.state;

    return (
      <KYPage className={styles.Index}>
        <KYNavigation
          bgColor="linear-gradient(180deg, #DADEFF 0%, #F4F5FC 100%);"
          showBack={false}
          title="知我心理"
          showTopLoading
          navigationRender={() => {
            return (
              <View className={styles.cnav} style={{ paddingTop: this.systemInfo.statusBarHeight }}>
                <Image
                  className={styles.bgimg}
                  style={{ opacity: this.state.navBackColor }}
                  src="https://cdn-public.knowyourself.cc/icon/wechat/20240124_lybj.png"
                />
              </View>
            );
          }}
        />
        <Image
          className={styles.pagebgimg}
          src="https://cdn-public.knowyourself.cc/icon/wechat/20240124_lybj.png"
        />
        <KYTabBar index={0} />
        <Coach tabFixed={tabFixed} sendTabFixedTop={this.getTabFixedTop} />
      </KYPage>
    );
  }
}

export default Index;
