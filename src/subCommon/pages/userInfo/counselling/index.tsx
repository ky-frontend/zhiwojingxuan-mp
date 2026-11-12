import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { counsellingApi } from '@/services';
import Taro from '@tarojs/taro';
import { KYLoading } from '@/components/KYLoading';
import { getUserInfo, getUserAliasInfo2 } from '@/utils/identity';
import { getAvatarUrl } from '@/utils/util';
import { KYTrack } from '@/modules/track';
import { replaceTo } from '@/utils/navigate';
import { TOKEN_KEY } from '@/constants/values';
import {
  T_ConsultantDetailPageView,
  T_ConsultantDetailPageConsultClick,
} from '@/modules/track/events';
import KYModal from '@/components/KYModal';
import classNames from 'classnames';
import { View, Image } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import styles from './index.module.less';
import { Itags } from '../../../../store/platform';

type IProps = {
  counsellingId: string;
  userAliasId: string;
  top: boolean;
  onChange: (value) => void;
  title: boolean;
};
type IState = {
  dealFlag: boolean;
  sign: boolean;
  say: boolean;
  goodat: boolean;
  pro: boolean;
  xueli: boolean;
  shouxun: boolean;
  work: boolean;
  isOpen: {};
  isShow: boolean;
  title: string;
  content: string;
  actions: any[];
  userId: string;
  intro: number;
};
@inject('store')
@observer
class Counselling extends BaseKyComponent<IProps, IState> {
  constructor(props: IProps | Readonly<IProps>) {
    super(props);
    this.state = {
      dealFlag: false,
      sign: false,
      say: false,
      goodat: false,
      pro: false,
      xueli: false,
      shouxun: false,
      work: false,
      isOpen: {
        sign: false,
        say: false,
        goodat: false,
        pro: false,
        xueli: false,
        shouxun: false,
        work: false,
      }, // 文本的展开关闭按钮
      isShow: false,
      title: '',
      content: '',
      actions: ['取消', '确认'],
      userId: '',
      intro: 0,
    };
  }

  dealIndex = 0;
  height: number[] = [];
  dict = ['single', 'sign', 'say', 'goodat', 'pro', 'xueli', 'shouxun', 'work'];
  sex = {
    1: '男',
    2: '女',
    3: '保密',
    4: '其他性别',
    5: '跨性别男性',
    6: '跨性别女性',
  };

  async componentDidMount() {
    const { userAliasId, counsellingId } = this.props;
    console.log('userAliasId22', userAliasId);
    KYLoading.show();
    // 无论是否有 userAliasId，都按 counsellingId 拉取详情，避免缺参白屏 / 串数据
    if (counsellingId) {
      if (userAliasId) {
        const data: any = await getUserAliasInfo2(userAliasId);
        if (data?.id) {
          this.setState({ userId: data.id });
        }
      }
      await this.store.doctorInfoStore.getDoctor(counsellingId, userAliasId);
    }
    KYLoading.hide();

    if (!this.state.dealFlag) {
      setTimeout(() => {
        this.getHeight(this.dict[this.dealIndex]);
      }, 50);
    }

    // 埋点: 知我心理浏览聊愈师详情页 1社区首页、2聊愈首页、3聊愈会话页
    const routePages = Taro.getCurrentPages();
    let referal_page = 1; // 默认社区首页
    if (routePages.length >= 2) {
      const page = routePages[routePages.length - 2];
      // 聊愈会话页
      if (page.route?.includes('chat')) {
        referal_page = 3;
      }
      // 聊愈首页
      if (page.route?.includes('subCounselling/pages/index/index')) {
        referal_page = 2;
      }
    }
    KYTrack(
      T_ConsultantDetailPageView({
        referal_page,
        consultant_type: this.store.doctorInfoStore.doctorInfo?.powers || [],
        consultant_id: this.props.counsellingId,
        consultant_name: this.store.doctorInfoStore.doctorInfo?.userAliasCounsellingName || '',
        consultant_tag: this.store.doctorInfoStore.doctorInfo?.tag,
        consultant_state: this.store.doctorInfoStore.doctorInfo?.serviceStatus || '',
      }),
    );
  }

  componentWillUnmount() {
    this.store.doctorInfoStore.clearDoctorInfo();
  }

  getHeight = async (item: string) => {
    const query = Taro.createSelectorQuery();
    query.select(`#${item}`).boundingClientRect();
    query.exec((res) => {
      if (res && res[0]) {
        let flag = false;
        if (res[0].height > 45 && item == 'sign') {
          flag = true;
        } else if (res[0].height > 66 && item != 'sign') {
          flag = true;
        }
        if (item == 'intro') {
          const res1 = Taro.getSystemInfoSync();
          console.log(res[0]);
          this.props.onChange(res[0].top - res1.statusBarHeight);
          this.setState({ [item]: res[0].top });
        } else {
          this.height.push(res[0].height);
          this.setState({ [item]: flag }, () => {
            // this.dealIndex += 1;
            if (this.dealIndex < this.dict.length - 1) {
              this.getHeight(this.dict[++this.dealIndex]);
            } else {
              this.setState({ dealFlag: true });
            }
          });
        }
      }
    });
  };

  src = this.store.platformStore.tagLabel['liaoyushi' as Itags].small.url;
  componentDidUpdate(): void {
    if (this.state.dealFlag && this.state.intro == 0) {
      this.getHeight('intro');
    }
  }
  onCopy = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: '复制成功', duration: 2000 }),
      fail: () => Taro.showToast({ title: '复制失败', duration: 2000 }),
    });
  };
  setNotice = (flag: boolean) => {
    if (!flag) {
      this.setState({
        isShow: true,
        title: '设置聊愈师上线提醒',
        content: '开启后，该聊愈师每日首次上线时，会发送系统通知给您',
      });
    } else {
      this.setState({
        isShow: true,
        title: '取消聊愈师上线提醒',
        content: '取消后，您将无法收到该聊愈师上线时的系统通知',
      });
    }
  };

  dialogEvent = (index: number) => {
    this.setState(
      {
        isShow: false,
        title: '',
        content: '',
      },
      async () => {
        if (index == 1) {
          KYLoading.show();
          await counsellingApi.CounsellingDoctorOnlineNotice(this.props.counsellingId);
          await this.store.doctorInfoStore.getDoctor(
            this.props.counsellingId,
            this.props.userAliasId,
          );
          KYLoading.hide();
        }
      },
    );
  };

  handleServiceCount = (serviceCount = 0) => {
    if (serviceCount < 100) return '近100';
    // 大于等于100时，按100区间显示
    const divisor = Math.floor(serviceCount / 100) * 100;
    return `${divisor}+`;
  };

  render() {
    const res = Taro.getSystemInfoSync();
    const { doctorInfo, doctorData } = this.store.doctorInfoStore;
    const { dealFlag, sign, say, goodat, pro, xueli, shouxun, work, intro } = this.state;
    let hight = 0; // 上线提醒高度设置
    if (res.statusBarHeight) {
      hight = res.statusBarHeight + 14;
    }

    if (doctorInfo && doctorInfo.doctorId && !dealFlag) {
      return (
        <View className={styles.demo} style={{ position: 'fixed', top: '0' }}>
          <View id="single" className={styles.text}>
            单行文本的高度
          </View>
          <View id="sign" className={styles.text}>
            {doctorInfo.sign + '展开'}
          </View>
          <View id="say" className={styles.text}>
            {doctorInfo.summary + '展开'}
          </View>
          <View id="goodat" className={styles.text}>
            {doctorInfo.goodAt + '展开'}
          </View>
          <View id="pro" className={styles.text}>
            {doctorInfo.major?.qualification + '展开'}
          </View>
          <View id="xueli" className={styles.text}>
            {doctorInfo.major?.education + '展开'}
          </View>
          <View id="shouxun" className={styles.text}>
            {doctorInfo.major?.receiveTraining + '展开'}
          </View>
          <View id="work" className={styles.text}>
            {doctorInfo.major?.psychology + '展开'}
          </View>
        </View>
      );
    }

    return doctorInfo ? (
      <KYPage className={styles.CounsellingPage}>
        <KYNavigation
          className={classNames({ [styles.back]: true, [styles.showBackground]: this.props.top })}
          showBack
          backColor={this.props.top ? 'black' : 'white'}
        />
        <View
          className={classNames({
            [styles.tip]: true,
            [styles.ok]: doctorInfo.onlineNotice,
            [styles.color]: this.props.top,
          })}
          onClick={() => {
            this.setNotice(doctorInfo.onlineNotice || false);
          }}
          style={{ top: hight }}
        >
          <Image
            className={classNames(styles.img, { [styles.isTip]: doctorInfo.onlineNotice })}
            src={
              doctorInfo.onlineNotice
                ? this.props.top
                  ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/ic_clock_on_black@3x.png'
                  : 'https://cdn-public.knowyourself.cc/icon/liaoyu/2024_02_23-ic_clock_on.png'
                : this.props.top
                  ? 'https://cdn-public.knowyourself.cc/icon/liaoyu/ic_clock_off_black@3x.png'
                  : 'https://cdn-public.knowyourself.cc/icon/liaoyu/2024_02_23-ic_clock_off.png'
            }
          />
          {doctorInfo.onlineNotice ? '已提醒' : '上线提醒'}
        </View>

        <View
          className={classNames({ [styles.info1]: true, [styles.block1]: this.props.top })}
          style={{ top: hight }}
        >
          <Image
            className={styles.img1}
            src={getAvatarUrl(doctorInfo.userAliasCounsellingAvatar)}
          />
          <View className={styles.nickName}>{doctorInfo.userAliasCounsellingName}</View>
        </View>

        <View
          className={classNames({ [styles.intro]: true, [styles.display]: this.props.title })}
          style={{ top: hight + 30 }}
        >
          个人介绍
        </View>

        <View
          className={styles.TopContent}
          style={{
            backgroundImage: `url(${doctorInfo.userAliasCounsellingAvatar}),linear-gradient(180deg, rgba(11, 5, 30, 0.54) 0%, rgba(11, 5, 27, 0.86) 100%)`,
            marginTop: `${-(res.statusBarHeight || 0) - 52}px`,
          }}
        >
          <View className={styles.userBaseInfo}>
            <View className={styles.avatar}>
              <Image className={styles.img} src={doctorInfo.userAliasCounsellingAvatar} />
            </View>
            <View className={styles.info}>
              <View className={styles.nickName}>
                {doctorInfo.userAliasCounsellingName}
                {/* <View className={styles.tag}>
                  <Image mode="widthFix" src={this.src} className={styles.tagImg} />
                  聊愈师
                </View> */}
              </View>
              <View className={styles.moreInfo}>{this.sex[doctorData.sex]}</View>
              <View
                className={styles.Id}
                onClick={() => {
                  this.onCopy(doctorInfo.userAliasId);
                }}
              >
                ID：{doctorInfo.userAliasId}
              </View>
            </View>
          </View>
        </View>
        <View className={styles.proInfo}>
          <View className={styles.service}>
            服务人次
            <View className={styles.highlight}>
              {/* 近{doctorInfo.serviceCount}次 */}
              {this.handleServiceCount(doctorInfo.serviceCount)}
            </View>
          </View>
          <View className={styles.cc}>
            <View
              className={classNames({
                [styles.text]: true,
                [styles.notAllText]: !this.state.isOpen['sign'],
              })}
              style={
                sign
                  ? this.state.isOpen['sign']
                    ? { height: this.height[1] + 'px' }
                    : { height: this.height[0] * 2 + 'px' }
                  : {}
              }
            >
              <View
                className={classNames({
                  [styles.btn]: true,
                  [styles.showBtn]: sign,
                  [styles.isOpen]: this.state.isOpen['sign'],
                })}
                style={{ height: this.height[0] + 'px' }}
                onClick={() => {
                  setTimeout(() => {
                    this.setState({
                      isOpen: { ...this.state.isOpen, sign: !this.state.isOpen['sign'] },
                    });
                  }, 10);
                }}
              >
                {this.state.isOpen['sign'] ? '收起' : '展开'}
              </View>
              {doctorInfo.sign || '这个家伙很懒，什么也没留下。'}
            </View>
          </View>

          <View className={styles.tabSelf}>
            {doctorInfo.characteristic &&
              doctorInfo.characteristic.map((item, index) => {
                return (
                  <View key={index} className={styles.item}>
                    {item}
                  </View>
                );
              })}
          </View>
          <View className={styles.domain}>
            {doctorInfo.tag?.length
              ? doctorInfo.tag.map((item, index) => {
                  return (
                    <View key={index}>
                      {index == 0 ? '擅长领域：' + item.title : `/ ` + item.title}&nbsp;
                    </View>
                  );
                })
              : null}
          </View>
          <View className={styles.tab}>
            即时咨询<View className={styles.point}></View>
            <View className={styles.status}>
              {doctorInfo.serviceStatus == 1 ? (
                <View style={{ color: 'rgba(0,0,0,.4)' }}>休息中</View>
              ) : doctorInfo.serviceStatus == 2 ? (
                doctorInfo.currentGuestAliasId == this.state.userId ? (
                  <View style={{ color: 'rgba(0, 130, 85, .8)' }}>为我服务中</View>
                ) : (
                  <View style={{ color: '#CE8122' }}>服务中</View>
                )
              ) : (
                <View>可服务</View>
              )}
            </View>
            <View
              className={classNames({
                [styles.btn]: true,
                [styles.isShow]: true,
              })}
              onClick={() => {
                // 埋点: 点击聊愈师详情页立即聊愈
                KYTrack(
                  T_ConsultantDetailPageConsultClick({
                    consultant_id: this.props.counsellingId,
                    consultant_name: doctorInfo.userAliasCounsellingName,
                    consultant_state: doctorInfo.serviceStatus,
                  }),
                );
                // Taro.redirectTo({
                //   url: `/subCounselling/pages/chat/index?doctorId=${this.props.counsellingId}`,
                // });
                replaceTo(`/subCounselling/pages/chat/index?doctorId=${this.props.counsellingId}`);
              }}
            >
              {doctorInfo.serviceStatus == 1 ? '给Ta留言' : '立即咨询'}
            </View>
          </View>
        </View>
        <View className={styles.gerenjieshao}>
          <View className={classNames(styles.t1)} id="intro">
            个人介绍
          </View>
          <View className={styles.secondBlock}>
            <View className={styles.secondTitle}>
              <View className={styles.line}></View>
              <View className={styles.p}>我想对你说</View>
            </View>
            <View className={styles.cc}>
              <View
                className={classNames({
                  [styles.text]: true,
                  [styles.notAllText]: !this.state.isOpen['say'],
                })}
                style={
                  say
                    ? this.state.isOpen['say']
                      ? { height: this.height[2] + 'px' }
                      : { height: this.height[0] * 3 + 'px' }
                    : {}
                }
              >
                <View
                  className={classNames({
                    [styles.btn]: true,
                    [styles.showBtn]: say,
                    [styles.isOpen]: this.state.isOpen['say'],
                  })}
                  style={{ height: this.height[0] + 'px' }}
                  onClick={() => {
                    setTimeout(() => {
                      this.setState({
                        isOpen: { ...this.state.isOpen, say: !this.state.isOpen['say'] },
                      });
                    }, 10);
                  }}
                >
                  {this.state.isOpen['say'] ? '收起' : '展开'}
                </View>
                {doctorInfo.summary}
              </View>
            </View>
          </View>
          <View className={styles.secondBlock}>
            <View className={styles.secondTitle}>
              <View className={styles.line}></View>
              <View className={styles.p}>我擅长的</View>
              {/* <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/20230815_right_arr.png"
              /> */}
            </View>
            <View className={styles.cc}>
              <View
                className={classNames({
                  [styles.text]: true,
                  [styles.notAllText]: !this.state.isOpen['goodat'],
                })}
                style={
                  goodat
                    ? this.state.isOpen['goodat']
                      ? { height: this.height[3] + 'px' }
                      : { height: this.height[0] * 3 + 'px' }
                    : {}
                }
              >
                <View
                  className={classNames({
                    [styles.btn]: true,
                    [styles.showBtn]: goodat,
                    [styles.isOpen]: this.state.isOpen['goodat'],
                  })}
                  style={{ height: this.height[0] + 'px' }}
                  onClick={() => {
                    setTimeout(() => {
                      this.setState({
                        isOpen: { ...this.state.isOpen, goodat: !this.state.isOpen['goodat'] },
                      });
                    }, 10);
                  }}
                >
                  {this.state.isOpen['goodat'] ? '收起' : '展开'}
                </View>
                {doctorInfo.goodAt}
              </View>
            </View>
          </View>
          <View className={styles.secondBlock}>
            <View className={styles.secondTitle}>
              <View className={styles.line}></View>
              <View className={styles.p}>我的专业背景</View>
              {/* <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/20230815_right_arr.png"
              />*/}
            </View>
            <View className={styles.thirdTitle}>专业资质</View>
            <View className={styles.cc}>
              <View
                className={classNames({
                  [styles.text]: true,
                  [styles.notAllText]: !this.state.isOpen['pro'],
                })}
                style={
                  pro
                    ? this.state.isOpen['pro']
                      ? { height: this.height[4] + 'px' }
                      : { height: this.height[0] * 3 + 'px' }
                    : {}
                }
              >
                <View
                  className={classNames({
                    [styles.btn]: true,
                    [styles.showBtn]: pro,
                    [styles.isOpen]: this.state.isOpen['pro'],
                  })}
                  style={{ height: this.height[0] + 'px' }}
                  onClick={() => {
                    setTimeout(() => {
                      this.setState({
                        isOpen: { ...this.state.isOpen, pro: !this.state.isOpen['pro'] },
                      });
                    }, 10);
                  }}
                >
                  {this.state.isOpen['pro'] ? '收起' : '展开'}
                </View>
                {doctorInfo.major?.qualification}
              </View>
            </View>
            <View className={styles.thirdTitle}>学历背景</View>
            <View className={styles.cc}>
              <View
                className={classNames({
                  [styles.text]: true,
                  [styles.notAllText]: !this.state.isOpen['xueli'],
                })}
                style={
                  xueli
                    ? this.state.isOpen['xueli']
                      ? { height: this.height[5] + 'px' }
                      : { height: this.height[0] * 3 + 'px' }
                    : {}
                }
              >
                <View
                  className={classNames({
                    [styles.btn]: true,
                    [styles.showBtn]: xueli,
                    [styles.isOpen]: this.state.isOpen['xueli'],
                  })}
                  style={{ height: this.height[0] + 'px' }}
                  onClick={() => {
                    setTimeout(() => {
                      this.setState({
                        isOpen: { ...this.state.isOpen, xueli: !this.state.isOpen['xueli'] },
                      });
                    }, 10);
                  }}
                >
                  {this.state.isOpen['xueli'] ? '收起' : '展开'}
                </View>
                {doctorInfo.major?.education}
              </View>
            </View>
            <View className={styles.thirdTitle}>受训背景</View>
            <View className={styles.cc}>
              <View
                className={classNames({
                  [styles.text]: true,
                  [styles.notAllText]: !this.state.isOpen['shouxun'],
                })}
                style={
                  shouxun
                    ? this.state.isOpen['shouxun']
                      ? { height: this.height[6] + 'px' }
                      : { height: this.height[0] * 3 + 'px' }
                    : {}
                }
              >
                <View
                  className={classNames({
                    [styles.btn]: true,
                    [styles.showBtn]: shouxun,
                    [styles.isOpen]: this.state.isOpen['shouxun'],
                  })}
                  style={{ height: this.height[0] + 'px' }}
                  onClick={() => {
                    setTimeout(() => {
                      this.setState({
                        isOpen: { ...this.state.isOpen, shouxun: !this.state.isOpen['shouxun'] },
                      });
                    }, 10);
                  }}
                >
                  {this.state.isOpen['shouxun'] ? '收起' : '展开'}
                </View>
                {doctorInfo.major?.receiveTraining}
              </View>
            </View>
            <View className={styles.thirdTitle}>心理相关工作经历</View>
            <View className={styles.cc}>
              <View
                className={classNames({
                  [styles.text]: true,
                  [styles.notAllText]: !this.state.isOpen['work'],
                })}
                style={
                  work
                    ? this.state.isOpen['work']
                      ? { height: this.height[7] + 'px' }
                      : { height: this.height[0] * 3 + 'px' }
                    : {}
                }
              >
                <View
                  className={classNames({
                    [styles.btn]: true,
                    [styles.showBtn]: work,
                    [styles.isOpen]: this.state.isOpen['work'],
                  })}
                  style={{ height: this.height[0] + 'px' }}
                  onClick={() => {
                    setTimeout(() => {
                      this.setState({
                        isOpen: { ...this.state.isOpen, work: !this.state.isOpen['work'] },
                      });
                    }, 10);
                  }}
                >
                  {this.state.isOpen['work'] ? '收起' : '展开'}
                </View>
                {doctorInfo.major?.psychology}
              </View>
            </View>
          </View>
          <View className={styles.secondBlock}>
            <View className={styles.secondTitle}>
              <View className={styles.line}></View>
              <View className={styles.p}>我的服务Q&A</View>
              {/* <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/20230815_right_arr.png"
              /> */}
            </View>
            {doctorInfo.service?.map((item, index) => {
              return (
                <View className={styles.question} key={index + '_'}>
                  <View className={styles.questionTitle}>
                    <View className={styles.q}>Q</View>
                    <View className={styles.qtext}>{item.question}</View>
                  </View>
                  <View className={styles.text}>{item.answer}</View>
                </View>
              );
            })}
          </View>
        </View>
        <KYModal
          visiable={this.state.isShow}
          title={this.state.title}
          content={this.state.content}
          actions={this.state.actions}
          event={this.dialogEvent}
        ></KYModal>
      </KYPage>
    ) : null;
  }
}

export default Counselling;
