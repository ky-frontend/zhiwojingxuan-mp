import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { KYLoading } from '@/components/KYLoading';
import { platformApi } from '@/services';
import KYPage from '@/components/KYPage';
import { navigateTo } from '@/utils/navigate';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Text } from '@tarojs/components';
import { ImgUrlFormat } from '@/modules/utils/format';
import KYNumber from '@/components/KYNumber';
import { PlatformResourceSpotContentType } from '@ky-middleground/platform-type';
import { rpx2px, throttle } from '@/modules/utils/tools';
import KYTabBar from '@/components/KYTabBar';
import KYResourceSlot from '@/components/KYResourceSlot';
import { FixTxt, CounselorIdentityEnum } from '@/types/common.type';
import { formatPrice, sliceStr } from '@/utils/util';
import { isFunction } from '@tarojs/shared';
import { KYTrack } from '@/modules/track';
import { T_CounselingHomePageView, T_CounselorClick } from '@/modules/track/events';
import classNames from 'classnames';
import styles from './index.module.less';
import Shaixuan from './components/Shaixuan';
import ConsoltantState from './components/Header';

type PageStateProps = {};

interface Index {
  props: PageStateProps;
}

type IStates = {
  tabFixedTop: number;
  tabFixed: boolean;
  navTop: number;
  navBackColor: number;
  swiperDate: PlatformResourceSpotContentType[];
};

@inject('store')
@observer
class Index extends BaseKyComponent<{}, IStates> {
  state = {
    tabFixedTop: 0,
    tabFixed: false,
    navTop: 0,
    navBackColor: 1,
    swiperDate: [],
  };
  tabFixedRender = false;
  get ciStore() {
    return this.store.consultantIndexStore;
  }
  async onLoad() {
    // init params
    if (this.ciStore.consultantList.length === 0) {
      this.ciStore.initConsultantParams();
      await this.ciStore.getConsultantList();
    } else {
      // 对比时间戳, 超过10分钟刷新
      const currentTimestamp = Date.now();
      if (currentTimestamp - this.ciStore.lastTimestamp > 10 * 60 * 1000) {
        Taro.startPullDownRefresh();
      }
    }
    // 监听页面的滑动事件
    this.kypagescrollFunc = throttle(this.onPageScrollThrottle.bind(this), 0, true);

    // 获取实习生咨询师的资源位
    // this.getInternConsultant();
    setTimeout(() => {
      Taro.createSelectorQuery()
        .select('#shaixuanFixed')
        .boundingClientRect((rect: any) => {
          const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
          this.setState({
            navTop: sbh + rpx2px(48),
            tabFixedTop: rect.top - sbh - rpx2px(48),
          });
        })
        .exec();
    }, 50);

    //知我心理浏览咨询首页
    KYTrack(T_CounselingHomePageView());
  }
  kypagescrollFunc: any;

  onPageScroll(e) {
    if (isFunction(this.kypagescrollFunc)) {
      this.kypagescrollFunc(e);
    }
  }

  // 实习生资源数据
  getInternConsultant = async () => {
    KYLoading.show();
    const res = await platformApi.getResourceSpotContent('InternConsultant');
    KYLoading.hide();
    if (res.code === 0 && res.data.length > 0) {
      this.setState({ swiperDate: (res.data[0] as any)?.content });
    }
  };
  async onPullDownRefresh() {
    Taro.stopPullDownRefresh();
    // reset
    this.ciStore.resetConsultantList();
    this.ciStore.initConsultantParams();
    await this.ciStore.getConsultantList();
    await this.ciStore.getTipBar();
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
  onShareAppMessage() {
    return {
      title: FixTxt.indexPageText,
      path: '/pages/index/index',
      imageUrl: 'https://cdn-public.knowyourself.cc/icon/wechat/shareImg.jpg',
    };
  }

  onReachBottom() {
    this.ciStore.getConsultantList();
  }

  handleSearch() {
    // Taro.navigateTo({ url: '/subCommon/pages/search/index' });
    navigateTo('/subCommon/pages/search/index');
  }

  render() {
    const { tabFixed, navTop } = this.state;
    return (
      <KYPage className={styles.consoltantPage}>
        <KYNavigation
          showBack={false}
          className={styles.navBg}
          showTopLoading
          navigationRender={() => {
            return (
              <View className={styles.cnav} style={{ paddingTop: this.systemInfo.statusBarHeight }}>
                <Image
                  className={styles.bgimg}
                  style={{ opacity: this.state.navBackColor }}
                  // src="https://cdn-public.knowyourself.cc/icon/wechat/20240129_xlbg.png"
                  src="https://cdn-public.knowyourself.cc/icon/consultant/20240624_backgound.png"
                />
                <Image
                  className={styles.icon}
                  src="https://cdn-public.knowyourself.cc/icon/wechat/20240124_zwxllogo_lan.png"
                />
              </View>
            );
          }}
        />
        <Image
          className={styles.pagebgimg}
          src="https://cdn-public.knowyourself.cc/icon/consultant/20240624_backgound.png"
        />
        <View className={styles.tipsView}>
          <View className={styles.p}>心理咨询：甄选海内外优质咨询师</View>
          <Image
            src="https://cdn-public.knowyourself.cc/icon/wechat/20240129_ly_icon_search.png"
            className={styles.i1}
            onClick={this.handleSearch}
          />
          <Image
            onClick={() => {
              // Taro.navigateTo({ url: '/subConsultant/pages/serviceData/index' });
              navigateTo('/subConsultant/pages/serviceData/index');
            }}
            src="https://cdn-public.knowyourself.cc/icon/wechat/20240129_titlebar_icon_information_black.png"
            className={styles.i2}
          />
        </View>
        {/* 页面header：临时隐藏心理咨询 tipBar banner，保留代码 */}
        {false && <ConsoltantState />}

        <KYResourceSlot id="InternConsultant" innerBoxStyle={{ width: '100%', height: '100px' }} />

        {/* 筛选框 */}
        <Shaixuan
          tabFixed={tabFixed}
          navTop={navTop}
          tabFixedTop={this.state.tabFixedTop}
          clickShaixuan={() => {
            Taro.pageScrollTo({
              scrollTop: this.state.tabFixedTop,
              duration: 100,
            });
          }}
        />

        {/* 咨询师列表 */}
        {this.ciStore.consultantList.length === 0 ? (
          <View className={styles.empty}>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/common/empty_Illustration_message@3x.png"
              className={styles.img}
            />
            <Text className={styles.txt}>暂无符合条件的咨询师</Text>
          </View>
        ) : (
          <View className={styles.cl} id="consultant-list-id">
            {this.ciStore.consultantList.map((item, index) => {
              return (
                <View
                  className={styles.cc}
                  key={item.counselorId + '_' + index}
                  onClick={() => {
                    // 埋点: 知我心理咨询师卡片点击
                    KYTrack(
                      T_CounselorClick({
                        counselor_id: item.counselorId,
                        counselor_name: item.nickName,
                      }),
                    );
                    // Taro.navigateTo({
                    //   url: `/subCommon/pages/userInfo/index?sence=${item.counselorId}&identity=${CounselorIdentityEnum.Consultant}`,
                    // });
                    navigateTo(
                      `/subCommon/pages/userInfo/index?sence=${item.counselorId}&identity=${CounselorIdentityEnum.Consultant}`,
                    );
                  }}
                >
                  <View className={styles.ccl}>
                    <Image
                      // src={getAvatarUrl(item.avatar)}
                      src={ImgUrlFormat.imagesLimFunc(item.avatar)}
                      className={styles.icon}
                      mode="aspectFill"
                    />
                    {/* 优选图标 */}
                    <Image
                      src="https://cdn-public.knowyourself.cc/icon/consultant/youxuan.png"
                      className={classNames(styles.tag, {
                        [styles.show]: item.tags?.includes('youxuan'),
                      })}
                    />
                  </View>
                  <View className={styles.ccr}>
                    <View className={styles.nickView}>
                      <View className={styles.p1}>{item.nickName}</View>
                      <Image
                        src={this.store.platformStore.tagLabel.zixunshi.small.url}
                        className={styles.i}
                      />
                      <View className={styles.p2}>咨询时长: {item.consultationDuration}</View>{' '}
                      <View className={styles.p3}>
                        <KYNumber className={styles.p21} color="#F85D48">
                          ¥
                        </KYNumber>
                        <KYNumber className={styles.p22} color="#F85D48">
                          {Number(formatPrice(item.price))}
                        </KYNumber>
                        <Text className={styles.p23}>/次</Text>
                      </View>
                    </View>
                    <View className={styles.tag}>
                      <View className={styles.tagView}>
                        {item.certificationList && sliceStr(item.certificationList[0], 10)}
                      </View>
                      <View className={styles.p2}>{item.latestScheduleTimeStr}</View>
                    </View>
                    <View className={styles.desc}>{item.profileSummary}</View>

                    <View className={styles.priceView}>
                      <View className={styles.p1}>{item.consultationProcessV2}</View>
                      <View className={styles.p2}>
                        <Image
                          className={classNames(
                            { [styles.ac]: item.address?.length > 0 },
                            styles.img,
                          )}
                          src="https://cdn-public.knowyourself.cc/icon/consultant/20240723_weizhi.png"
                        />
                        {sliceStr(item.address, 10)}
                      </View>
                      {/* <View className={styles.p2}>
                        <KYNumber className={styles.p21} color="#F85D48">
                          ¥
                        </KYNumber>
                        <KYNumber className={styles.p22} color="#F85D48">
                          {Number(formatPrice(item.price))}
                        </KYNumber>
                        <Text className={styles.p23}>/次</Text>
                      </View> */}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 首页弹窗 */}
        <KYResourceSlot
          id="PsyIndexPopupAd"
          showWay="pop"
          innerBoxStyle={{ width: '100%', height: '300px' }}
        />
        <KYTabBar index={-1} />
      </KYPage>
    );
  }
}

export default Index;
