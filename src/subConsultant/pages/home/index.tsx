import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Swiper, SwiperItem, Text } from '@tarojs/components';

// import { rpx2px, throttle } from '@/modules/utils/tools';

import styles from './index.module.less';
import CounselorPersonalIntroduction from './components/PersonalIntroduction';
import { px2rpx, rpx2px } from '@/modules/utils/tools';

type PageStateProps = {};

interface Index {
  props: PageStateProps;
}

type IStates = {
  counselorId: string;
  // 1 个人介绍 2 可约时间
  currentTabIndex: number;
  statusBarHeight: number;
};

@inject('store')
@observer
class Index extends BaseKyComponent<{}, IStates> {
  state = {
    counselorId: '',
    currentTabIndex: 1,
    statusBarHeight: 0,
  };
  get ciStore() {
    return this.store.consultantIndexStore;
  }
  async onLoad(res) {
    if (res && res.counselorId) {
      this.setState({ counselorId: res.counselorId, currentTabIndex: 1 });
      await this.ciStore.getConsultantInfo(res.counselorId);

      const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
      console.log('statusBarHeight', sbh)
      this.setState({
        statusBarHeight: sbh,
      });
    } else {
      Taro.showToast({
        title: '没有咨询师Id',
        icon: 'none',
        duration: 1000,
        success: () => {
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        },
      });
    }
  }

  // onPageScroll(e) {
  // }

  // onShareAppMessage() {
  //   return {
  //     title: '聊愈',
  //     path: '/pages/index/index',
  //     imageUrl: 'https://cdn-public.knowyourself.cc/icon/consultant/consultant_icon.png',
  //   };
  // }

  render() {
    return (
      <KYPage className={styles.consultantHomePage}>
        {this.ciStore.consultantInfo ? (
          <KYNavigation
            showBack={true}
            className={styles.navBg}
            navigationRender={() => {
              if (this.ciStore.consultantInfo) {
                return (
                  <View>
                    <Image
                      className={styles.backIcon}
                      style={{top: this.state.statusBarHeight + rpx2px(7)}}
                      src="https://cdn-public.knowyourself.cc/icon/zxs/goback_page.png"
                      onClick={() => {
                        this.ciStore.consultantInfo = null as any;
                        Taro.navigateBack();
                      }}
                    ></Image>
                    <Swiper
                      className={styles.photoBg}
                      style={{ top: -this.state.statusBarHeight }}
                      indicatorDots={true}
                      snapToEdge={true}
                      circular
                      autoplay
                    >
                      {this.ciStore.consultantInfo.photoList.map((val) => {
                        return (
                          <SwiperItem className={styles.photoSwiperItem}>
                            <Image className={styles.photo} src={val} />
                          </SwiperItem>
                        );
                      })}
                    </Swiper>
                  </View>
                );
              } else {
                return null;
              }
            }}
          />
        ) : (
          <KYNavigation showBack={true} className={styles.navBg}></KYNavigation>
        )}
        {this.ciStore.consultantInfo ? (
          <View className={styles.userInfo}>
            <View className={styles.userDesc}>
              <View className={styles.nameBox}>
                <View>{this.ciStore.consultantInfo.realName}</View>
                <Image
                  src="https://cdn-public.knowyourself.cc/icon/zxs/zixunshi_logo_icon.png"
                  className={styles.tagIcon}
                ></Image>
              </View>
              <View className={styles.priceDesc}>
                <Text className={styles.symbol}>¥</Text>
                <Text className={styles.price}>600</Text>
                <Text className={styles.desc}>/次</Text>
              </View>
            </View>
            <View className={styles.descBox}>
              <View className={styles.tagDesc}>国家二级心理咨询师</View>
              <View className={styles.desc}>线上音视频</View>
            </View>
          </View>
        ) : null}
        {/* https://cdn-public.knowyourself.cc/icon/zxs/lesson.png */}
        {/* https://cdn-public.knowyourself.cc/icon/zxs/time.png */}
        {this.ciStore.consultantInfo ? (
          <View className={styles.descBox}>
            <View className={styles.timeBox}>
              <View className={styles.desc}>
                <Image
                  className={styles.tag}
                  src="https://cdn-public.knowyourself.cc/icon/zxs/lesson.png"
                ></Image>
                <Text className={styles.text}>咨询时长</Text>
              </View>
              <View className={styles.valueDesc}>
                <Text className={styles.value}>
                  {this.ciStore.consultantInfo.consultationDuration}
                </Text>
                <Text className={styles.suffix}>小时</Text>
              </View>
            </View>
            {this.ciStore.consultantInfo.longTermTrainingList &&
            this.ciStore.consultantInfo.longTermTrainingList.length ? (
              <View className={styles.long}>
                <View className={styles.desc}>
                  <Image
                    className={styles.tag}
                    src="https://cdn-public.knowyourself.cc/icon/zxs/lesson.png"
                  ></Image>
                  <Text className={styles.text}>长程培训</Text>
                </View>
                <View className={styles.valueDesc}>
                  <Text className={styles.value}>
                    {this.ciStore.consultantInfo.longTermTrainingList.length}
                  </Text>
                  <Text className={styles.suffix}>次</Text>
                </View>
              </View>
            ) : null}
            {this.ciStore.consultantInfo.shortTermTraininglist &&
            this.ciStore.consultantInfo.shortTermTraininglist.length > 0 ? (
              <View className={styles.short}>
                <View className={styles.desc}>
                  <Image
                    className={styles.tag}
                    src="https://cdn-public.knowyourself.cc/icon/zxs/lesson.png"
                  ></Image>
                  <Text className={styles.text}>短程培训</Text>
                </View>
                <View className={styles.valueDesc}>
                  <Text className={styles.value}>
                    {this.ciStore.consultantInfo.shortTermTraininglist.length}
                  </Text>
                  <Text className={styles.suffix}>次</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {this.ciStore.consultantInfo ? (
          <View className={styles.tab}>
            <Text
              className={`${styles.text} ${
                this.state.currentTabIndex === 1 ? styles.textActive : ''
              }`}
              onClick={() => {
                this.setState({ currentTabIndex: 1 });
              }}
            >
              个人介绍
            </Text>
            <Text
              className={`${styles.text} ${
                this.state.currentTabIndex === 2 ? styles.textActive : ''
              } ${styles.timeText}`}
              onClick={() => {
                this.setState({ currentTabIndex: 2 });
              }}
            >
              可约时间
            </Text>
            <Text className={styles.timeTip}>（北京时间）</Text>
          </View>
        ) : null}

        {this.ciStore.consultantInfo && this.state.currentTabIndex === 1 ? (
          <CounselorPersonalIntroduction></CounselorPersonalIntroduction>
        ) : null}
      </KYPage>
    );
  }
}

export default Index;
