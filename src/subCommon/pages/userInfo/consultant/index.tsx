import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { ConsultantBaseEnum } from '@ky-client/consultant-type';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Swiper, SwiperItem, Text } from '@tarojs/components';
import { navigateTo, replaceTo } from '@/utils/navigate';
import KYNumber from '@/components/KYNumber';
import { rpx2px } from '@/modules/utils/tools';
import { formatPriceNoZero, sliceStr } from '@/utils/util';
import classNames from 'classnames';
import {
  T_CounselorDetailPageView,
  T_CounselorDetailPageButtonClick,
} from '@/modules/track/events';
import { KYTrack } from '@/modules/track';
import CounselorPersonalIntroduction from './components/PersonalIntroduction';
import styles from './index.module.less';

type PageStateProps = {
  counselorId: string;
  top: boolean;
  scrollTop: number;
  isReachBottom: boolean;
};

type IStates = {
  counselorId: string;
  // 1 个人介绍 2 可约时间
  currentTabIndex: number;
  statusBarHeight: number;
  // swiper height
  swiperHeight: number;
  customLazyFlag: boolean;
  topPosition: { height: string; top: string };
};

@inject('store')
@observer
class Consultant extends BaseKyComponent<PageStateProps, IStates> {
  state = {
    counselorId: '',
    currentTabIndex: 1,
    statusBarHeight: 0,
    swiperHeight: 0,
    customLazyFlag: true,
    topPosition: { height: '0px', top: '0px' },
  };

  swiperRef;

  get ciStore() {
    return this.store.consultantIndexStore;
  }

  async getConsultantInfo() {
    const { counselorId } = this.props;
    if (counselorId) {
      this.setState({ counselorId, currentTabIndex: 1 });
      await this.ciStore.getConsultantInfo(counselorId);

      const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
      this.setState({ statusBarHeight: sbh });
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

  async componentDidMount() {
    await this.getConsultantInfo();

    setTimeout(() => {
      this.setState({ customLazyFlag: false });
    }, 500);

    // 埋点: 知我心理浏览咨询师详情页
    const routePages = Taro.getCurrentPages();
    let referal_page = 1;
    if (routePages.length >= 2) {
      const page = routePages[routePages.length - 2];
      if (page.route?.includes('chat')) {
        referal_page = 2;
      }
    }
    KYTrack(
      T_CounselorDetailPageView({
        referal_page,
        counselor_id: this.props.counselorId,
        counselor_name: this.ciStore.consultantInfo.realName,
      }),
    );
  }

  componentDidUpdate(prevProps, prevState, nextProps) {
    if (this.swiperRef && this.state.swiperHeight === 0) {
      Taro.createSelectorQuery()
        .select('#swiper')
        .boundingClientRect((rect) => {
          rect && this.setState({ swiperHeight: (rect as any).height });
        })
        .exec();
    }
    if (
      prevState.swiperHeight !== this.state.swiperHeight &&
      this.state.topPosition.height === '0px'
    ) {
      if (this.ciStore.consultantInfo && this.ciStore.consultantInfo.address.length > 0) {
        Taro.createSelectorQuery()
          .select('#position')
          .boundingClientRect((position) => {
            if (position && (position as any).height) {
              if ((position as any).height > 20) {
                this.setState({
                  topPosition: {
                    height: (position as any).height + 9 + 'px',
                    top: this.state.swiperHeight - (position as any).height - 9 + 'px',
                  },
                });
              } else {
                this.setState({
                  topPosition: {
                    height: (position as any).height + 9 + 'px',
                    top: this.state.swiperHeight - (position as any).height - 9 + 'px',
                  },
                });
              }
            }
          })
          .exec();
      }
    }
    if (this.props.isReachBottom !== prevProps.isReachBottom) {
      if (this.props.isReachBottom) {
        this.setState({ currentTabIndex: 2 });
      } else {
        this.setState({ currentTabIndex: 1 });
      }
    }
  }

  // onShareAppMessage() {
  //   return {
  //     title: '聊愈',
  //     path: '/pages/index/index',
  //     imageUrl: 'https://cdn-public.knowyourself.cc/icon/consultant/consultant_icon.png',
  //   };
  // }

  /* 产品信息 */
  partnerProduct = () => {
    if (
      this.ciStore.consultantInfo?.partnerProduct &&
      this.ciStore.consultantInfo.partnerProduct.length > 0
    ) {
      return (
        <View
          className={classNames(styles.products, {
            [styles.display]: true,
          })}
        >
          <View className={styles.p1}>
            个体咨询
            <View className={styles.price}>
              ¥<KYNumber>{formatPriceNoZero(this.ciStore.consultantInfo.price)}</KYNumber>/次
            </View>
          </View>
          <View className={styles.p1}>
            伴侣咨询
            <View className={styles.price}>
              ¥
              <KYNumber>
                {formatPriceNoZero(this.ciStore.consultantInfo?.partnerProduct[0]?.price || 0)}
              </KYNumber>
              /次
            </View>
          </View>
        </View>
      );
    }
  };

  handleConsultationDuration = (hour: number) => {
    /** 如果是实习咨询师 不展示咨询时长 */
    if (this.ciStore.consultantInfo.level === ConsultantBaseEnum.LevelEnum.internship) return '--';
    if (hour < 0 || hour < 100) return '100';
    return `${hour}+`;
  };

  render() {
    const { scrollTop, counselorId } = this.props;
    const { swiperHeight, customLazyFlag } = this.state;

    const res = Taro.getSystemInfoSync();
    let hight = 0;
    if (res.statusBarHeight) {
      hight = res.statusBarHeight + 6;
    }

    // 判断有没有伴侣产品
    const hasPartnerProducts =
      this.ciStore.consultantInfo?.partnerProduct &&
      this.ciStore.consultantInfo.partnerProduct.length > 0;

    return (
      <KYPage className={styles.consultantHomePage}>
        {/* 挡懒加载 */}
        {customLazyFlag && <View className={styles.customLazy}></View>}
        {this.ciStore.consultantInfo && this.state.statusBarHeight >= 0 ? (
          <KYNavigation
            showBack
            className={styles.navBg}
            navigationRender={() => {
              if (this.ciStore.consultantInfo) {
                return (
                  <View>
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
                          this.ciStore.consultantInfo = null as any;
                          const l = Taro.getCurrentPages().length;
                          l > 1 ? Taro.navigateBack() : replaceTo('/pages/index/index');
                        }}
                      ></Image>
                      {scrollTop >= swiperHeight + 48 && (
                        <View className={styles.nameBox}>
                          <View>{this.ciStore.consultantInfo.realName}</View>
                          <Image
                            src="https://cdn-public.knowyourself.cc/icon/zxs/zixunshi_logo_icon.png"
                            className={styles.tagIcon}
                          ></Image>
                        </View>
                      )}
                    </View>
                    <Swiper
                      className={styles.photoBg}
                      style={{
                        top: -this.state.statusBarHeight,
                      }}
                      snapToEdge
                      circular
                      autoplay
                      id="swiper"
                      ref={(ref) => (this.swiperRef = ref)}
                    >
                      {this.ciStore.consultantInfo.photoList.map((val, i) => {
                        return (
                          <SwiperItem className={styles.photoSwiperItem} key={i}>
                            <Image className={styles.photo} src={val} mode="aspectFit" />
                            <View
                              className={styles.background}
                              style={{ backgroundImage: `url(${val})` }}
                            ></View>
                            <View
                              className={styles.dots}
                            >{`${i + 1}/${this.ciStore.consultantInfo.photoList.length}`}</View>
                          </SwiperItem>
                        );
                      })}
                    </Swiper>

                    <View
                      className={classNames(styles.position, {
                        [styles.display]: this.ciStore.consultantInfo.address,
                      })}
                      style={{ ...this.state.topPosition }}
                      // style={{
                      //   top: `calc(274px - ${this.state.topPosition}px)`,
                      //   height: this.state.topPosition + 'px',
                      // }}
                    >
                      <Image
                        className={styles.img}
                        src="https://cdn-public.knowyourself.cc/icon/consultant/20240724_weizhi_white.png"
                      />
                      <View id="position" className={styles.text}>
                        {this.ciStore.consultantInfo.address}
                      </View>
                    </View>
                  </View>
                );
              } else {
                return null;
              }
            }}
          />
        ) : (
          <KYNavigation showBack className={styles.navBg}></KYNavigation>
        )}
        {this.ciStore.consultantInfo && swiperHeight >= 0 ? (
          <View
            className={styles.userInfo}
            style={{ marginTop: swiperHeight - (res as any).statusBarHeight - 36 }}
          >
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
                <Text className={styles.price}>
                  {formatPriceNoZero(this.ciStore.consultantInfo.price)}
                </Text>
                <Text className={styles.desc}>/次</Text>
              </View>
            </View>
            <View className={styles.descBox_top}>
              <View className={styles.tagDesc}>
                {sliceStr(this.ciStore.consultantInfo.certificationList[0], 18)}
              </View>
              <View className={styles.desc}>
                {this.ciStore.consultantInfo.consultationProcessV2}
              </View>
            </View>
          </View>
        ) : null}
        {this.ciStore.consultantInfo && swiperHeight >= 0 ? (
          <View
            className={styles.descBox}
            style={{ margin: hasPartnerProducts ? ' 16px 16px 12px' : ' 18px 16px 20px' }}
          >
            <View className={styles.timeBox}>
              <View className={styles.desc}>
                <Image
                  className={styles.tag}
                  src="https://cdn-public.knowyourself.cc/icon/zxs/lesson.png"
                ></Image>
                <Text className={styles.text}>咨询时长</Text>
              </View>
              <View className={styles.valueDesc}>
                {(this.ciStore.consultantInfo.consultationDuration < 0 ||
                  this.ciStore.consultantInfo.consultationDuration < 100) && (
                  <Text className={styles.suffix}>近</Text>
                )}
                <Text className={styles.value}>
                  {`${this.handleConsultationDuration(
                    this.ciStore.consultantInfo.consultationDuration,
                  )}`}
                </Text>
                <Text className={styles.suffix}>小时</Text>
              </View>
            </View>
            <View className={styles.long}>
              <View className={styles.desc}>
                <Image
                  className={styles.tag}
                  src="https://cdn-public.knowyourself.cc/icon/zxs/lesson.png"
                ></Image>
                <Text className={styles.text}>长程培训</Text>
              </View>
              <View className={styles.valueDesc}>
                <Text className={styles.value}>{this.ciStore.consultantInfo.longTermTraining}</Text>
                <Text className={styles.suffix}>次</Text>
              </View>
            </View>
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
                  {this.ciStore.consultantInfo.shortTermTraining}
                </Text>
                <Text className={styles.suffix}>次</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* 产品信息 */}
        {this.partnerProduct()}

        {/* 个人介绍等tab */}
        {this.ciStore.consultantInfo && swiperHeight >= 0 ? (
          <View
            className={classNames({
              [styles.tab]: true,
              [styles.tab_fixed]: scrollTop >= swiperHeight + 48,
            })}
            style={{
              top: hight + 20,
              borderTop: hasPartnerProducts ? '' : '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <Text
              className={`${styles.text} ${
                this.state.currentTabIndex === 1 ? styles.textActive : ''
              }`}
              onClick={() => {
                this.setState({ currentTabIndex: 1 });
                Taro.pageScrollTo({
                  scrollTop: swiperHeight + 48,
                  duration: 300,
                });
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
                Taro.pageScrollTo({
                  scrollTop: 5000,
                  duration: 300,
                });
              }}
            >
              可约时间
            </Text>
            <Text className={styles.timeTip}>（北京时间）</Text>
          </View>
        ) : null}

        {this.ciStore.consultantInfo && swiperHeight >= 0 ? (
          <CounselorPersonalIntroduction
            sty={scrollTop >= swiperHeight ? { marginTop: 0 } : {}}
          ></CounselorPersonalIntroduction>
        ) : null}

        {/* 可约时间 */}
        {this.ciStore.consultantInfo && swiperHeight >= 0 ? (
          <View className={styles.t_p_wrapper}>
            <View className={styles.t_p}>
              <View className={styles.t}>
                可约时间<Text>（北京时间）</Text>
              </View>
              <View
                className={styles.kysj}
                onClick={() => {
                  // Taro.navigateTo({
                  //   url: `/subConsultant/pages/chooseAppointment/index?id=${counselorId}`,
                  // });
                  navigateTo(`/subConsultant/pages/chooseAppointment/index?id=${counselorId}`);
                }}
              >
                {this.ciStore.consultantInfo.scheduleList.map((item: any) => {
                  return (
                    <View className={styles.kyyysj} key={item.date}>
                      <View className={classNames(item.status == '0' ? styles.bg0 : styles.bg1)}>
                        <View className={styles.week}>{item.week}</View>
                        <KYNumber className={styles.d}>
                          {item.month}.{item.day < 9 ? '0' + item.day : item.day}
                        </KYNumber>
                      </View>
                      {item.status == '0' ? (
                        <View className={styles.ky0}>
                          余<Text className={styles.num}>{item.availableNum}</Text>
                        </View>
                      ) : null}
                      {item.status == '1' ? <View className={styles.ky1}>已满</View> : null}
                      {item.status == '2' ? <View className={styles.ky2}>休息</View> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}

        {/* 温馨提示 */}

        {this.ciStore.consultantInfo && swiperHeight >= 0 && (
          <View className={styles.zzsm}>
            <View className={styles.line}></View>
            <View className={styles.title}>咨询须知</View>
            <View className={styles.p}>
              1.咨询师本人承诺以上资料真实准确，接受公众监督并为此承担相应法律责任，如您发现虚假信息，请联系平台客服投诉；
            </View>
            <View className={styles.p}>
              2.切勿脱离平台私下交易，脱离平台预约发生的服务纠纷平台不承担相应责任；
            </View>
            <View className={styles.p}>3.提交预约后咨询师将在24h内确认预约情况；</View>
            <View className={styles.p}>
              4.如您预约面对面咨询，具体地址在咨询师接受预约通过短信发送至您手机；
            </View>
          </View>
        )}

        {/* 底部按钮 */}
        <View className={styles.bottom}>
          <View
            className={styles.bottom_l}
            onClick={() => {
              // 埋点: 知我心理咨询师详情页按钮点击（个人主页）
              KYTrack(
                T_CounselorDetailPageButtonClick({
                  Counselor_list_filter_subject_tag: '1',
                  counselor_id: this.state.counselorId,
                  counselor_name: this.ciStore.consultantInfo.realName,
                }),
              );
              this.store.imStore.initChatInfo();
              // Taro.navigateTo({
              //   url: `/subConsultant/pages/chat/index?counselorId=${this.state.counselorId}`,
              // });
              navigateTo(`/subConsultant/pages/chat/index?counselorId=${this.state.counselorId}`);
            }}
          >
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/zxs/icon_contact.png"
            />
            <Text className={styles.txt}>联系咨询师</Text>
          </View>
          <View
            className={styles.btn}
            onClick={() => {
              // 埋点: 知我心理咨询师详情页按钮点击（个人主页）
              KYTrack(
                T_CounselorDetailPageButtonClick({
                  Counselor_list_filter_subject_tag: '2',
                  counselor_id: this.state.counselorId,
                  counselor_name: this.ciStore.consultantInfo.realName,
                }),
              );
              // Taro.navigateTo({
              //   url: `/subConsultant/pages/chooseAppointment/index?id=${counselorId}`,
              // });
              navigateTo(`/subConsultant/pages/chooseAppointment/index?id=${counselorId}`);
            }}
          >
            <Text className={styles.btn_txt}>立即预约</Text>
          </View>
        </View>
      </KYPage>
    );
  }
}

export default Consultant;
