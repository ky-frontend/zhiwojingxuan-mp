import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { CounselorIdentityEnum, FixTxt } from '@/types/common.type';
import { throttle } from '@/modules/utils/tools';
import { isFunction } from '@tarojs/shared';
import { userApi } from '@/services';
import Consultant from '@/subCommon/pages/userInfo/consultant';
import Counselling from '@/subCommon/pages/userInfo/counselling';
import Coach from '@/subCommon/pages/userInfo/coach';
import styles from './index.module.less';

type PageStateProps = {};

interface Index {
  props: PageStateProps;
}

@inject('store')
@observer
class Index extends BaseKyComponent {
  $instance = Taro.getCurrentInstance();
  statusBarHeight = 0;
  state = {
    setTop: false,
    scrollTop: 0,
    setTitle: false,
    dataFromLiaoyu: -1,
    isReachBottom: false,
    identityTags: '',
  };

  kypagescrollFunc: any;

  async onLoad() {
    // 监听页面的滑动事件
    this.kypagescrollFunc = throttle(this.onPageScrollThrottle.bind(this), 50, true);
  }

  async componentDidMount() {
    const res = Taro.getSystemInfoSync();

    if (res.statusBarHeight) {
      this.statusBarHeight = res.statusBarHeight;
    }

    const { counselorId, identity } = this.$instance.router?.params as {
      counselorId: string;
      identity: string;
    };

    if (!identity) {
      // 如果没传就请求
      const res2 = await userApi.getUserAliasInfo(counselorId);
      if (res2.code === 0) {
        this.setState({
          identityTags: (res2.data.identityTags && res2.data!.identityTags[0]) || '',
        });
      }
    }
  }

  componentWillUnmount() {
    console.log('index componentWillUnmount');
  }

  componentDidShow() {
    console.log('index componentDidShow');
  }
  handleDataFromChild = (value) => {
    this.setState({ dataFromLiaoyu: value }); // 更新dataFromChild状态变量
  };

  onPageScroll = (e) => {
    if (isFunction(this.kypagescrollFunc)) {
      this.kypagescrollFunc(e);
    }
  };

  onPageScrollThrottle(e) {
    if (
      e.scrollTop < this.state.scrollTop &&
      this.state.isReachBottom &&
      this.state.scrollTop - e.scrollTop > 20
    ) {
      // 向上滚动
      this.setState({ isReachBottom: false });
      console.log('没触底++++++++++++');
    }

    this.setState({ scrollTop: e.scrollTop });

    if (e.scrollTop >= this.statusBarHeight) {
      this.setState({ setTop: true });
    } else {
      this.setState({ setTop: false });
    }
    if (this.state.dataFromLiaoyu != -1 && e.scrollTop >= this.state.dataFromLiaoyu) {
      this.setState({ setTitle: true });
    } else if (this.state.dataFromLiaoyu != -1 && e.scrollTop < this.state.dataFromLiaoyu) {
      this.setState({ setTitle: false });
    }
  }

  onReachBottom() {
    this.setState({ isReachBottom: true });
    console.log('触底里++++++++++++');
  }

  componentDidHide() {
    console.log('index componentDidHide');
  }

  onShareAppMessage() {
    const { sence, identity } = this.$instance.router?.params as {
      sence: string;
      identity: string;
    };
    const identityDeal = identity ? identity : this.state.identityTags;
    const counselorId = sence;
    return {
      title: FixTxt.shareText,
      path: `/subCommon/pages/userInfo/index?sence=${counselorId}&identity=${identityDeal}`,
    };
  }

  render() {
    const { sence, identity, userAliasId } = this.$instance.router?.params as {
      sence: string;
      identity: string;
      userAliasId: string;
    };
    const { setTop, scrollTop, isReachBottom } = this.state;
    const identityDeal = identity ? identity : this.state.identityTags;
    const counselorId = sence;

    return (
      // 先默认展示咨询师主页
      <View className={styles.userInfo}>
        {identityDeal === CounselorIdentityEnum.Consultant ? (
          <Consultant
            counselorId={counselorId}
            top={setTop}
            scrollTop={scrollTop}
            isReachBottom={isReachBottom}
          />
        ) : identityDeal === CounselorIdentityEnum.Counselling ? (
          <Counselling
            counsellingId={counselorId}
            userAliasId={userAliasId}
            top={setTop}
            title={this.state.setTitle}
            onChange={this.handleDataFromChild}
          />
        ) : (
          <Coach counselorId={counselorId} top={setTop} scrollTop={scrollTop} />
        )}
      </View>
    );
  }
}

export default Index;
