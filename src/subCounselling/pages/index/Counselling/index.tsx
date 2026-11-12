import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image, Text } from '@tarojs/components';
import {
  CounsellingDoctorServiceStatusEnum,
  CounsellingItemKeyEnum,
  CounsellingUserType,
} from '@ky-client/counselling-type';
import { formatPriceNoZero, getAvatarUrl } from '@/utils/util';
import { rpx2px } from '@/modules/utils/tools';
import { CounselorIdentityEnum, FixTxt } from '@/types/common.type';
import {
  T_ConsultHomePageView,
  T_ConsultantClick,
  T_ConsultantAvatarClick,
} from '@/modules/track/events';
import { SERVICE_STATUS_MAP } from '@/constants';
import { KYTrack } from '@/modules/track';
import { navigateTo } from '@/utils/navigate';
import KYResourceSlot from '@/components/KYResourceSlot';
import Taro from '@tarojs/taro';
import { TOKEN_KEY } from '@/constants/values';
import { counsellingApi } from '@/services';
import classNames from 'classnames';
import KYNumber from '@/components/KYNumber';
import styles from './index.module.less';
import ResourceSlot from './components/ResourceSlot';
import Shaixuan from './components/Shaixuan';

type Props = {
  tabFixed: boolean;
  sendTabFixedTop: (top: number) => void;
};

type IStates = {
  tabFixedTop: number;
  navTop: number;
  // 储值卡余额
  storageCardAmount: number;
  load: boolean;
  // modalVisitable: boolean;
};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, IStates> {
  state = {
    tabFixedTop: 0,
    navTop: 0,
    storageCardAmount: 0,
    load: true,
    // modalVisitable: true,
  };

  get cistore() {
    return this.store.counsellingIndexStore;
  }

  async componentDidMount() {
    // const token = Taro.getStorageSync(TOKEN_KEY) || '';
    // if (token) {
    //   const res = await counsellingApi.checkHasOrder();
    //   if (res.code == 0) {
    //     if (res.data.hasOrder || (!res.data.hasOrder && res.data.isReceived)) {
    //       // 埋点: 打开优惠券领域
    //       this.setState({ modalVisitable: false });
    //     }
    //   }
    // }
    // 每次进来都要刷新余额
    this.getCardInfo();

    setTimeout(() => {
      Taro.createSelectorQuery()
        .select('#shaixuanFixedliao')
        .boundingClientRect((rect: any) => {
          const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
          this.setState(
            {
              navTop: sbh + rpx2px(48),
              tabFixedTop: rect.top - sbh - rpx2px(48),
              load: false,
            },
            () => {
              this.props.sendTabFixedTop(this.state.tabFixedTop);
            },
          );
        })
        .exec();
    }, 50);

    //埋点: 浏览聊愈首页
    KYTrack(T_ConsultHomePageView());
  }

  handleSearch() {
    // Taro.navigateTo({ url: '/subCommon/pages/search/index' });
    navigateTo('/subCommon/pages/search/index');
  }
  // 获取即时咨询优惠充时卡的余额
  async getCardInfo() {
    const token = Taro.getStorageSync(TOKEN_KEY) || '';
    if (!token) return;
    const { code, data } = await counsellingApi.cardInfo();
    if (code === 0 && data !== null) {
      this.setState({ storageCardAmount: data.balanceMoney });
    }
  }
  handleStorageCard = () => {
    navigateTo(`/subCounselling/pages/storageCard/index`);
  };

  handleExamCustomer = async (content: string) => {
    const idleList = this.cistore.counsellingList.filter(
      (item) => item.serviceStatus === CounsellingDoctorServiceStatusEnum.idle,
    );
    const restList = this.cistore.counsellingList.filter(
      (item) => item.serviceStatus === CounsellingDoctorServiceStatusEnum.rest,
    );

    if (idleList.length > 0) {
      const random = Math.floor(Math.random() * idleList.length);
      navigateTo(`/subCounselling/pages/chat/index?`, {
        doctorId: idleList[random].doctorId,
        content: content,
      });
    } else {
      const random = Math.floor(Math.random() * restList.length);
      navigateTo(`/subCounselling/pages/chat/index?`, {
        doctorId: restList[random].doctorId,
        content: content,
      });
    }
  };

  onShareAppMessage() {
    return {
      title: FixTxt.indexPageText,
      path: '/pages/index/index',
      imageUrl: 'https://cdn-public.knowyourself.cc/icon/wechat/shareImg.jpg',
    };
  }

  // 找到最大优惠
  maxCoupon = (item: CounsellingUserType.DoctorListResponseType) => {
    const hasChat = item.powers.includes(CounsellingItemKeyEnum.JSWZCS);
    const hasCall = item.powers.includes(CounsellingItemKeyEnum.JSTH);
    const chatCoup = item.coupon?.jswzcs;
    const callCoup = item.coupon?.jsth;
    if (hasChat && !hasCall) {
      // 有文字权限
      return chatCoup;
    }

    if (hasCall && !hasChat) {
      // 有通话权限
      return callCoup;
    }

    // 如果两个都有，则返回最大的
    if (chatCoup && callCoup) {
      return chatCoup.amount > callCoup.amount ? chatCoup : callCoup;
    }

    // 返回不为空的那个
    return chatCoup || callCoup || null;
  };

  updateCouponTxt = (item: CounsellingUserType.DoctorListResponseType) => {
    const discount = this.maxCoupon(item);
    if (discount) {
      const thresholdText =
        discount.threshold > 0 ? `满${formatPriceNoZero(discount.threshold)}` : '无门槛';
      return `${thresholdText}减${formatPriceNoZero(discount.amount)}`;
    }
    return null;
  };

  isDiscount = (item: CounsellingUserType.DoctorListResponseType) => {
    // 文字
    let chatDiscountPrice = 0;
    let chatDiscountTxt = '';
    // 通话
    let callDiscountPrice = 0;
    let callDiscountTxt = '';

    const isChatDiscount =
      item?.chatActivity?.type === 'CounsellingDiscountActivity' &&
      item?.chatActivity?.minPayPrice < item.chatMinDot;
    const isCallDiscount =
      item?.callActivity?.type === 'CounsellingDiscountActivity' &&
      item?.callActivity?.minPayPrice < item.callMinDot;

    if (isChatDiscount) {
      chatDiscountPrice = item.chatActivity?.minPayPrice ?? item.chatMinDot;
      const discountNum = item.chatActivity?.discountActivity?.discount || 0;
      chatDiscountTxt = `${discountNum * 0.1}折`;
    }
    if (isCallDiscount) {
      callDiscountPrice = item.callActivity?.minPayPrice ?? item.callMinDot;
      const discountNum = item.callActivity?.discountActivity?.discount || 0;
      callDiscountTxt = `${discountNum * 0.1}折`;
    }

    return {
      isChatDiscount,
      isCallDiscount,
      chatDiscountPrice,
      chatDiscountTxt,
      callDiscountPrice,
      callDiscountTxt,
    };
  };

  getServiceCountText = (count: number) => {
    if (count < 100) {
      return '近100';
    }

    // 大于等于100时，按100区间显示
    const divisor = Math.floor(count / 100) * 100;
    return `${divisor}+`;
  };

  render() {
    const { navTop, storageCardAmount } = this.state;
    const { tabFixed } = this.props;

    return (
      <View className={styles.CounsellingIndexPage}>
        <View className={styles.tipsView}>
          <View className={styles.p}>即时咨询：KY自主培养，1对1快速响应</View>
          <Image
            src="https://cdn-public.knowyourself.cc/icon/wechat/20240129_ly_icon_search.png"
            className={styles.i1}
            onClick={this.handleSearch}
          />
          <Image
            onClick={() => {
              // Taro.redirectTo({ url: '/subConsultant/pages/serviceData/index' });
              navigateTo('/subConsultant/pages/serviceData/index');
            }}
            src="https://cdn-public.knowyourself.cc/icon/wechat/20240129_titlebar_icon_information_black.png"
            className={styles.i2}
          />
        </View>

        {/* 储值卡入口 */}
        {/* <View className={styles.storageCard} onClick={this.handleStorageCard}>
          <View className={styles.left}>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/0000new-icon/kyclass/20250723_csktext.png"
            />
            <View className={styles.line}></View>
            <View className={styles.txt}>低至8.6折</View>
          </View>
          <View className={styles.right}>
            <View className={styles.amount_txt}>余额：</View>
            <View className={styles.amount}>
              <View className={styles.symbol}>¥</View>
              <KYNumber className={styles.money}>{formatPrice(storageCardAmount)}</KYNumber>
            </View>
          </View>
        </View> */}

        {this.cistore.resourceSlotList.length ? <ResourceSlot /> : null}
        <KYResourceSlot id="LiaoyuIndexBanners2" autoHeight />

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

        {this.cistore.counsellingList.length === 0 ? (
          <View className={styles.empty}>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/common/empty_Illustration_message@3x.png"
              className={styles.img}
            />
            <Text className={styles.txt}>暂无符合条件的聊愈师</Text>
          </View>
        ) : (
          <View className={styles.doctorList}>
            {this.cistore.counsellingList.map((item, index) => {
              return (
                <View
                  className={styles.lysCell}
                  key={index + '_liaoyu'}
                  onClick={() => {
                    // 埋点: 点击聊愈师卡片
                    KYTrack(
                      T_ConsultantClick({
                        consultant_id: item.doctorId,
                        consultant_name: item.userAliasCounsellingData.nickName,
                        consultant_state: (item.serviceStatus as any) || '',
                        index,
                        consultant_list_tag: '',
                        consultant_list_tagid: '',
                        consultant_list_filter_subject_tag:
                          (this.cistore.params.subjectIds as any) || [],
                        consultant_list_filter_serve_tag:
                          (this.cistore.params.serviceType as any) || '',
                        consultant_list_filter_rank_tag: (this.cistore.params.sort as any) || '',
                        consultant_list_filter_more_tag: (this.cistore.params.status as any) || '',
                      }),
                    );
                    this.store.imStore.initChatInfo();
                    // Taro.navigateTo({
                    //   url: `/subCounselling/pages/chat/index?doctorId=${item.doctorId}`,
                    // });
                    navigateTo(`/subCounselling/pages/chat/index`, {
                      doctorId: item.doctorId,
                    });
                  }}
                >
                  <View className={styles.lysCellLeft}>
                    <Image
                      src={getAvatarUrl(item.userAliasCounsellingData.avatar)}
                      className={styles.avatar}
                      onClick={(e) => {
                        // 埋点: 聊愈师卡片头像点击
                        console.log('点击头像');
                        KYTrack(
                          T_ConsultantAvatarClick({
                            consultant_id: item.doctorId,
                            consultant_name: item.userAliasCounsellingData.nickName,
                            consultant_state: (item.serviceStatus as any) || '',
                            index,
                            consultant_list_tag: '',
                            consultant_list_tagid: '',
                            consultant_list_filter_subject_tag:
                              (this.cistore.params.subjectIds as any) || [],
                            consultant_list_filter_serve_tag:
                              (this.cistore.params.serviceType as any) || '',
                            consultant_list_filter_rank_tag:
                              (this.cistore.params.sort as any) || '',
                            consultant_list_filter_more_tag:
                              (this.cistore.params.status as any) || '',
                          }),
                        );
                        e.stopPropagation();
                        // Taro.navigateTo({
                        //   url: `/subCommon/pages/userInfo/index?sence=${item.doctorId}&identity=${CounselorIdentityEnum.Counselling}`,
                        // });
                        navigateTo(`/subCommon/pages/userInfo/index?`, {
                          sence: item.doctorId,
                          identity: CounselorIdentityEnum.Counselling,
                          userAliasId: item.userAliasId,
                        });
                      }}
                    />
                    <View
                      className={classNames(styles.state1, {
                        [styles.state2]: item.serviceStatus === 3,
                        [styles.state3]: item.serviceStatus === 1,
                      })}
                    >
                      {SERVICE_STATUS_MAP.get(item.serviceStatus)}
                    </View>
                  </View>
                  <View className={styles.lysCellRight}>
                    <View className={styles.nickview}>
                      <View className={styles.nick}>{item.userAliasCounsellingData.nickName}</View>
                      <Image
                        src={this.store.platformStore.tagLabel.liaoyushi.small.url}
                        className={styles.tag}
                      />
                      <View className={styles.num}>
                        服务人次:{' '}
                        {item.serviceCount ? this.getServiceCountText(item.serviceCount) : '0'}
                      </View>
                    </View>
                    {/* 服务特色 */}
                    <View className={styles.tagsview}>
                      {item.characteristic.map((item2, i) => (
                        <View className={styles.tag} key={i}>
                          {item2}
                        </View>
                      ))}
                    </View>
                    <View className={styles.desc}>{item.sign}</View>

                    {/* 即时活动  */}
                    <View className={styles.priceview}>
                      {item.powers.includes(CounsellingItemKeyEnum.JSWZCS) && (
                        <>
                          <View className={styles.p1}>对话</View>
                          <KYNumber
                            className={styles.price}
                            color={this.isDiscount(item).isChatDiscount ? '#F85D48' : '#000'}
                          >
                            ¥
                            {formatPriceNoZero(
                              this.isDiscount(item).isChatDiscount
                                ? this.isDiscount(item).chatDiscountPrice
                                : item.chatMinDot,
                            )}
                          </KYNumber>
                          <View className={styles.btn}>起</View>

                          {this.isDiscount(item).isChatDiscount && (
                            <View className={styles.xianshi}>
                              {this.isDiscount(item).chatDiscountTxt}
                            </View>
                          )}
                        </>
                      )}

                      {item.powers.includes(CounsellingItemKeyEnum.JSTH) && (
                        <>
                          <View
                            className={classNames({
                              [styles.p1]: true,
                              [styles.padd]: item.powers.includes(CounsellingItemKeyEnum.JSWZCS),
                            })}
                          >
                            通话
                          </View>
                          <KYNumber
                            className={styles.price}
                            color={this.isDiscount(item).isCallDiscount ? '#F85D48' : '#000'}
                          >
                            ¥
                            {formatPriceNoZero(
                              this.isDiscount(item).isCallDiscount
                                ? this.isDiscount(item).callDiscountPrice
                                : item.callMinDot,
                            )}
                          </KYNumber>
                          <View className={styles.btn}>起</View>
                          {this.isDiscount(item).isCallDiscount && (
                            <View className={styles.xianshi}>
                              {this.isDiscount(item).callDiscountTxt}
                            </View>
                          )}
                        </>
                      )}
                    </View>

                    {this.updateCouponTxt(item) && (
                      <View className={styles.coupon}>
                        <View className={styles.p1}>券</View>
                        <View className={styles.p2}>{this.updateCouponTxt(item)}</View>
                      </View>
                    )}

                    {/* {index == 0 ? (
                    <View className={styles.coupon}>
                      <View className={styles.p1}>券</View>
                      <View className={styles.p2}>满46减5</View>
                    </View>
                  ) : null} */}
                  </View>
                  {['可服务', '服务中'].includes(
                    SERVICE_STATUS_MAP.get(item.serviceStatus) || '',
                  ) && (
                    <View
                      className={styles.cellBtn1}
                      onClick={(e) => {
                        // 埋点: 点击聊愈师卡片
                        KYTrack(
                          T_ConsultantClick({
                            consultant_id: item.doctorId,
                            consultant_name: item.userAliasCounsellingData.nickName,
                            consultant_state: (item.serviceStatus as any) || '',
                            index,
                            consultant_list_tag: '',
                            consultant_list_tagid: '',
                            consultant_list_filter_subject_tag:
                              (this.cistore.params.subjectIds as any) || [],
                            consultant_list_filter_serve_tag:
                              (this.cistore.params.serviceType as any) || '',
                            consultant_list_filter_rank_tag:
                              (this.cistore.params.sort as any) || '',
                            consultant_list_filter_more_tag:
                              (this.cistore.params.status as any) || '',
                          }),
                        );
                        this.store.imStore.initChatInfo();
                        e.stopPropagation();
                        // 测试
                        // Taro.navigateTo({
                        //   url: `/subCounselling/pages/chat/index?doctorId=${item.doctorId}`,
                        // });
                        navigateTo(`/subCounselling/pages/chat/index?`, {
                          doctorId: item.doctorId,
                        });
                      }}
                    >
                      立即咨询
                    </View>
                  )}
                  {SERVICE_STATUS_MAP.get(item.serviceStatus) === '休息中' && (
                    <View
                      className={styles.cellBtn2}
                      onClick={(e) => {
                        // 埋点: 点击聊愈师卡片
                        KYTrack(
                          T_ConsultantClick({
                            consultant_id: item.doctorId,
                            consultant_name: item.userAliasCounsellingData.nickName,
                            consultant_state: (item.serviceStatus as any) || '',
                            index,
                            consultant_list_tag: '',
                            consultant_list_tagid: '',
                            consultant_list_filter_subject_tag:
                              (this.cistore.params.subjectIds as any) || [],
                            consultant_list_filter_serve_tag:
                              (this.cistore.params.serviceType as any) || '',
                            consultant_list_filter_rank_tag:
                              (this.cistore.params.sort as any) || '',
                            consultant_list_filter_more_tag:
                              (this.cistore.params.status as any) || '',
                          }),
                        );
                        this.store.imStore.initChatInfo();
                        e.stopPropagation();
                        // 测试
                        // Taro.navigateTo({
                        //   url: `/subCounselling/pages/chat/index?doctorId=${item.doctorId}`,
                        // });
                        navigateTo(`/subCounselling/pages/chat/index`, {
                          doctorId: item.doctorId,
                        });
                      }}
                    >
                      给Ta留言
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        {/*
        {this.state.load ? null : (
          <View
            className={classNames({
              [styles.show]: modalVisitable,
              [styles.modal]: true,
            })}
          >
            <View className={styles.content}>
              <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/20251030_coupon3x.jpg"
                mode="widthFix"
              />
              <View
                className={classNames({ [styles.btn]: true })}
                onClick={async () => {
                  const token = Taro.getStorageSync(TOKEN_KEY) || '';
                  if (!token) {
                    gotoLogin(true, getCurrentFullRoute());
                  } else {
                    const data = await counsellingApi.receiveNoOrderCoupon();
                    if (data.code == 0) {
                      // 埋点: 优惠券领取成功
                      Taro.showToast({ title: '领取成功', icon: 'none' });
                      this.setState({ modalVisitable: false });
                    } else {
                      Taro.showToast({ title: data.message, icon: 'none' });
                    }
                  }
                }}
              ></View>
            </View>
            <Image
              onClick={() => {
                this.setState({ modalVisitable: false });
              }}
              className={styles.close}
              mode="widthFix"
              src="https://cdn-public.knowyourself.cc/icon/wechat/20240321_close.png"
            />
          </View>
        )} */}
      </View>
    );
  }
}
//

export default Index;
