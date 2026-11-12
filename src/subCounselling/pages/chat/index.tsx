import Taro from '@tarojs/taro';
import { observer, inject } from 'mobx-react';
import { KYLoading } from '@/components/KYLoading';
import { UserAliasType } from '@ky-middleground/user-type';
import { MarketingBaseEnum } from '@ky-middleground/marketing-type';
import { CounselorIdentityEnum } from '@/types/common.type';
import TencentCloudChat from '@tencentcloud/chat';
import ImagePreview from '@/components/KYImagePreview';
import { px2rpx, px2rpxBig } from '@/modules/utils/tools';
import {
  T_PreTalkEnter,
  T_PreTalkMessage,
  T_ConsultantPreOrderButtonClick,
} from '@/modules/track/events';
import { KYTrack } from '@/modules/track';
import { CustomEventIdEnum, SourceEnum } from '@/types/im.type';
import {
  CounsellingDoctorChatInfoResponse,
  CounsellingDoctorServiceStatusEnum,
  CounsellingDoctorWorkStatusEnum,
  CounsellingItemKeyEnum,
  CounsellingProductType,
  CounsellingServiceCloseEnum,
  CounsellingServiceStatusEnum,
} from '@ky-client/counselling-type';
import { getCurrentFullRoute, navigateTo, replaceTo } from '@/utils/navigate';
import { AppItemKeyTypeEnum, AppKeyTypeEnum } from '@ky-frontend/common';
import { formatAmount } from '@/modules/utils/formatting.util';
import storage from '@/modules/utils/storage';
import { USER_INFO, USER_OPENID } from '@/constants/values';
import { checkLogin, gotoLogin } from '@/utils/identity';
import KYPopup from '@/components/KYPopup';
import classNames from 'classnames';
import KYNumber from '@/components/KYNumber';
import { detectDevice, formatPrice, getAvatarUrl } from '@/utils/util';
import { PaymentChannelType, PaymentModeType } from '@ky-client/exam-type';
import { counsellingApi, orderApi, paymentApi, walletApi } from '@/services';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { View, Image, Input, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.less';
import MsgItem from './components/MsgItem/index';

type ChatInfoType = CounsellingDoctorChatInfoResponse & {
  doctor: {
    /** 服务特色 */
    characteristic?: Array<string>;
    callActivity: any;
    chatActivity: any;
    workStatus: number;
  };
  user: {
    coupon: any;
    isPublish: boolean;
  };
};

type IStates = {
  chatInfoCode: number; // 聊天信息code,当code为238时,表示离职，不用多次获取聊天信息
  doctorId: string;
  statusBarHeight: number;
  chatInfo: ChatInfoType;
  scrollStyle: {
    height: string;
    width: string;
    paddingTop: string;
    paddingBottom: string;
  };
  isFirstRender: boolean;
  freeMsg: number;
  refresherTriggered: boolean;
  countdown: string;
  popupVisiable: boolean;
  jsList: CounsellingProductType[];
  curIndex: number;
  order: {
    orderMoney: number;
    paidMoney: number;
  };
  inputTipInfo: {
    tipText: string;
    btnText: string;
    btnContent: string;
    textStatus: number;
  };
  isServiceStatus: boolean;
  balance: number;
  paymentMethod: PaymentChannelType;
  preViewUrlInfo: {
    url: string;
    width: number;
    height: number;
  };
  KeyboardFixed: number;
  // 优惠充时卡余额
  storageCardBalance: number;
  showModal: boolean;
  // 禁聊
  disableChat: boolean;
  // 字数限制
  countText: number;
};

@inject('store')
@observer
class Index extends BaseKyComponent<{}, IStates> {
  state = {
    chatInfoCode: 0,
    doctorId: '',
    statusBarHeight: 0,
    chatInfo: null as any as ChatInfoType,
    scrollStyle: {
      height: '',
      width: '100%',
      paddingTop: '16px',
      paddingBottom: '0',
    },
    freeMsg: 5,
    inputTipInfo: {
      tipText: '',
      btnText: '',
      btnContent: '',
      textStatus: 0,
    },
    isServiceStatus: false,
    refresherTriggered: false,
    countdown: '',
    popupVisiable: false,
    isFirstRender: true,
    jsList: [],
    curIndex: 0,
    showModal: false,
    order: {
      orderMoney: 0,
      paidMoney: 0,
    },
    balance: 0,
    paymentMethod: 'WECHAT',
    preViewUrlInfo: {
      url: '',
      width: 0,
      height: 0,
    },
    KeyboardFixed: 0,
    storageCardBalance: 0,
    disableChat: false,
    countText: 48,
  };

  payLock = false;
  scrollViewRef: any = null;

  get consultantIndexStore() {
    return this.store.consultantIndexStore;
  }

  interval: any;
  inputRef: any;
  get imStore() {
    return this.store.imStore;
  }
  currentPath = getCurrentFullRoute();
  /**
   *
   * subConsultant/pages/index/index
   * doctorId=1703041740952286
   *  */
  async onLoad(res) {
    this.imStore.currentNextReqMessageID = '';
    this.imStore.messageList = [];
    if (res && res.doctorId) {
      const isLogin = await checkLogin();
      if (!isLogin) {
        gotoLogin(true);
        return;
      }

      // 检查 IM SDK 是否已初始化，如果未初始化则等待
      if (!this.imStore.chat || !this.imStore.sdkStateReady) {
        console.log('IM SDK 未就绪，等待初始化...');
        // 等待 SDK 就绪，最多等待 5 秒
        let waitCount = 0;
        const maxWait = 50; // 50 * 100ms = 5000ms
        while ((!this.imStore.chat || !this.imStore.sdkStateReady) && waitCount < maxWait) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          waitCount++;
        }
        if (!this.imStore.chat || !this.imStore.sdkStateReady) {
          Taro.showToast({
            title: 'IM 初始化失败，请重新登录',
            icon: 'none',
            duration: 2000,
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 2000);
          return;
        }
      }

      this.getUserBalance();
      this.setState({ doctorId: res.doctorId });
      this.doctorTriggerAutoReply(res.doctorId);
      await this.getChatInfo(res.doctorId);
      this.setTime();
      await this.imStore.getConversationProfile(res.doctorId);
      const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
      this.setState({
        statusBarHeight: sbh,
      });

      console.log('时间已注册');
      Taro.eventCenter.on('freeMessageFun', this.freeMessageFun.bind(this));
      if (res.content) {
        setTimeout(() => {
          this.sendMessage(decodeURIComponent(res.content));
        }, 1000);
      }
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
  async getUserBalance() {
    const res = await walletApi.getUserBalance();
    if (res.code === 0) {
      this.setState({
        balance: res.data.balance,
      });
    }
  }

  async init(doctorId: string) {
    this.imStore.currentNextReqMessageID = '';
    this.setState({ doctorId: doctorId });
    this.doctorTriggerAutoReply(doctorId);
    await this.getChatInfo(doctorId);
    await this.imStore.getConversationProfile(doctorId);
    const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
    this.setState({
      statusBarHeight: sbh,
      isFirstRender: false,
    });
  }
  setTime = () => {
    // 如果超过1.5秒还没有加载出来,重新请求
    const timer = setTimeout(async () => {
      if (this.state.chatInfo || this.state.chatInfoCode === 238) {
        clearTimeout(timer);
      } else {
        this.getChatInfo(this.state.doctorId);
      }
    }, 1500);
  };

  preView(url: string, width: number, height: number) {
    this.setState({
      preViewUrlInfo: {
        url,
        width,
        height,
      },
    });
  }

  /**
   * 查看是否开了即时咨询优惠充时卡,开了就查询余额
   */
  checkStorageCard = async () => {
    const res = await counsellingApi.checkHasOrder();
    if (res.code === 0) {
      if (res.data.hasOrder) {
        // 如果已经开卡，就获取余额
        const { code, data } = await counsellingApi.cardInfo();
        if (code === 0) {
          this.setState({ storageCardBalance: data.balanceMoney });
        }
      }
    }
  };

  getPrice = async (data: CounsellingProductType) => {
    KYLoading.show();
    const { data: order } = await orderApi.getOrderCalculate({
      items: [
        {
          skuCount: data.count,
          productDetail: {
            productId: data.productId,
            image: '',
            appItemKey: data.appItemKey,
            appName: data.appName || '',
            appKey: data.appKey || '',
          },
          skuPrice: data.money || 0,
          skuId: data.skuInfo.skuId,
          relationId: '0', // 聊愈师？
        },
      ],
      marketingPolicy: [],
    });

    KYLoading.hide();
    this.setState({
      order,
    });
  };

  orderCheck = async (info: { doctorId: string; appItemKey: CounsellingItemKeyEnum }) => {
    try {
      const res = await counsellingApi.OrderBeforeCreate(info);
      if (res.code === 0) {
        return res.data;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  componentDidUpdate(): void {
    if (this.imStore.isNeedFresh) {
      this.imStore.changeState();
      replaceTo(this.currentPath);
    }
  }

  freeMessageFun = async () => {
    const that = this;
    try {
      const res = await counsellingApi.freeMessage(this.state.doctorId);
      console.log('res', res);
      if (res.code === 0) {
        this.setState({ chatInfo: { ...this.state.chatInfo, freeMessage: res.data } }, () => {
          that.getTipText();
        });

        // 埋点: 知我心理聊愈对话页用户发送免费消息
        KYTrack(
          T_PreTalkMessage({
            consultant_id: this.state.doctorId,
            consultant_name: this.state.chatInfo.doctor.userAliasCounsellingData.nickName,
            consultant_tag: this.state.chatInfo.doctor.tag,
            consultant_state: this.state.chatInfo.doctor.doctorServiceStatus,
          }),
        );
      }
    } catch (error) {
      console.log('co', error);
    }
  };

  /**
   * 点击立即支付
   * @returns
   */
  onPay = async (orderId?: string) => {
    const { order, doctorId, curIndex, jsList, paymentMethod, storageCardBalance } = this.state;

    // 判断优惠充时卡余额
    if (paymentMethod === 'LYCARD' && storageCardBalance < order.paidMoney) {
      Taro.showToast({
        title: '余额不足，请切换其他支付方式',
        icon: 'none',
      });
      return;
    }

    const orderCheckStatus = await this.orderCheck({
      doctorId: doctorId,
      appItemKey: CounsellingItemKeyEnum.JSWZJS,
    });
    if (!orderCheckStatus) {
      return;
    }
    const data: CounsellingProductType = jsList[curIndex];
    console.log(data);
    if (!data) {
      Taro.showToast({ title: '该聊愈师还未配置加时咨询产品', icon: 'none' });
      return;
    }

    const paymentInfoArr = [
      {
        paymentChannel: paymentMethod as PaymentChannelType, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentMode: 'JSAPI' as PaymentModeType, // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: order.paidMoney,
      },
    ];

    const params = {
      /** 优惠券信息 */
      marketingPolicy: [],
      /** 订单来源 1购买 2赠送 */
      orderSource: '1',
      /** 商品信息*/
      items: [
        {
          productDetail: {
            appKey: data.appKey || '',
            appItemKey: data.appItemKey || '',
            appName: data.appName || '',
            productId: data.productId,
            image: '',
          },
          skuId: data.skuInfo.skuId,
          skuPrice: data.skuInfo.price || 0,
          skuCount: data.count || 0,
          /** 关联id */
          relationId: '0',
        },
      ],
      /** 支付信息*/
      paymentInfo: paymentInfoArr,
      extra: {
        doctorId: doctorId,
      },
      pid: this.state.chatInfo.counsellingService?.orderId,
    };
    // 支付按钮加锁
    if (this.payLock) return;
    this.payLock = true;

    if (orderId) {
      this.getPayInfo(orderId);
    } else {
      console.log(params);

      // 创建订单
      KYLoading.show();
      const res = await orderApi.createOrder(params);
      if (res.code === 0) {
        const { orderId: orderId2 } = res.data;
        this.getPayInfo(orderId2);
      } else {
        this.payLock = false;
        KYLoading.hide();
      }
    }
  };

  // reaction = reaction(
  //   () => this.imStore.serviceStatus,
  //   (serviceStatus) => {
  //     console.log('serviceStatus', serviceStatus);
  //     if (serviceStatus === ChatServiceType.START) {
  //       this.getChatInfo(this.state.doctorId);
  //     }
  //     if (serviceStatus === ChatServiceType.END) {
  //       this.getChatInfo(this.state.doctorId);
  //       this.imStore.serviceStatus = ChatServiceType.NONE;
  //     }
  //   },
  // );

  /**
   * 获取支付信息
   */
  getPayInfo = async (orderId: string) => {
    this.payLock = true;
    const payerChannelId = Taro.getStorageSync(USER_OPENID);
    const paymentInfoArr = [
      {
        paymentChannel: this.state.paymentMethod as PaymentChannelType, // 'WECHAT' | 'ALIPAY' | 'YUELIANGBI' | 'APPLE';;
        paymentMode: 'JSAPI' as PaymentModeType, // 'APP' | 'JSAPI' | 'H5' | 'NATIVE' | 'BALANCE'
        paidMoney: this.state.order.paidMoney,
      },
    ];

    const orderParams = {
      orderId,
      paymentInfo: paymentInfoArr,
      payerChannelId: payerChannelId, // openId,
    };
    KYLoading.show();
    const res = await paymentApi.createPayment(orderParams);
    KYLoading.hide();

    this.payLock = false;
    if (res.code === 0) {
      if (res.data && res.data.value && res.data.value === 'SUCCESS') {
        // setTimeout(() => {
        // Taro.redirectTo({
        //   url: `/subCounselling/pages/chat/index?doctorId=${this.state.doctorId}`,
        // });
        console.log('pay success 1111 ');

        // replaceTo(this.currentPath);
        // }, 2000);
        return;
      }

      const payInfo = res.data;
      Taro.requestPayment({
        timeStamp: payInfo.timeStamp, // 必填，生成签名的时间戳
        nonceStr: payInfo.nonceStr, // 必填，生成签名的随机串
        package: payInfo.package, // 必填，签名
        signType: payInfo.signType, // 必填，签名
        paySign: payInfo.paySign, // 必填，签名
        success: (res2) => {
          console.log('pay res', res2);
          // Taro.navigateTo({
          //   url: `/subCounselling/pages/chat/index?doctorId=${this.state.doctorId}`,
          // });
          // replaceTo(this.currentPath);
        },
        fail: (err) => {
          console.log('pay fail', err);
        },
      });
      console.log('res', res);
    }
  };
  getCountdown() {
    const that = this;
    const { chatInfo } = this.state;
    if (chatInfo.counsellingService && chatInfo.counsellingService.serviceEndTime > Date.now()) {
      this.interval = setInterval(() => {
        if ((chatInfo.counsellingService?.serviceEndTime || 0) <= Date.now()) {
          that.setState({
            countdown: '',
          });
          clearInterval(that.interval);
          setTimeout(() => {
            that.init(chatInfo.doctor.doctorId);
          }, 1000);
        } else {
          // 计算时间差（以毫秒为单位）
          const timeDifference = (chatInfo.counsellingService?.serviceEndTime || 0) - Date.now();

          // 将时间差转换为分钟和秒数
          const minutes = (Math.floor(timeDifference / 60000) + '').padStart(2, '0'); // 1 分钟 = 60000 毫秒
          const seconds = (Math.floor((timeDifference % 60000) / 1000) + '').padStart(2, '0'); // 1 秒 = 1000 毫秒
          if (minutes >= '00' && seconds >= '00') {
            if (minutes === '03' && seconds === '00') {
              this.imStore.setMessageList([
                ...this.imStore.messageList,
                {
                  type: TencentCloudChat.TYPES.MSG_CUSTOM,
                  payload: {
                    data: JSON.stringify({
                      eventId: CustomEventIdEnum.ingLeft3Minute,
                    }),
                  },
                  /** 添加时间 转换为s */
                  time: Date.now() / 1000,
                } as any,
              ]);
              this.imStore.scrollToBottom();
            }
            that.setState({
              countdown: `${minutes}:${seconds}`,
            });
          }
        }
      }, 1000);
    } else {
      if (this.interval) {
        clearInterval(this.interval);
      }
      // 结束服务，手动将服务结束
      this.setState({ isServiceStatus: false });
    }
  }

  getTipText() {
    const userInfo: UserAliasType = storage.getItem(USER_INFO);
    let tipText = '点击输入与聊愈师交流';
    let textStatus = 0;
    let btnText = '';
    let btnContent = '';
    const { chatInfo } = this.state;
    if (
      chatInfo.counsellingService?.serviceUserAliasId === userInfo.id &&
      chatInfo.counsellingService.serviceStatus === CounsellingServiceStatusEnum.IN_PROGRESS
    ) {
      this.setState({
        inputTipInfo: { tipText, textStatus, btnText, btnContent },
      });
      return;
    }
    if (chatInfo.doctor.userReport === 1) {
      tipText = '暂不可与该聊愈师沟通';
      textStatus = 1;
      btnContent = '暂不可与该聊愈师沟通';
      btnText = '知道了';
    }

    if (chatInfo.freeMessage) {
      const { doctorNum, doctorStatus, totalNum } = chatInfo.freeMessage;
      if (doctorNum <= 0) {
        if (doctorStatus === CounsellingDoctorServiceStatusEnum.idle) {
          tipText = '今日免费消息已用完，下单后开启畅聊';
          textStatus = 2;
          btnContent = '今日免费消息已用完 立即下单，开启畅聊';
          btnText = '立即咨询';
        } else {
          tipText = '今日免费消息已用完';
          textStatus = 3;
          btnContent = '今日免费消息已用完';
          btnText = '知道了';
        }
      }

      if (doctorNum > 0 && totalNum > 0) {
        const diffNumber = Math.min(doctorNum, totalNum);
        tipText = `今日免费消息剩${diffNumber}条，用于下单前沟通`;
        textStatus = 0;
        btnContent = '';
        btnText = '';
      }

      if (doctorNum > 0 && totalNum <= 0) {
        if (doctorStatus === CounsellingDoctorServiceStatusEnum.idle) {
          tipText = '今日免费消息已用完，下单后开启畅聊';
          textStatus = 5;
          btnContent = '今日免费消息已用完 立即下单，开启畅聊';
          btnText = '立即咨询';
        } else {
          tipText = '今日免费消息已用完';
          textStatus = 6;
          btnContent = '今日免费消息已用完';
          btnText = '知道了';
        }
      }
    }
    console.log('inputTipInfo', { tipText, textStatus, btnText, btnContent });
    this.setState({
      inputTipInfo: { tipText, textStatus, btnText, btnContent },
    });
  }

  componentDidMount() {
    console.log('res componentDidMount');
    const device = detectDevice();

    if (device === 'iOS') {
      // 监听键盘弹起事件
      Taro.getSystemInfo({
        success: (res) => {
          // 获取屏幕可见高度
          const windowHeight = res.windowHeight;
          console.log('获取屏幕可见高度1', windowHeight);
          Taro.onKeyboardHeightChange((res) => {
            console.log('键盘起来', res);
            // 键盘高度发生变化时，调整页面滚动位置以确保输入框可见
            if (res.height > 0) {
              this.setState({
                KeyboardFixed: 10,
                // scrollStyle: {...this.state.scrollStyle, paddingBottom: "336"}
              });
            } else {
              this.setState({
                KeyboardFixed: 0,
                // scrollStyle: {...this.state.scrollStyle, paddingBottom: "0"}
              });
            }
          });
        },
      });
    }
  }

  doctorTriggerAutoReply(doctorUserAliasId: string) {
    counsellingApi.doctorTriggerAutoReply(doctorUserAliasId);
  }

  async getChatInfo(doctorId: string) {
    const that = this;
    const userInfo = storage.getItem(USER_INFO);
    KYLoading.show();
    const res = await counsellingApi.getChatInfo({
      userAliasId: doctorId,
      orderId: '',
    });

    if (res.code === 238) {
      this.setState({ chatInfoCode: res.code });
      Taro.showToast({ title: res.message, icon: 'none' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 500);
      return;
    }

    const isServiceStatus =
      res.data.counsellingService &&
      res.data.counsellingService.serviceStatus === CounsellingServiceStatusEnum.IN_PROGRESS &&
      res.data.counsellingService.serviceEndTime > Date.now() &&
      res.data.counsellingService.serviceUserAliasId === userInfo.id
        ? true
        : false;

    this.setState(
      {
        chatInfo: {
          ...res.data,
          counsellingService: isServiceStatus ? res.data.counsellingService : ({} as any),
        } as any,
        freeMsg: res.data.freeMessage.doctorNum,
        isServiceStatus: isServiceStatus,
        countText: isServiceStatus ? 134 : 48, // 正在服务对象是自己 文字输入就可以输入140字 否则50字
      },
      () => {
        this.getCountdown();
        if (this.state.chatInfo.user.isPublish) {
          this.setState({ disableChat: true });
        } else {
          this.getTipText();
        }
        // 埋点: 知我心理进入聊愈对话页
        KYTrack(
          T_PreTalkEnter({
            consultant_id: this.state.doctorId,
            consultant_name: this.state.chatInfo?.doctor.userAliasCounsellingData.nickName,
            chat_room_id: this.state.chatInfo?.doctor.doctorId,
            consultant_state: (this.state.chatInfo?.doctor.doctorServiceStatus as any) || '',
          }),
        );
      },
    );
    let statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 0;
    let count = 0;
    while (count < 5 && statusBarHeight === 0) {
      count++;
      statusBarHeight = Taro.getSystemInfoSync().statusBarHeight || 0;
    }
    Taro.createSelectorQuery()
      .select('#userInfo')
      .fields(
        {
          dataset: true,
          size: true,
          scrollOffset: true,
          properties: ['scrollX', 'scrollY'],
        },
        function (uiRes) {
          if (res.data.doctor.workStatus === CounsellingDoctorWorkStatusEnum.leave) {
            that.setState({
              scrollStyle: {
                ...that.state.scrollStyle,
                height: `calc(100vh - env(safe-area-inset-bottom) - ${
                  uiRes.height + that.state.statusBarHeight
                }px)`,
              },
            });
          } else {
            that.setState({
              scrollStyle: {
                ...that.state.scrollStyle,
                height: `calc(100vh - env(safe-area-inset-bottom) - ${
                  uiRes.height + statusBarHeight + px2rpx(70 + (isServiceStatus ? 40 : 0))
                }px)`,
              },
            });
          }
        },
      )
      .exec();
    KYLoading.hide();
    if (res.code === 0) {
      // 获取加时列表的数据
      const jsList = res.data.doctor.product.filter((item) => item.appItemKey == 'jswzjs');
      this.setState({ jsList });
      if (jsList.length) {
        this.getPrice(jsList[0]);
      }
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
      Taro.navigateBack();
    }
  }

  /**
   * 选择支付方式
   * @param paymentMethod
   * @returns
   */
  onPaymentMethod = (channelType: PaymentChannelType) => {
    const { balance, paymentMethod, order } = this.state;
    if (channelType === paymentMethod) return;
    // 月亮币支付 & 余额不足
    if (channelType === 'YUELIANGBI' && balance < order.paidMoney) return;
    this.setState({
      paymentMethod: channelType,
    });
  };

  async onRefresherRefresh() {
    if (this.state.refresherTriggered) return;
    this.setState({
      refresherTriggered: true,
    });
    await this.imStore.getMessageList();
    setTimeout(() => {
      this.setState({
        refresherTriggered: false,
      });
    }, 100);
  }

  getServiceInfo() {
    let serviceText = '';
    const { chatInfo } = this.state;
    if (chatInfo.doctor.workStatus === CounsellingDoctorWorkStatusEnum.working) {
      if (chatInfo.doctor.doctorServiceStatus === CounsellingDoctorServiceStatusEnum.idle) {
        serviceText = '可服务';
      }
      if (chatInfo.doctor.doctorServiceStatus === CounsellingDoctorServiceStatusEnum.rest) {
        serviceText = '休息中';
      }
      if (chatInfo.doctor.doctorServiceStatus === CounsellingDoctorServiceStatusEnum.service) {
        serviceText = '服务中';
      }
    } else if (chatInfo.doctor.workStatus === CounsellingDoctorWorkStatusEnum.leave) {
      serviceText = '已离职';
    }
    return { serviceText };
  }

  handleServiceCount = (serviceCount = 0) => {
    if (serviceCount < 100) return '近100';
    // 大于等于100时，按100区间显示
    const divisor = Math.floor(serviceCount / 100) * 100;
    return `${divisor}+`;
  };

  /**
   * 计算折扣
   * @param type
   */
  getDisCount(type: 'Chat' | 'Call'): {
    disCountStr: string;
    price: number;
  } {
    const { doctor } = this.state.chatInfo;
    let disCountStr = '';
    let price = 0;
    if (type === 'Chat') {
      price = doctor.chatMinDot;
      if (doctor.chatActivity && doctor.chatActivity.discountActivity) {
        price = Number(formatAmount((price * doctor.chatActivity.discountActivity.discount) / 100));
        disCountStr = `${(doctor.chatActivity.discountActivity.discount / 10 + '').replace(
          '.',
          '',
        )}折`;
      } else {
        price = Number(formatAmount(price));
      }
    }
    if (type === 'Call') {
      price = doctor.callMinDot;
      if (doctor.callActivity && doctor.callActivity.discountActivity) {
        price = Number(formatAmount((price * doctor.callActivity.discountActivity.discount) / 100));
        disCountStr = `${(doctor.callActivity.discountActivity.discount / 10 + '').replace(
          '.',
          '',
        )}折`;
      } else {
        price = Number(formatAmount(price));
      }
    }
    return {
      disCountStr,
      price,
    };
  }

  /**
   * 获取优惠券
   * @param type
   */
  getCoupon(): any {
    const { user, doctor } = this.state.chatInfo;
    const hasChat = doctor.flag.includes(AppItemKeyTypeEnum.Jswzcs);
    const hasCall = doctor.flag.includes(AppItemKeyTypeEnum.Jsth);
    let chatCoupon = user.coupon?.jswzcs;
    let callCoupon = user.coupon?.jsth;
    let chatAmount = 0;
    if (chatCoupon && chatCoupon.userCouponId) {
      chatAmount = chatCoupon.amount;
    } else {
      chatCoupon = null;
    }
    let callAmount = 0;
    if (callCoupon && callCoupon.userCouponId) {
      callAmount = callCoupon.amount;
    } else {
      callCoupon = null;
    }

    if (hasChat && !hasCall) {
      return chatCoupon;
    }
    if (!hasChat && hasCall) {
      return callCoupon;
    }
    if (hasCall && hasChat) {
      if (chatAmount > callAmount) {
        return chatCoupon;
      } else {
        return callCoupon;
      }
    }
    return null;
  }

  getCouponStr() {
    let text = '';
    const couponInfo = this.getCoupon();

    if (couponInfo) {
      if (couponInfo.type === MarketingBaseEnum.CouponTypeEnum.FULL_REDUCTION) {
        text = `满${Number(formatAmount(couponInfo.threshold))}减${Number(
          formatAmount(couponInfo.amount),
        )}`;
      } else {
        text = `无门槛减${Number(formatAmount(couponInfo.amount))}`;
      }
    }

    return text;
  }
  close = async () => {
    if (
      this.state.chatInfo &&
      this.state.chatInfo.counsellingService &&
      this.state.chatInfo.counsellingService.serviceId
    ) {
      const closeRes = await counsellingApi.CounsellingServiceClose({
        serviceId: this.state.chatInfo.counsellingService.serviceId,
        closeType: CounsellingServiceCloseEnum.USER_CLOSE,
        appItemKey: this.state.chatInfo.counsellingService.appItemKey,
      });
      if (closeRes.code === 0) {
        Taro.showToast({
          title: '关闭成功',
          icon: 'none',
        });
        this.init(this.state.doctorId);
      }
    } else {
      Taro.showToast({
        title: '没有在进行中的服务',
        icon: 'none',
      });
    }
  };
  sendMessage = async (msg: string) => {
    const { chatInfo, isServiceStatus, inputTipInfo } = this.state;
    if (inputTipInfo.textStatus !== 0) {
      Taro.showToast({
        title: inputTipInfo.tipText,
        icon: 'none',
      });
      return;
    }
    const newMsg = this.imStore.createTextMsg({
      to: chatInfo.doctor.doctorId,
      text: msg,
      cloudCustomData: JSON.stringify({
        appKey: AppKeyTypeEnum.Ly,
        appItemKey: AppItemKeyTypeEnum.Jswzcs,
        orderId: isServiceStatus ? chatInfo.counsellingService?.orderId : '',
      }),
    });
    await this.imStore.sendMsg(newMsg, { insetMessage: true });

    if (!isServiceStatus) {
      const freeMsgInfoBack = chatInfo.freeMessage;
      freeMsgInfoBack.doctorNum = freeMsgInfoBack.doctorNum - 1;
      this.setState({
        chatInfo: { ...chatInfo, freeMessage: freeMsgInfoBack },
      });
      setTimeout(() => {
        this.freeMessageFun();
      }, 1500);
    }

    this.imStore.inputValue = '';
  };

  render() {
    const {
      chatInfo,
      scrollStyle,
      refresherTriggered,
      countdown,
      inputTipInfo,
      doctorId,
      isServiceStatus,
      balance,
      preViewUrlInfo,
      storageCardBalance,
      disableChat,
      countText,
    } = this.state;
    const balanceDisabled = balance < this.state.order.paidMoney;
    const userInfo = storage.getItem(USER_INFO);

    let callDisCount = {
      price: 0,
      disCountStr: '',
    };
    let chatDisCount = {
      price: 0,
      disCountStr: '',
    };
    if (chatInfo) {
      callDisCount = this.getDisCount('Call');
      chatDisCount = this.getDisCount('Chat');
    }

    return (
      <KYPage className={styles.counsellingChatPage}>
        {chatInfo ? (
          <KYNavigation showBack className={styles.navBg} />
        ) : (
          <KYNavigation showBack className={styles.navBg}></KYNavigation>
        )}
        {chatInfo ? (
          <View>
            {chatInfo.counsellingService?.serviceUserAliasId !== userInfo.id ? (
              <View className={styles.userInfo} id="userInfo">
                <View
                  className={styles.avatarBox}
                  onClick={() => {
                    if (chatInfo.doctor.workStatus === CounsellingDoctorWorkStatusEnum.working) {
                      // Taro.navigateTo({
                      //   url: `/subCommon/pages/userInfo/index?sence=${doctorId}&identity=${CounselorIdentityEnum.Counselling}`,
                      // });
                      navigateTo(`/subCommon/pages/userInfo/index`, {
                        sence: doctorId,
                        identity: CounselorIdentityEnum.Counselling,
                        userAliasId: chatInfo.doctor.userAliasId,
                      });
                    } else {
                      Taro.showToast({ title: '该聊愈师已离职', icon: 'none' });
                      return;
                    }
                  }}
                >
                  <Image
                    src={getAvatarUrl(chatInfo.doctor.userAliasCounsellingData.avatar)}
                    className={styles.avatar}
                  ></Image>
                </View>
                <View className={styles.nameBox}>
                  <Text className={styles.name}>
                    {chatInfo.doctor.userAliasCounsellingData.nickName}
                  </Text>
                  <View className={styles.drop}></View>
                  <Text
                    className={classNames({
                      [styles.serviceText]: true,
                      [styles.rest]:
                        chatInfo.doctor.doctorServiceStatus ===
                        CounsellingDoctorServiceStatusEnum.rest,
                      [styles.service]:
                        chatInfo.doctor.doctorServiceStatus ===
                        CounsellingDoctorServiceStatusEnum.service,
                      [styles.leave]:
                        chatInfo.doctor.workStatus === CounsellingDoctorWorkStatusEnum.leave,
                    })}
                  >
                    {this.getServiceInfo().serviceText}
                  </Text>
                </View>
                <View className={styles.tagText}>
                  {chatInfo.doctor.tag && chatInfo.doctor.tag.length ? (
                    <Text>{chatInfo.doctor.tag.map((val) => (val as any).title).join('/')} | </Text>
                  ) : null}
                  服务人次 ：{' '}
                  {this.handleServiceCount(chatInfo.doctor.chatCount + chatInfo.doctor.callCount)}
                </View>
                {chatInfo.doctor.characteristic && chatInfo.doctor.characteristic.length ? (
                  <View className={styles.tagDoctorBox}>
                    {chatInfo.doctor.characteristic.map((item) => {
                      return (
                        <Text key={item} className={styles.doctorTagItem}>
                          {item}
                        </Text>
                      );
                    })}
                  </View>
                ) : null}

                {chatInfo.doctor.product &&
                chatInfo.doctor.workStatus !== CounsellingDoctorWorkStatusEnum.leave ? (
                  <View className={styles.productBox}>
                    <View className={styles.priceBox}>
                      {chatInfo.doctor.flag.includes(AppItemKeyTypeEnum.Jswzcs) ? (
                        <View className={`${styles.price} ${styles.textPriceBox}`}>
                          <Text className={styles.classText}>对话</Text>
                          <Text className={styles.priceText}>¥{chatDisCount.price}</Text>
                          <Text className={styles.qi}>起</Text>
                          {chatDisCount.disCountStr ? (
                            <Text className={styles.discount}>{chatDisCount.disCountStr}</Text>
                          ) : null}
                        </View>
                      ) : null}
                      {chatInfo.doctor.flag.includes(AppItemKeyTypeEnum.Jsth) ? (
                        <View className={styles.price}>
                          <Text className={styles.classText}>通话</Text>
                          <Text className={styles.priceText}>¥{callDisCount.price}</Text>
                          <Text className={styles.qi}>起</Text>
                          {callDisCount.disCountStr ? (
                            <Text className={styles.discount}>{callDisCount.disCountStr}</Text>
                          ) : null}
                        </View>
                      ) : null}
                      {this.getCouponStr() ? (
                        <View className={styles.couponBox}>{this.getCouponStr()}</View>
                      ) : null}
                    </View>
                    <View
                      className={styles.buyBtn}
                      onClick={() => {
                        // 埋点: 预沟通页面立即聊愈按钮点击
                        KYTrack(
                          T_ConsultantPreOrderButtonClick({
                            consultant_id: this.state.doctorId,
                            consultant_name: chatInfo.doctor.userAliasCounsellingData.nickName,
                            consultant_tag: chatInfo.doctor.tag,
                            chat_room_id: '',
                            consultant_state: (chatInfo.doctor.workStatus as any) || '',
                          }),
                        );
                        // Taro.redirectTo({
                        //   url: `/subCounselling/pages/payPages/index?doctorId=${this.state.doctorId}`,
                        // });

                        replaceTo(`/subCounselling/pages/payPages/index`, {
                          doctorId: this.state.doctorId,
                        });
                      }}
                    >
                      购买咨询
                    </View>
                  </View>
                ) : null}
              </View>
            ) : (
              <View className={styles.serviceUserInfo} id="userInfo">
                <View className={styles.userBox}>
                  <Image
                    src={getAvatarUrl(chatInfo.doctor.userAliasCounsellingData.avatar)}
                    className={styles.avatar}
                    onClick={() => {
                      if (chatInfo.doctor.workStatus === CounsellingDoctorWorkStatusEnum.working) {
                        // Taro.navigateTo({
                        //   url: `/subCommon/pages/userInfo/index?sence=${doctorId}&identity=${CounselorIdentityEnum.Counselling}`,
                        // });
                        navigateTo(`/subCommon/pages/userInfo/index`, {
                          sence: doctorId,
                          identity: CounselorIdentityEnum.Counselling,
                          userAliasId: chatInfo.doctor.userAliasId,
                        });
                      } else {
                        Taro.showToast({ title: '该聊愈师已离职', icon: 'none' });
                      }
                    }}
                  ></Image>
                  <View className={styles.nameBox}>
                    <View className={styles.title}>
                      <Text className={styles.name}>
                        {chatInfo.doctor.userAliasCounsellingData.nickName}
                      </Text>
                      <View className={styles.drop}></View>
                      <View className={styles.serviceText}>
                        与你服务中
                        {/* <View
                          className={styles.end}
                          onClick={() => {
                            Taro.showModal({
                              title: '确认关闭服务？',
                              content:
                                '关闭后本次服务结束，未消耗时长金额按实付计算后原路退还（如已使用优惠券不予退回），每天最多可操作关闭服务3次',
                              showCancel: true,
                              cancelText: '取消',
                              confirmText: '确定关闭',
                              success: (res) => {
                                if (res.confirm) {
                                  this.close();
                                }
                              },
                            });
                          }}
                        >
                          结束
                        </View> */}
                      </View>
                    </View>
                    {countdown ? (
                      <View className={styles.box}>
                        <Text
                          className={classNames({
                            [styles.time]: true,
                            [styles.black]: parseInt(countdown.split(':')[0]) >= 10,
                            [styles.yellow]:
                              parseInt(countdown.split(':')[0]) < 10 &&
                              parseInt(countdown.split(':')[0]) >= 3,
                            [styles.red]: parseInt(countdown.split(':')[0]) < 3,
                          })}
                        >
                          {countdown}
                        </Text>
                        <View
                          className={styles.end}
                          onClick={() => {
                            Taro.showModal({
                              title: '确认关闭服务？',
                              content:
                                '关闭后本次服务结束，未消耗时长金额按实付计算后原路退还（如已使用优惠券不予退回），每天最多可操作关闭服务3次',
                              showCancel: true,
                              cancelText: '取消',
                              confirmText: '确定关闭',
                              success: (res) => {
                                if (res.confirm) {
                                  this.close();
                                }
                              },
                            });
                          }}
                        >
                          结束
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
                {chatInfo.doctor.flag.includes(AppItemKeyTypeEnum.Jswzjs) ? (
                  <View
                    className={styles.buyBtn}
                    onClick={() => {
                      this.setState({ popupVisiable: true });
                      // 掉接口
                      this.checkStorageCard();
                    }}
                  >
                    继续聊愈
                  </View>
                ) : null}
              </View>
            )}
            <View className={styles.msgBox}>
              <ScrollView
                ref={(ref) => {
                  this.scrollViewRef = ref;
                }}
                enhanced
                onScrollEnd={(res) => {
                  this.imStore.scrollTop = res.detail.scrollTop;
                }}
                className="scrollView"
                scrollY
                scrollWithAnimation
                refresherTriggered={refresherTriggered}
                scrollTop={this.imStore.scrollTop}
                refresherEnabled
                onRefresherRefresh={this.onRefresherRefresh.bind(this)}
                style={scrollStyle}
              >
                {!this.imStore.currentNextReqMessageID ? (
                  <View className={styles.chatTip}>
                    您可以在付款前与聊愈师预沟通服务时间或服务需求，关于具体服务的详情及规则点击
                    <Text
                      className={styles.link}
                      onClick={() => {
                        // Taro.navigateTo({
                        //   url: '/subCommon/pages/help/index?type=liaoyu',
                        // });

                        navigateTo(`/subCommon/pages/help/index`, {
                          type: 'liaoyu',
                        });
                      }}
                    >
                      《咨询服务使务使用须知》
                    </Text>
                    查看。
                  </View>
                ) : null}
                {this.imStore.messageList && this.imStore.messageList.length
                  ? this.imStore.messageList.map((msg, index) => {
                      const payloadData = JSON.parse(msg.payload?.data || '{}');
                      if (payloadData.eventId === CustomEventIdEnum.callAnsweringSource) {
                        if (payloadData.event.source === SourceEnum.Web) {
                          console.log(
                            '--------payloadData.event.source === SourceEnum.Web--------',
                          );
                          return;
                        }
                      }
                      let prevTime = 0;
                      let currTime = 0;
                      let time = '';
                      let timeEle: any = '';
                      if (index > 0) {
                        prevTime = this.imStore.messageList[index - 1].time;
                      }
                      currTime = msg.time;
                      time = this.imStore.handleItemTime(currTime, prevTime);
                      if (time) {
                        timeEle = <View className={styles.time}>{time}</View>;
                      }
                      if (!msg.avatar && msg.flow === 'in') {
                        msg.avatar = chatInfo.doctor.userAliasCounsellingData.avatar;
                      }
                      if (!msg.avatar && msg.flow === 'out') {
                        msg.avatar = chatInfo.user.userAliasCounsellingData.avatar;
                      }
                      return (
                        <View className={styles.msgItemBox} key={msg.ID}>
                          {timeEle}
                          <MsgItem
                            message={msg}
                            chatInfo={chatInfo}
                            initFun={this.init.bind(this)}
                            preViewFun={this.preView.bind(this)}
                            freeMessageFun={this.freeMessageFun.bind(this)}
                          />
                        </View>
                      );
                    })
                  : null}
                {chatInfo.doctor.workStatus === CounsellingDoctorWorkStatusEnum.leave ? (
                  <View className={styles.leaveBox}>
                    <View className={styles.leaveContent}>
                      该聊愈师已离职，您可选择其他聊愈师服务哦～
                    </View>
                  </View>
                ) : null}
              </ScrollView>
            </View>

            {chatInfo.doctor.workStatus !== CounsellingDoctorWorkStatusEnum.leave &&
              !disableChat && (
                <View
                  className={styles.inputText}
                  style={{ bottom: detectDevice() === 'iOS' ? this.state.KeyboardFixed : '10px' }}
                >
                  <Image
                    src="https://cdn-public.knowyourself.cc/icon/zxs/icon_input.png"
                    onClick={() => {
                      if (!isServiceStatus) {
                        Taro.showToast({
                          title: '不可以发送免费图片消息',
                          icon: 'none',
                        });
                        return;
                      }
                      Taro.chooseImage({
                        count: 1,
                        success: (res) => {
                          console.log('图片上传回来');
                          const newMsg = this.imStore.createImageMsg({
                            to: chatInfo.doctor.doctorId,
                            file: res,
                            cloudCustomData: JSON.stringify({
                              appKey: AppKeyTypeEnum.Ly,
                              appItemKey: AppItemKeyTypeEnum.Jswzcs,
                              orderId: chatInfo.counsellingService?.orderId,
                            }),
                          });
                          this.imStore.sendMsg(newMsg, { insetMessage: true });
                        },
                        fail: (res) => {
                          console.log('fail', res);
                        },
                      });
                    }}
                  />
                  <View
                    className={styles.inputBox}
                    onClick={() => {
                      if (inputTipInfo.textStatus !== 0) {
                        Taro.showModal({
                          content: inputTipInfo.btnContent,
                          showCancel: false,
                          confirmText: inputTipInfo.btnText,
                          success: () => {
                            if (inputTipInfo.btnText === '立即咨询') {
                              // Taro.redirectTo({
                              //   url: `/subCounselling/pages/payPages/index?doctorId=${doctorId}`,
                              // });
                              replaceTo(`/subCounselling/pages/payPages/index`, {
                                doctorId,
                              });
                            }
                          },
                        });
                      }
                    }}
                  >
                    <Input
                      placeholder={inputTipInfo.tipText}
                      adjustPosition
                      placeholderStyle={`font-size: ${px2rpxBig(14)}px;`}
                      confirmType="send"
                      confirmHold
                      cursorSpacing={detectDevice() === 'iOS' ? 200 : 10}
                      ref={(ref) => (this.inputRef = ref)}
                      disabled={
                        inputTipInfo.textStatus > 0 ||
                        chatInfo.doctor.workStatus === CounsellingDoctorWorkStatusEnum.leave
                      }
                      value={this.imStore.inputValue}
                      onInput={(res) => {
                        if (res.detail.value.length >= countText) {
                          Taro.showToast({ title: '文字输入已达上限~', icon: 'none' });
                          return;
                        }
                        this.imStore.inputValue = res.detail.value;
                      }}
                      onConfirm={(res) => {
                        if (inputTipInfo.textStatus !== 0) {
                          Taro.showToast({
                            title: inputTipInfo.btnText,
                            icon: 'none',
                          });
                          return;
                        }

                        const newMsg = this.imStore.createTextMsg({
                          to: chatInfo.doctor.doctorId,
                          text: res.detail.value,
                          cloudCustomData: JSON.stringify({
                            appKey: AppKeyTypeEnum.Ly,
                            appItemKey: AppItemKeyTypeEnum.Jswzcs,
                            orderId: isServiceStatus ? chatInfo.counsellingService?.orderId : '',
                          }),
                        });
                        this.imStore.sendMsg(newMsg, { insetMessage: true });

                        if (!isServiceStatus) {
                          const freMsgInfoBak = chatInfo.freeMessage;
                          freMsgInfoBak.doctorNum = freMsgInfoBak.doctorNum - 1;
                          this.setState({
                            chatInfo: { ...chatInfo, freeMessage: freMsgInfoBak },
                          });
                          setTimeout(() => {
                            this.freeMessageFun();
                          }, 1500);
                        }

                        this.imStore.inputValue = '';
                        console.log('this.inputRef+++++', this.inputRef);
                        // this.inputRef.focus();
                      }}
                    ></Input>
                  </View>
                  <Image
                    src="https://cdn-public.knowyourself.cc/icon/zxs/icon_phone.png"
                    onClick={() => {
                      // Taro.showToast({
                      //   title: '为保证通话质量，请前往知我心理APP使用',
                      //   icon: 'none',
                      // });
                      this.setState({
                        showModal: true,
                      });
                    }}
                  />
                </View>
              )}
          </View>
        ) : null}
        <View
          className={classNames(styles.confirmModal, { [styles.show]: this.state.popupVisiable })}
        >
          <View className={styles.popup}>
            <View className={styles.title}>
              选择增加时长
              <Image
                className={styles.img}
                onClick={() => {
                  this.setState({ popupVisiable: false });
                }}
                src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_chacha.png"
              />
            </View>
            <View className={styles.content1}>
              {this.state.jsList.map((item: CounsellingProductType, index) => {
                return (
                  <View
                    className={classNames({
                      [styles.item]: true,
                      [styles.itemAc]: index == this.state.curIndex,
                    })}
                    key={index}
                    onClick={() => {
                      this.setState({ curIndex: index });
                      this.getPrice(item);
                    }}
                  >
                    {item.productShowName}
                  </View>
                );
              })}
            </View>
            <View className={styles.title}>选择支付方式</View>
            <View className={styles.content1}>
              <View
                className={classNames(
                  styles.cell,
                  styles.title2,
                  this.state.paymentMethod === 'WECHAT' ? styles.payAc : '',
                )}
                onClick={this.onPaymentMethod.bind(this, 'WECHAT')}
              >
                <Image
                  className={styles.payIcon}
                  src="https://cdn-public.knowyourself.cc/icon/exam/wechat_pay_icon_20231107.png"
                />
                <View className={styles.payText}>微信支付</View>
              </View>
              <View
                className={classNames(
                  styles.cell,
                  styles.title2,
                  this.state.paymentMethod === 'YUELIANGBI' ? styles.payAc : '',
                )}
                onClick={this.onPaymentMethod.bind(this, 'YUELIANGBI')}
              >
                <Image
                  className={styles.payIcon}
                  src={
                    balanceDisabled
                      ? 'https://cdn-public.knowyourself.cc/icon/exam/yueliangbi_icon_20231129.png'
                      : 'https://cdn-public.knowyourself.cc/icon/exam/yueliangbi_icon_20231107.png'
                  }
                />
                <View
                  className={classNames(
                    styles.payText,
                    balanceDisabled ? styles.balanceDisabled : '',
                  )}
                >
                  月亮币支付
                  <View className={styles.walletText}>
                    余额：
                    <View style={{ color: '#000' }}>{formatPrice(balance)}</View>
                  </View>
                </View>
              </View>
              {/* 优惠充时卡支付 */}
              <View
                className={classNames(
                  styles.cell,
                  styles.title2,
                  this.state.paymentMethod === 'LYCARD' ? styles.payAc : '',
                )}
                onClick={this.onPaymentMethod.bind(this, 'LYCARD')}
              >
                <Image
                  className={styles.payIcon}
                  src="https://cdn-public.knowyourself.cc/icon/liaoyu/storageCardIcon@3x.png"
                />
                <View className={classNames(styles.payText)}>
                  即时咨询优惠充时卡
                  <View className={styles.walletText}>
                    余额：
                    <View style={{ color: '#000' }}>{formatPrice(storageCardBalance)}</View>
                  </View>
                </View>
              </View>
            </View>
            <View className={styles.bottom}>
              <View className={styles.left}>
                <View className={styles.text}>支付</View>
                <KYNumber type="Bold" className={styles.number}>
                  {formatPrice(this.state.order.paidMoney)}
                </KYNumber>
                <View style={{ color: 'black', lineHeight: '32px' }}>元</View>
              </View>
              <View
                className={styles.btn}
                onClick={() => {
                  this.onPay();
                }}
              >
                立即支付
              </View>
            </View>
          </View>
        </View>
        {preViewUrlInfo && preViewUrlInfo.url ? (
          <ImagePreview
            imageUrl={preViewUrlInfo.url}
            width={preViewUrlInfo.width}
            height={preViewUrlInfo.height}
            onClose={() => {
              this.setState({ preViewUrlInfo: null as any });
            }}
          />
        ) : null}

        <KYPopup
          visiable={this.state.showModal}
          type="CENTER"
          zIndex={9999}
          style={{ right: '58px', left: '58px' }}
        >
          <View className={styles.modal}>
            <View className={styles.p}>如果使用通话请下载【知我心理app】。下载方式：</View>
            <View className={styles.p}>
              1.打开KnowYourself公众号-底部【联系我们】-下载【知我心理APP】
            </View>
            <View className={styles.p}>
              2.打开手机应用商店（日常软件下载中心）-搜索并下载【知我心理APP】
            </View>
            <View className={styles.p}>如有疑问请在“我的”页面【联系客服】咨询</View>
          </View>
          <View
            className={styles.modalBtn}
            onClick={() => {
              this.setState({ showModal: false });
            }}
          >
            确定
          </View>
        </KYPopup>
      </KYPage>
    );
  }
}

export default Index;
