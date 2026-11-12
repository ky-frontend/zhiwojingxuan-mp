import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import classNames from 'classnames';
import { rpx2px } from '@/modules/utils/tools';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import CoachIntroduction from '@/subCommon/pages/userInfo/coach/PersonalIntroduction';
import { serviceTypeOptions } from '@/constants/values';
import styles from './index.module.less';

type States = {
  counselorId: string;
  swiperHeight: number;
  customLazyFlag: boolean;
  statusBarHeight: number;
};
type Props = {
  counselorId: string;
  top: boolean;
  scrollTop: number;
};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  state = {
    counselorId: '',
    swiperHeight: 0,
    customLazyFlag: true,
    statusBarHeight: 0,
  };

  async getCoachInfo() {
    const { counselorId } = this.props;
    if (counselorId && counselorId !== 'undefined') {
      this.setState({ counselorId });
      await this.ciStore.getCoachDetail(counselorId);

      const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
      this.setState({ statusBarHeight: sbh });
    } else {
      Taro.showToast({
        title: '没有心理教练Id',
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

  async componentDidMount() {
    await this.getCoachInfo();

    setTimeout(() => {
      this.setState({ customLazyFlag: false });
    }, 500);
  }

  componentDidUpdate() {
    if (this.swiperRef && this.state.swiperHeight === 0) {
      Taro.createSelectorQuery()
        .select('#swiper')
        .boundingClientRect((rect) => {
          rect && this.setState({ swiperHeight: (rect as any).height });
        })
        .exec();
    }
  }

  swiperRef;

  get ciStore() {
    return this.store.coachInfoStore;
  }

  render() {
    const { scrollTop } = this.props;
    const { customLazyFlag, swiperHeight } = this.state;
    const res = Taro.getSystemInfoSync();
    let hight = 0;
    if (res.statusBarHeight) {
      hight = res.statusBarHeight + 6;
    }

    return (
      <KYPage className={styles.index}>
        {/* 挡懒加载 */}
        {customLazyFlag && <View className={styles.customLazy}></View>}
        {this.ciStore.coachDetail && this.state.statusBarHeight >= 0 ? (
          <KYNavigation
            showBack
            navigationRender={() => {
              return (
                <View className={styles.navBg}>
                  <View
                    className={classNames({
                      [styles.back]: true,
                      [styles.showBackground]: scrollTop >= swiperHeight + 48,
                    })}
                    style={{ paddingTop: hight }}
                  >
                    <Image
                      className={styles.backIcon}
                      style={{ top: this.state.statusBarHeight + rpx2px(7) }}
                      src={
                        scrollTop >= swiperHeight + 48
                          ? 'https://cdn-public.knowyourself.cc/icon/user/20230314_titlebar_icon_goback.png'
                          : 'https://cdn-public.knowyourself.cc/icon/zxs/goback_page.png'
                      }
                      onClick={() => {
                        this.ciStore.coachDetail = null as any;
                        const l = Taro.getCurrentPages().length;
                        l > 1 ? Taro.navigateBack() : replaceTo('/pages/index/index');
                      }}
                    ></Image>
                    {scrollTop >= swiperHeight + 48 && (
                      <View className={styles.nameBox}>
                        <View>{this.ciStore.coachDetail.realName}</View>
                        <Image
                          mode="widthFix"
                          src="https://cdn-public.knowyourself.cc/icon/coach/20250509_coach.png"
                          className={styles.tagIcon}
                        ></Image>
                      </View>
                    )}
                  </View>
                  <Swiper
                    className={styles.photoBg}
                    style={{
                      top: -this.state.statusBarHeight || 0,
                    }}
                    snapToEdge
                    circular
                    autoplay
                    id="swiper"
                    ref={(ref) => (this.swiperRef = ref)}
                  >
                    {this.ciStore.coachDetail.photoList.map((val, i) => {
                      return (
                        <SwiperItem className={styles.photoSwiperItem} key={i}>
                          <Image className={styles.photo} src={val} mode="aspectFit" />
                          <View
                            className={styles.background}
                            style={{ backgroundImage: `url(${val})` }}
                          ></View>
                          <View
                            className={styles.dots}
                          >{`${i + 1}/${this.ciStore.coachDetail?.photoList?.length}`}</View>
                        </SwiperItem>
                      );
                    })}
                  </Swiper>
                </View>
              );
            }}
          />
        ) : (
          <KYNavigation showBack className={styles.navBg}></KYNavigation>
        )}

        {this.ciStore.coachDetail && swiperHeight >= 0 ? (
          <View
            className={styles.info}
            style={{ marginTop: swiperHeight - (res as any).statusBarHeight - 36 + 'px' }}
          >
            <View className={styles.userDesc}>
              <View className={styles.nameBox}>
                <View className={styles.name}>{this.ciStore.coachDetail.realName}</View>
                <Image
                  mode="heightFix"
                  src="https://cdn-public.knowyourself.cc/icon/coach/20250509_coach.png"
                  className={styles.tagIcon}
                ></Image>
              </View>
            </View>
            <View className={styles.userTag}>{this.ciStore.coachDetail.introduction}</View>
            <View className={styles.type}>
              <View className={styles.title}>服务类型:</View>

              <View className={styles.c}>
                {this.ciStore.coachDetail?.serviceType?.map((item, i) => (
                  <View className={styles.item} key={i}>
                    {serviceTypeOptions.find((val) => val.value === item)?.label}
                  </View>
                ))}
              </View>
            </View>
            <View className={styles.type}>
              <View className={styles.title}>服务周期:</View>
              <View className={styles.c}>
                {this.ciStore.coachDetail?.productInfos?.map((item, i) => (
                  <View className={styles.item} key={i}>
                    {item.outName}
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}
        {this.ciStore.coachDetail && swiperHeight >= 0 ? (
          <CoachIntroduction
            coachInfo={this.ciStore.coachDetail}
            sty={scrollTop >= swiperHeight ? { marginTop: 0 } : {}}
          />
        ) : null}
        {/* 温馨提示 */}
        {this.ciStore.coachDetail && swiperHeight >= 0 && (
          <View className={styles.zzsm}>
            <View className={styles.line}></View>
            <View className={styles.title}>郑重声明</View>
            <View className={styles.p}>
              1.心理教练本人承诺以上资料真实准确，接受公众监督并为此承担相应法律责任，如您发现虚假信息，请联系平台客服投诉；
            </View>
            <View className={styles.p}>
              2.切勿脱离平台私下交易，脱离平台预约发生的服务纠纷平台不承担相应责任；
            </View>
            <View className={styles.p}>
              3.购买时有任何疑问或购买后如想退款、转让等，请联系客服进行沟通。
            </View>
            <View className={styles.p}>4.咨询服务开启后不支持退款。</View>
          </View>
        )}

      </KYPage>
    );
  }
}

export default Index;
