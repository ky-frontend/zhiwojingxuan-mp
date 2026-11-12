import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { View, Image, Swiper, SwiperItem } from '@tarojs/components';
import KYNavigation from '@/components/KYNavigation';
import KYTabBar from '@/components/KYTabBar';
import Taro from '@tarojs/taro';
import { KYLoading } from '@/components/KYLoading';
import classNames from 'classnames';
import { TOKEN_KEY } from '@/constants/values';
import { gotoLogin } from '@/utils/identity';
import { counsellingApi, homeApi, platformApi, userApi } from '@/services';
import { IdentityTagsEnum, UserStaffType } from '@ky-middleground/user-type';
import { CounsellingUserType } from '@ky-client/counselling-type';
import { getCurrentFullRoute, navigateTo } from '@/utils/navigate';
import { PlatformResourceSlotType, SlotTypeEnum } from '@ky-middleground/platform-type';
import styles from './index.module.less';
import JinGang from '../components/JinGang';
import StaffList from '../components/StaffList';

type SwiperItemType = { picUrl: string; redirectForApp: string; redirectForMp: string };

const BANNER_HORIZONTAL_PADDING = 32;

const getDefaultBannerHeight = () => {
  const { windowWidth } = Taro.getSystemInfoSync();
  const contentWidth = windowWidth - BANNER_HORIZONTAL_PADDING;
  return Math.round(contentWidth * (280 / 686)) + 10;
};

type IState = {
  jingangList: Array<Array<PlatformResourceSlotType>>;
  staffGroupList: {
    tagId: string;
    tagName: string;
    staffList: UserStaffType[];
  }[];
  liaoyuList: CounsellingUserType.DoctorListResponseType[];
  swiperData: SwiperItemType[];
  couponData: SwiperItemType[];
  modalVisitable: boolean;
  bannerHeight: number;
};
@inject('store')
@observer
class Index extends BaseKyComponent<{}, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      jingangList: [],
      staffGroupList: [],
      liaoyuList: [],
      swiperData: [],
      couponData: [],
      modalVisitable: false,
      bannerHeight: getDefaultBannerHeight(),
    };
  }

  handleBannerLoad = (
    e: { detail: { width?: number | string; height?: number | string } },
    index: number,
  ) => {
    if (index !== 0) return;
    const width = Number(e.detail.width);
    const height = Number(e.detail.height);
    if (!width || !height) return;
    const { windowWidth } = Taro.getSystemInfoSync();
    const contentWidth = windowWidth - BANNER_HORIZONTAL_PADDING;
    const bannerHeight = Math.ceil((contentWidth / width) * height) + 10;
    if (bannerHeight !== this.state.bannerHeight) {
      this.setState({ bannerHeight });
    }
  };
  async componentDidMount() {
    const token = Taro.getStorageSync(TOKEN_KEY) || '';
    if (token) {
      const res = await counsellingApi.checkHasOrder();
      if (res.code == 0) {
        this.setState({ modalVisitable: !res.data.hasOrder });
      }
    } else {
      this.setState({ modalVisitable: true });
    }
    // 获取金刚位数据、 banner 数据、 列表数据
    KYLoading.show();
    const [swiperDataList, couponDataList, jingang, staffGroupList] = await Promise.all([
      platformApi.getResourceSpotContent('ZhiWoHomeTopBanner'),
      platformApi.getResourceSpotContent('newUserCupon'),
      homeApi.getResourceSlotList(SlotTypeEnum.ZHIWO2),
      userApi.getStaffGroupList(),
    ]);
    const ids: string[] = [];
    staffGroupList.data.forEach((item) => {
      item.staffList.forEach((staff) => {
        if (staff.identityTag === IdentityTagsEnum.liaoyushi && staff.aliasId) {
          ids.push(staff.aliasId);
        }
      });
    });
    console.log('swiperDataList', swiperDataList);
    this.setState({
      jingangList: jingang.data,
      staffGroupList: staffGroupList.data,
      swiperData: swiperDataList.data[0]?.content || ([] as any),
      couponData: couponDataList.data[0]?.content || ([] as any),
    });
    const liaoyuList = await homeApi.getCounsellingDoctorListByIds(ids);
    KYLoading.hide();
    this.setState({
      liaoyuList: liaoyuList.data,
    });
  }

  parseWeixinUrl(url: string) {
    try {
      // 匹配 appid 和 path 参数
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

  render() {
    const res = Taro.getSystemInfoSync();

    const height = res.statusBarHeight || 0;

    const { jingangList, swiperData, modalVisitable, couponData, bannerHeight } = this.state;

    return (
      <KYPage className={styles.index}>
        <KYNavigation
          className={styles.back}
          showBack={false}
          navigationRender={() => {
            return (
              <View className={styles.input}>
                <View
                  className={styles.box}
                  onClick={() => {
                    navigateTo('/subCommon/pages/search/index');
                  }}
                >
                  <Image
                    className={styles.icon}
                    src="https://cdn-public.knowyourself.cc/icon/coach/20250916_search-normal.png"
                  />
                </View>
                <Image
                  className={styles.msg}
                  onClick={() => {
                    navigateTo(`/subWebview/pages/webviewV1/index?qiyuShuntId=1098754`);
                  }}
                  src="https://cdn-public.knowyourself.cc/icon/coach/20250916_message.png"
                />
              </View>
            );
          }}
        />
        <View className={styles.line} style={{ paddingTop: height + 50 + 'px' }}></View>

        {swiperData.length > 0 ? (
          <Swiper
            className={classNames({
              [styles.banner]: true,
              [styles.indicator_dots]: swiperData.length > 1,
            })}
            style={{ height: `${bannerHeight}px` }}
            circular
            {...(swiperData.length > 1
              ? { indicatorDots: true, autoplay: true, interval: 3500 }
              : {})}
            indicatorColor="rgba(0,0,0,0.3)"
            indicatorActiveColor="#6C76DB"
            skipHiddenItemLayout
          >
            {swiperData.map((_, i) => (
              <SwiperItem key={i}>
                <View
                  className={styles.swiper_content}
                  onClick={() => {
                    const token: any = Taro.getStorageSync(TOKEN_KEY) || '';
                    if (!token) {
                      navigateTo(`/pages/login/index`);
                      return;
                    }
                    const url = _.redirectForMp || null;
                    // const openId = Taro.getStorageSync(USER_OPENID);
                    if (!url) return;
                    // 判断是否为跳转其他小程序的链接
                    if (url.startsWith('weixin://')) {
                      // 解析 URL 获取参数
                      const { appId, path } = this.parseWeixinUrl(url) || {};

                      if (appId) {
                        Taro.navigateToMiniProgram({
                          appId: appId,
                          path: path || '',
                          success: () => {
                            console.log('跳转小程序成功');
                          },
                          fail: (err) => {
                            console.error('跳转小程序失败', err);
                          },
                        });
                      }
                    } else if (url.startsWith('http')) {
                      // const _url = `${url}?token=${encodeURIComponent(openId)}&platform=weapp&title=优惠充时卡`;
                      // navigateTo(`/pages/webview/index?url=${encodeURIComponent(_url)}`);
                      navigateTo('/subCounselling/pages/storageCard/index');
                    } else {
                      navigateTo(url);
                    }
                  }}
                >
                  <Image
                    src={_.picUrl}
                    className={styles.swiper_img}
                    mode="widthFix"
                    onLoad={(e) => this.handleBannerLoad(e, i)}
                  />
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        ) : null}
        <View className={styles.jingang}>
          <JinGang data={jingangList} />
        </View>

        <View className={styles.list}>
          <StaffList data={this.state.staffGroupList} liaoyuList={this.state.liaoyuList} />
        </View>

        <View
          className={classNames({
            [styles.show]: modalVisitable,
            [styles.modal]: true,
          })}
        >
          <View className={styles.content}>
            {/* 活动弹框 */}
            {couponData?.[0]?.picUrl?.indexOf?.('http') > -1 && (
              <Image
                className={styles.img}
                src={`${couponData?.[0]?.picUrl}?t=${Date.now()}`}
                mode="widthFix"
              />
            )}
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

        <KYTabBar index={0} />
      </KYPage>
    );
  }
}

export default Index;
