import { consultantApi, counsellingApi, userApi } from '@/services';
import { CustomEventIdEnum, ChatServiceType } from '@/types/im.type';
import { CounsellingUserInfoType } from '@ky-middleground/user-type';
import { CounsellingServiceType, CommonWordType } from '@ky-client/counselling-type';
import Taro from '@tarojs/taro';
import { action, makeObservable, observable, runInAction } from 'mobx';
import TencentCloudChat, { ChatSDK, Conversation, Message } from '@tencentcloud/chat';
import TIMUploadPlugin from 'tim-upload-plugin';
import React from 'react';
import storage from '@/modules/utils/storage';
import { USER_INFO } from '@/constants/values';
import { getEnvConfig } from '@/utils/util';
import { reLaunchTo } from '@/utils/navigate';

type ConversationType = Conversation & {
  inputValue?: string;
  userProfile: {
    // 备注
    remark?: string;
  };
};
export class ImStore {
  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
  }

  // 聊愈师端自定义消息ID
  customEventIdMap = new Map([
    [CustomEventIdEnum.typing, '正在输入中...'],
    [CustomEventIdEnum.talking, '正在讲话中...'],
    [CustomEventIdEnum.callAnsweringSource, '通话接听来源'],
    [CustomEventIdEnum.chatServiceStarted, '服务开始'],
    [CustomEventIdEnum.ConsultInstantTextServiceFreeMessage, '聊愈师给您赠送了3条免费消息'],
    [CustomEventIdEnum.chatServiceEnd, '服务结束'],
    [CustomEventIdEnum.callBuySuccess, '购买单次通话'],
    [CustomEventIdEnum.callReceiveExpiredTime, '收到聊愈师赠送过期时长'],
    [CustomEventIdEnum.callTimeExpired, '通话时长过期后'],
    [CustomEventIdEnum.callInfoStatus, '通话相关的 已取消/已拒绝/通话时长02:00'],
    [CustomEventIdEnum.notReplyInService3Minut, '服务中3分钟了，聊愈师未回复'],
    [
      CustomEventIdEnum.consultantSensitiveWordTip,
      '当前会话可能存在风险，请避免涉及转账/添加私人账号等风险行为，注意保护隐私和财产安全。',
    ],
    [CustomEventIdEnum.consultAddTime, '用户加时支付成功'],
    [CustomEventIdEnum.doctorClosed, '服务中聊愈师关闭订单'],
    [CustomEventIdEnum.userClosed, '服务中用户关闭订单'],
    [CustomEventIdEnum.freeMessageUsedUp, '用户当日免费消息已用完'],
    [CustomEventIdEnum.doctorOffLine, '聊愈师设置下线了'],
    [CustomEventIdEnum.editRemarkName, '编辑备注'],
    [CustomEventIdEnum.onlineTime180, '聊愈师即时对话连续在线180分钟'],
    [CustomEventIdEnum.workStatusChange, '聊愈师已离职'],
    [CustomEventIdEnum.consultantCall3000, '拨打电话'],
    [CustomEventIdEnum.consultantCall3001, '用户接听电话'],
    [CustomEventIdEnum.consultantCall3002, '挂断'],
    [CustomEventIdEnum.consultantCall3003, '挂断电话'],
    [CustomEventIdEnum.consultantCall3004, '咨询服务即将开始'],
    [CustomEventIdEnum.consultantCall3005, '咨询服务时间消息'],
    [CustomEventIdEnum.consultantCall3010, '提交订单未完成'],
    [CustomEventIdEnum.consultantCall3011, '提交订单完成'],
    [CustomEventIdEnum.consultantCall3012, '面对面咨询预约成功'],
    [CustomEventIdEnum.leaveWork, '离职'],
  ]);

  @observable options = {
    dev: {
      SDKAppID: 1400818915,
    },
    prod: {
      SDKAppID: 1400822648,
    },
  };
  @observable chat: ChatSDK;
  @observable chatBoxRef = React.createRef<HTMLDivElement>();
  /**消息列表 */
  @observable messageList: Message[] = [];
  @observable isNeedFresh = false;

  @observable listenMessageReceivedMap: any = {};

  /**当前会话 */
  @observable currentConversation: ConversationType = null as any;

  /**当前会话信息 */
  @observable currentChatInfo: any | null = null;

  /**当前服务时间 */
  @observable currentServiceTime = 0;
  @observable currentServiceTimeStr = '';

  @observable timer: NodeJS.Timeout | null = null;
  /**会话列表 */
  @observable conversationList: ConversationType[] = [];

  @observable textAreaRef = React.createRef<HTMLDivElement>();

  // userAliasId = '1690512922390753';
  // imSig =
  //   'eJw9jc0KgkAUhd9l1qH3Oo46QpsKlCGjSKKtOJPdwhKVCKN3b1Bpeb7z92H59ui8TMti5jnAFqMmbR49XWjEGEgQ6EnP4xJCwedMp*9F05BmMfoAEUYSxeT0VBtL-7WJmndDreUcEWwBYJ6hyn7c3Cupk1LdbpMlJfJDvfcLJbP0HAxJmutueAo3XK2rvFyy7w9ZjzIM';

  /** 引用消息数据 */
  @observable quoteMessage: (Message & { cloudCustomDataParse: any }) | null = null;

  /** 拉取消息的值 */
  @observable currentNextReqMessageID = '';
  /** 表示当前页面是否拉取完 */
  @observable isCompleted = false;

  /** 用户输入状态： 输入中/说话中 */
  @observable userInputStatusId = 0;

  /** 常用语弹窗 */
  @observable isCommonWordModal = false;
  /** 180分钟弹窗visible */
  @observable onlineTime180Modal = false;

  /** 聊愈师信息 */
  @observable doctorInfoData: any = null;

  doctorInServiceInfo: CounsellingServiceType | null = null;

  userInfoList: CounsellingUserInfoType[] = [];

  /** 输入框输入值 */
  @observable inputValue = '';

  @observable commonWords: CommonWordType[] = [];

  /** sdk加载状态 */
  @observable sdkStateReady = false;

  /** 加载滚动窗高度 */
  @observable scrollTop = 9999;

  /** 服务状态 */
  @observable serviceStatus: ChatServiceType = 0;

  @action
  async init(userInfo: { userID: string; userSig: string }) {
    // 如果已有实例，先销毁旧实例，避免多个实例同时监听消息
    if (this.chat) {
      console.log('IM SDK 已有实例，先销毁旧实例');
      try {
        await this.logout();
        await this.destroy();
      } catch (error) {
        console.log('销毁旧 IM 实例失败', error);
      }
      this.imDataInit();
      this.sdkStateReady = false;
    }

    // this.chat = TencentCloudChat.create(isDev === 'dev' ? this.options.dev : this.options.prod);
    // 仅测试用
    this.chat = TencentCloudChat.create({ SDKAppID: getEnvConfig().IM_SKD_ID });
    this.chat.setLogLevel(4);
    this.chat.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
    this.chat.on(TencentCloudChat.EVENT.SDK_READY, this.onSdkReady.bind(this));
    this.chat.on(TencentCloudChat.EVENT.SDK_NOT_READY, this.onSdkNotReady.bind(this));
    this.chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, this.onMessageReceived.bind(this));
    this.chat.on(TencentCloudChat.EVENT.MESSAGE_READ_BY_PEER, this.onMessageReadByPeer.bind(this));
    // this.chat.on(TencentCloudChat.EVENT.MESSAGE_READ_RECEIPT_RECEIVED, this.onMessageReadReceiptReceived);
    this.chat.on(
      TencentCloudChat.EVENT.CONVERSATION_LIST_UPDATED,
      this.onConversationListUpdated.bind(this),
    );
    this.chat.on(
      TencentCloudChat.EVENT.TOTAL_UNREAD_MESSAGE_COUNT_UPDATED,
      this.onTotalUnreadMessageCountUpdated.bind(this),
    );
    this.chat.on(TencentCloudChat.EVENT.KICKED_OUT, this.onKickedOut.bind(this));
    await this.login(userInfo);
  }

  /** SDK 进入 ready 状态时触发，接入侧监听此事件，然后可调用 SDK 发送消息等 API，使用 SDK 的各项功能。 */
  onSdkReady = function (event) {
    console.log('onSdkReady', event);
    this.sdkStateReady = true;
  };

  /** SDK 进入 not ready 状态时触发，此时接入侧将无法使用 SDK 发送消息等功能。如果想恢复使用，接入侧需调用 login 接口，驱动 SDK 进入 ready 状态。  */
  onSdkNotReady = function (event) {
    console.log('onSdkNotReady', event);
  };

  /**
   * 监听接收到的消息
   * @param eventId
   * @returns
   */
  listenMessageReceived(id: string, fn: (messageList: Message[]) => void) {
    this.listenMessageReceivedMap[id] = fn;
  }

  /** SDK 收到推送的单聊、群聊、群提示、群系统通知的新消息，接入侧可通过遍历 event.data 获取消息列表数据并渲染到页面。 */
  onMessageReceived = function (event) {
    // event.data - 存储 Message 对象的数组 - [Message]
    // console.log('onMessageReceived', event, this.listenMessageReceivedMap);
    // console.log('onMessageReceived-----', event, this.currentConversation.conversationID);

    // event.data - 存储 Message 对象的数组 - [Message]
    // console.log(
    //   '-----------onMessageReceived---------',
    //   event.data[0]?.payload,
    //   event.data,
    //   this.listenMessageReceivedMap,
    //   event
    // );
    console.log(this.listenMessageReceived);

    const messageList = event.data as Message[];
    const list: any[] = [];
    // 通知监听者
    Object.values(this.listenMessageReceivedMap).forEach((fn: any) => {
      fn(messageList);
    });

    console.log('messageList', messageList);
    messageList.forEach((message) => {
      if (message.type === TencentCloudChat.TYPES.MSG_CUSTOM) {
        const payloadData = JSON.parse(message.payload?.data || '{}');

        if (JSON.parse(message.payload?.data || '{}').eventId == CustomEventIdEnum.consultAddTime) {
          this.isNeedFresh = true;
        }
        if (this.customEventIdMap.get(payloadData.eventId) === undefined) {
          console.warn('-----未知事件-----', payloadData.eventId);
          // 未知事件不接收
          return;
        }

        switch (payloadData.eventId) {
          case CustomEventIdEnum.onlineTime180:
            if (this.onlineTime180Modal === false) {
              this.setOnlineTime180Modal(true);
              Taro.showModal({
                title: '连续在线提醒',
                content: '你已连续在线3小时，是否需要休息一下呀？',
                success: () => {
                  this.setOnlineTime180Modal(false);
                },
                fail: () => {
                  this.setOnlineTime180Modal(false);
                },
              });
            }
            return;
          case CustomEventIdEnum.typing:
          case CustomEventIdEnum.talking:
            // this.setUserInputStatusId(payloadData.eventId);
            return;
          case CustomEventIdEnum.consultAddTime:
            // 用户加时
            if (
              this.currentConversation?.userProfile.userID ===
              this.doctorInServiceInfo?.serviceUserAliasId
            ) {
              // 当前会话
              // this.getChatInfo();
            }
            break;
          case CustomEventIdEnum.chatServiceStarted:
            console.log('-----服务开始-----', payloadData.eventId);
            this.isNeedFresh = true;
            // 服务开始
            this.serviceStart(payloadData.event.serviceUserAliasId);
            break;
          case CustomEventIdEnum.doctorClosed:
          case CustomEventIdEnum.userClosed:
          case CustomEventIdEnum.chatServiceEnd:
            console.log('-----服务结束-----', payloadData);
            // 服务结束更新会话信息
            // this.serviceEnd();
            break;
          case CustomEventIdEnum.workStatusChange: // 工作状态变更
            Taro.clearStorageSync();
            // Taro.navigateTo({
            //   url: '/pages/login/index',
            // });
            reLaunchTo('/pages/login/index');
            break;
          case CustomEventIdEnum.leaveWork: // 工作状态变更
            Taro.clearStorageSync();
            // Taro.navigateTo({
            //   url: '/pages/login/index',
            // });

            reLaunchTo('/pages/login/index');
            break;
          case CustomEventIdEnum.ConsultInstantTextServiceFreeMessage: //
            setTimeout(() => {
              Taro.eventCenter.trigger('freeMessageFun');
            }, 100);
            break;
        }
      }
      console.log(
        'message.conversationID',
        message.conversationID === this.currentConversation.conversationID,
      );

      if (
        message.conversationID === this.currentConversation.conversationID &&
        message.ID != this.messageList[this.messageList.length - 1]?.ID
      ) {
        list.push(message);
      }
    });

    console.log('消息接收LIST', list);
    if (list.length) {
      // 接受到的消息插入到消息列表
      this.setMessageList([...this.messageList, ...list]);
      // 定位到最新消息位置
      this.scrollToBottom();
      if (Taro.getCurrentInstance().router?.path.includes('pages/chat/index')) {
        this.sendMessageReadReceipt(list);
        this.setC2CMessageRead(this.currentConversation.conversationID);
      }
    }
    if (Taro.getCurrentInstance().router?.path.includes('/pages/message/index')) {
      this.getConversationList();
    }
  };

  /**
   * SDK 收到对端已读消息的通知，消息接收方调用 setMessageRead 已读上报成功后消息发送方会收到此事件。
   * 接入侧可通过遍历 event.data 获取对端已读的消息列表数据并渲染到页面，如单聊会话内可将自己发送的消息由“未读”状态改为“已读”。
   * @param event
   */
  onMessageReadByPeer = function (event) {
    // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
    console.log('onMessageReadByPeer', event);

    const dataList = event.data as Message[];
    const isPeerReadIds: string[] = [];
    dataList.forEach((val) => {
      if (
        Taro.getCurrentInstance().router?.path.includes('/pages/chat/index') &&
        val.conversationID === this.currentConversation.conversationID
      ) {
        isPeerReadIds.push(val.ID);
      }
    });

    const messageList = this.messageList.map((item) => {
      if (isPeerReadIds.includes(item.ID)) {
        item.isPeerRead = true;
      }
      return item;
    });
    this.setMessageList(messageList);
  };

  /**
   * 会话列表更新，event.data 是包含 Conversation 对象的数组
   * @param event
   */
  onConversationListUpdated = function (event) {
    if (this.sdkStateReady) {
      this.conversationList = event.data;
    }
  };

  /**
   * 会话未读总数更新，event.data 是当前单聊和群聊会话的未读总数。
   * 1. 未读总数会减去设置为免打扰的会话的未读数。
   * 2. 未读总数不计算系统会话的未读数。
   */
  onTotalUnreadMessageCountUpdated = function (event: any) {
    console.log('onTotalUnreadMessageCountUpdated', event.data); // 当前单聊和群聊会话的未读总数
  };

  /**
   * 用户被踢下线时触发
   * @param event
   */
  onKickedOut = (event: any) => {
    console.log('----onKickedOut-----', event);
    // TencentCloudChat.TYPES.KICKED_OUT_MULT_ACCOUNT(Web端，同一账号，多页面登录被踢)
    // TencentCloudChat.TYPES.KICKED_OUT_MULT_DEVICE(同一账号，多端登录被踢)
    // TencentCloudChat.TYPES.KICKED_OUT_USERSIG_EXPIRED(签名过期)
    // TencentCloudChat.TYPES.KICKED_OUT_REST_API(REST API kick 接口踢出)
    Taro.showModal({
      title: '提示',
      content: '您的账号已在其他设备登录',
      success: () => {
        Taro.clearStorageSync();
        // Taro.navigateTo({
        //   url: '/pages/login/index',
        // });
        reLaunchTo('/pages/login/index');
      },
    });
    this.sdkStateReady = false;
    Taro.removeStorageSync(USER_INFO);
    Taro.removeStorageSync('TOKEN_KEY');
  };

  /** 销毁 SDK */
  async destroy() {
    try {
      await this.chat.destroy();
    } catch (error) {
      console.log('destroy error', error);
    }
  }
  changeState = () => {
    this.isNeedFresh = false;
  };

  /**
   * 登录
   * @param userInfo
   */
  async login(userInfo: { userID: string; userSig: string }) {
    try {
      const res = await this.chat.login(userInfo);
      if (res.data.repeatLogin === true) {
        // 标识账号已登录，本次登录操作为重复登录。
        console.log('账号重复登录：', res.data.errorInfo);
      }
    } catch (error) {
      console.log('login error', error);
    }
  }

  /**
   * 登出
   */
  async logout() {
    try {
      await this.chat.logout();
    } catch (error) {
      console.log('logout error', error);
    }
  }

  imDataInit() {
    this.conversationList = [];
    this.inputValue = '';
    this.messageList = [];
    this.currentConversation = null as any;
    this.currentNextReqMessageID = '';
    this.isCompleted = false;
  }

  /**
   * 查询聊愈师信息
   * @returns
   */
  getDoctorInfo = async () => {
    const userInfo = storage.getItem(USER_INFO);
    if (!userInfo?.id) return;
    const res = await counsellingApi.getDoctorInfo(userInfo.id);
    if (res.code === 0) {
      runInAction(() => {
        this.doctorInfoData = res.data;
      });
    } else {
      runInAction(() => {
        this.doctorInfoData = null;
      });
    }
  };

  /**
   * 查询用户信息列表
   * @returns
   */
  getUserInfoList = async (list: ConversationType[]) => {
    const userAliasIds = list.map((item) => item.userProfile.userID);
    const res = await userApi.getUserInfoList({
      userAliasIds,
    });
    if (res.code === 0) {
      runInAction(() => {
        this.userInfoList = res.data;
      });
    } else {
      runInAction(() => {
        this.userInfoList = [];
      });
    }
  };

  /**
   * 查询聊愈师正在与用户服务中的信息
   * @returns
   */
  getDoctorInService = async () => {
    const res = await counsellingApi.getDoctorInService();
    if (res.code === 0) {
      runInAction(() => {
        this.doctorInServiceInfo = res.data || null;
      });
    } else {
      runInAction(() => {
        this.doctorInServiceInfo = null;
      });
    }
  };

  /**
   * 创建文本消息
   * @param info.to 接受者Id
   * @param info.text 发送消息文本
   * @param info.needReadReceipt 如果您发消息需要已读回执，需购买旗舰版套餐，并且创建消息时将 needReadReceipt 设置为 true
   * @param info.cloudCustomData 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到）
   */
  createTextMsg(info: {
    to: string;
    text: string;
    needReadReceipt?: boolean;
    cloudCustomData?: string;
  }): Message {
    const message = this.chat.createTextMessage({
      to: info.to,
      conversationType: TencentCloudChat.TYPES.CONV_C2C,
      needReadReceipt: info.needReadReceipt === false ? false : true,
      payload: {
        text: info.text,
      },
      cloudCustomData: info.cloudCustomData || '',
    });
    return message;
  }

  // 服务开始
  serviceStart = async (serviceUserAliasId: string) => {
    if (
      this.currentConversation?.userProfile.userID === serviceUserAliasId &&
      Taro.getCurrentInstance().router?.path.includes('pages/chat/index')
    ) {
      // 当前会话
      if (Taro.getCurrentInstance().router?.path.includes('subCounselling/pages/chat/index')) {
        this.serviceStatus = ChatServiceType.START;
      }
    }
  };

  serviceEnd = async () => {
    this.serviceStatus = ChatServiceType.END;
  };

  /**
   * 创建image消息
   * @param info.to 接受者Id
   * @param info.file 发送消息图片
   * @param info.onProgress onProgressCallBack 上传回调
   * @param info.cloudCustomData 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到）
   */
  createImageMsg(info: {
    to: string;
    file: any;
    onProgress?: (event: any) => {};
    cloudCustomData?: string;
  }): Message {
    const message = this.chat.createImageMessage({
      to: info.to,
      conversationType: TencentCloudChat.TYPES.CONV_C2C,
      payload: {
        file: info.file,
      },
      cloudCustomData: info.cloudCustomData || '',
      onProgress: info.onProgress,
    });
    return message;
  }

  /**
   * 创建自定义消息
   * @param info.to 接受者Id
   * @param info.data 自定义消息内容
   */
  createCustomMsg(info: { to: string; data: any }): Message {
    const message = this.chat.createCustomMessage({
      to: info.to,
      conversationType: TencentCloudChat.TYPES.CONV_C2C,
      payload: {
        data: JSON.stringify(info.data),
      },
    });
    return message;
  }

  /**
   * 创建文本并发送消息
   * @param info.to 接受者消息
   * @param info.text 发送消息文本
   * @param info.needReadReceipt 如果您发消息需要已读回执，需购买旗舰版套餐，并且创建消息时将 needReadReceipt 设置为 true
   * @param info.cloudCustomData 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到）
   */
  async createTextAndSendMsg(info: {
    to: string;
    text: string;
    needReadReceipt?: boolean;
    cloudCustomData?: string;
  }): Promise<any> {
    try {
      const message = this.createTextMsg(info);
      const res = await this.chat.sendMessage(message);
      return res;
    } catch (error) {
      console.log('createAndSendMsg error', error);
    }
  }

  /**
   * 创建图片并发送消息
   * @param info.to 接受者Id
   * @param info.file 发送消息图片
   * @param info.onProgress onProgressCallBack 上传回调
   * @param info.cloudCustomData 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到）
   */
  async createImgAndSendMsg(info: {
    to: string;
    file: any;
    onProgress?: (event: any) => {};
    cloudCustomData?: string;
  }): Promise<any> {
    try {
      const message = this.createImageMsg(info);
      const res = await this.chat.sendMessage(message);
      return res;
    } catch (error) {
      console.log('createAndSendMsg error', error);
    }
  }

  async sendMsg(
    message: Message,
    info: {
      /** 是否插入消息列表 */
      insetMessage: boolean;
      /**
       * 消息是否仅发送给在线用户的标识，默认值为 false；设置为 true，则消息既不存漫游，也不会计入未读，
       * 也不会离线推送给接收方。适合用于发送广播通知等不重要的提示消息场景。在 AVChatRoom 发送消息不支持此选项
       */
      onlineUserOnly?: boolean;
      /**
       * true 消息不更新会话 unreadCount（消息存漫游），默认值 false
       */
      excludedFromUnreadCount?: boolean;
      /**
       * true 消息不更新会话 lastMessage（消息存漫游），默认值 false
       */
      excludedFromLastMessage?: boolean;
      /**
       * 消息是否不过内容审核（包含【本地审核】和【云端审核】）
       * 1. 只有在开通【本地审核】或【云端审核】功能后，excludedFromContentModeration 设置才有效
       * ，设置为 true，消息不过内容审核，设置为 falßse 消息过内容审核。
       */
      excludedFromContentModeration?: boolean;
    },
  ): Promise<any> {
    try {
      this.chat.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
      const res = await this.chat.sendMessage(message, {
        onlineUserOnly: info.onlineUserOnly || false,
        messageControlInfo: {
          excludedFromUnreadCount: info.excludedFromUnreadCount || false,
          excludedFromLastMessage: info.excludedFromLastMessage || false,
          excludedFromContentModeration: info.excludedFromContentModeration || false,
        },
      });
      if (info.insetMessage) {
        this.messageList = [...this.messageList, message];
        this.scrollToBottom();
      }
      return res;
    } catch (error) {
      console.log('sendMsg', error);
    }
  }

  /**
   * 跳转到底部
   */
  scrollToBottom() {
    setTimeout(() => {
      this.scrollTop = this.scrollTop + 9999;
    }, 200);
  }

  handleItemTime(currTime: number, prevTime: number): string {
    if (currTime <= 0) {
      return '';
    } else if (!prevTime || prevTime <= 0) {
      return this.calculateTimestamp(currTime * 1000);
    } else {
      const minDiffToShow = 10 * 60; //10min 10*60s
      const diff = currTime - prevTime; //s
      if (diff >= minDiffToShow) {
        return this.calculateTimestamp(currTime * 1000);
      }
    }
    return '';
  }

  // 计算时间戳函数
  // calculate timestamp
  calculateTimestamp(timestamp: number): string {
    const todayZero = new Date().setHours(0, 0, 0, 0);
    const thisYear = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
    const target = new Date(timestamp);

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    // const oneYear = 365 * oneDay;

    const diff = todayZero - target.getTime();

    function formatNum(num: number): string {
      return num < 10 ? '0' + num : num.toString();
    }
    if (diff <= 0) {
      // today, only display hour:minute
      return `${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
    } else if (diff <= oneDay) {
      // yesterday, display yesterday:hour:minute
      return `昨天 ${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
    } else if (diff <= oneWeek - oneDay) {
      // Within a week, display weekday hour:minute
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekday = weekdays[target.getDay()];
      return `${weekday} ${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
    } else if (target.getTime() >= thisYear) {
      // Over a week, within this year, display mouth/day hour:minute
      return `${target.getMonth() + 1}/${target.getDate()} ${formatNum(
        target.getHours(),
      )}:${formatNum(target.getMinutes())}`;
    } else {
      // Not within this year, display year/mouth/day hour:minute
      return `${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()} ${formatNum(
        target.getHours(),
      )}:${formatNum(target.getMinutes())}`;
    }
  }

  /**
   * 获取当前会话信息
   */
  getChatInfo = async () => {
    const res = await counsellingApi.getChatInfo({
      userAliasId: this.currentConversation.userProfile.userID,
      orderId: '',
    });
    if (res.code === 0) {
      runInAction(() => {
        this.currentChatInfo = res.data;
        const { serviceEndTime } = this.currentChatInfo.counsellingService;
        const currentTime = Date.now();
        if (serviceEndTime > currentTime) {
          this.currentServiceTime = serviceEndTime - currentTime;
          if (this.timer) {
            clearTimeout(this.timer);
          }
          this.countDownCurrentServiceTime();
        }
        const index = this.conversationList.findIndex(
          (item) => item.userProfile.userID === this.currentChatInfo.user.userAliasId,
        );
        if (index > -1) {
          const { remarkName } = this.currentChatInfo.user.userAliasCounsellingData;
          if (this.conversationList[index].userProfile.remark !== remarkName) {
            const newList = JSON.parse(JSON.stringify(this.conversationList));
            newList[index].userProfile.remark = remarkName;
            this.conversationList = newList;
            this.currentConversation.userProfile.remark = remarkName;
          }
        }
      });
    }
  };

  /**
   * 倒计时当前服务时间
   */
  countDownCurrentServiceTime() {
    if (this.currentServiceTime > 0) {
      if (this.currentServiceTimeStr === '') {
        if (this.currentServiceTime > 0) {
          const minutes = Math.floor(this.currentServiceTime / 1000 / 60);
          const seconds = Math.floor((this.currentServiceTime / 1000) % 60);
          this.currentServiceTimeStr = `${
            minutes < 10 ? '0' + minutes : minutes
          }:${seconds < 10 ? '0' + seconds : seconds}`;
        }
      }
      this.timer = setTimeout(() => {
        runInAction(() => {
          this.currentServiceTime -= 1000;
          if (this.currentServiceTime > 0) {
            const minutes = Math.floor(this.currentServiceTime / 1000 / 60);
            const seconds = Math.floor((this.currentServiceTime / 1000) % 60);
            this.currentServiceTimeStr = `${
              minutes < 10 ? '0' + minutes : minutes
            }:${seconds < 10 ? '0' + seconds : seconds}`;
          }
          this.countDownCurrentServiceTime();
        });
      }, 1000);
    } else {
      this.clearCountDown();
    }
  }

  /**
   * 清除倒计时
   */
  clearCountDown() {
    this.currentServiceTime = 0;
    this.currentServiceTimeStr = '';
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  /**
   * 设置引用消息
   */
  setQuoteMessage(quoteMessage: any) {
    if (quoteMessage) {
      let cloudCustomData = {};
      try {
        cloudCustomData = JSON.parse(quoteMessage.cloudCustomData);
      } catch {
        console.warn('----setQuoteMessage cloudCustomData----解析失败');
      }
      quoteMessage.cloudCustomDataParse = cloudCustomData;
    }
    this.quoteMessage = quoteMessage;
    this.textAreaRef.current?.focus();
  }

  setCurrentNextReqMessageID(nextReqMessageID = '') {
    this.currentNextReqMessageID = nextReqMessageID;
  }

  setIsCompleted(isCompleted = false) {
    this.isCompleted = isCompleted;
  }

  async setMessageList(messageList: Message[] = []) {
    this.messageList = messageList;
  }

  setOnlineTime180Modal(visible: boolean) {
    this.onlineTime180Modal = visible;
  }

  /**
   * 发送消息已读回执
   * @param userId
   */
  async sendMessageReadReceipt(messageList: Message[]): Promise<any> {
    try {
      const res = await this.chat.sendMessageReadReceipt(messageList);
      return res;
    } catch (error) {
      console.log('sendMessageReadReceipt', error);
    }
  }

  /**
   * 获取会话列表
   */
  async getConversationList(): Promise<Conversation[]> {
    try {
      const res = await this.chat.getConversationList();
      if (res.code === 0) {
        const conversationList = res.data.conversationList;
        this.conversationList = conversationList.filter(
          (item) => !item.markList.includes(Math.pow(2, 37)),
        );
        console.log('会话列表', this.conversationList);
      }
    } catch (error) {
      console.log('获取会话列表 error', error);
    }
    return [];
  }

  /**
   * 获取会话资料的接口
   * @param userId
   */
  async getConversationProfile(userAliasId: string): Promise<any> {
    try {
      const res = await this.chat.getConversationProfile(`C2C${userAliasId}`);
      if (res.code === 0 && res.data && res.data.conversation) {
        this.currentConversation = res.data.conversation;
        // 清除输入信息
        this.inputValue = '';
        await this.getMessageList();
        this.scrollToBottom();
      }
    } catch (error) {
      console.log('sendMessageReadReceipt', error);
    }
  }

  /**
   * userId 用户Id
   * 用于分页续拉的消息 ID。第一次拉取时不要传入 nextReqMessageID，续拉时填入上次调用 getMessageList 接口返回的该字段的值
   * @param nextReqMessageID
   */
  async getMessageList(): Promise<any> {
    console.log('this', this.isCompleted);
    if (this.isCompleted && this.messageList.length && !this.currentNextReqMessageID) {
      Taro.showToast({
        title: '已经加载完全部聊天记录',
        icon: 'none',
        duration: 2000,
      });
      return true;
    }
    if (!this.currentConversation?.conversationID) return;
    let messageList: Message[] = [];
    const body: any = {
      conversationID: this.currentConversation.conversationID,
    };
    if (this.currentNextReqMessageID) {
      messageList = [...this.messageList];
      body.nextReqMessageID = this.currentNextReqMessageID;
    }
    try {
      const res = await this.chat.getMessageList({
        ...body,
      });
      if (res.code === 0) {
        console.log('res', res);
        this.setCurrentNextReqMessageID(res.data.nextReqMessageID);
        this.setIsCompleted(res.data.isCompleted);
        const list = res.data.messageList.filter((item: any) => {
          console.log(item.type === TencentCloudChat.TYPES.MSG_CUSTOM);

          if (item.type === TencentCloudChat.TYPES.MSG_CUSTOM) {
            const payloadData = JSON.parse(item.payload?.data || '{}');
            return this.customEventIdMap.get(payloadData.eventId) !== undefined;
          }
          return true;
        });
        messageList = [...list, ...messageList];
      }
      console.log('ms', messageList);
      this.setMessageList(messageList);
      const needReadReceiptList = messageList.filter((val) => {
        return val.needReadReceipt && !val.isPeerRead;
      });
      console.log('--------needReadReceiptList--------', needReadReceiptList);
      if (needReadReceiptList.length) {
        this.sendMessageReadReceipt(needReadReceiptList);
      }
      // 清空未读消息数量
      this.setC2CMessageRead(this.currentConversation.conversationID);
      return res;
    } catch (error) {
      console.log('getMessageList error', error);
    }
  }

  /**
   * 清空会话未读消息数
   * c2c
   */
  async setC2CMessageRead(conversationID: string): Promise<any> {
    try {
      const res = await this.chat.setMessageRead({
        conversationID: conversationID,
      });
      return res;
    } catch (error) {
      console.log('setC2CMessageRead', error);
    }
  }

  /**
   * 初始化聊天会话信息
   * 在每次进入新的咨询会话前调用，清空当前会话状态
   */
  initChatInfo() {
    this.setMessageList([]);
    this.setIsCompleted(false);
    this.currentNextReqMessageID = '';
    this.currentConversation = null as any;
    this.scrollTop = 9999;
    this.clearCountDown();
    this.inputValue = '';
    this.quoteMessage = null;
    this.serviceStatus = 0;
    this.userInputStatusId = 0;
  }
}

export type IImStore = ImStore;
