import { CounsellingServiceCloseEnum } from '@ky-client/counselling-type';

/** 引用消息类型 */
export type QuoteMessageType = {
  type: QuoteMessageTypeEnum;
  content: QuoteMessageContent;
};

/** 引用消息type枚举 */
export enum QuoteMessageTypeEnum {
  unknown = -1,
  text = 0,
  image = 1,
  voice = 2,
}

/** 引用消息内容参数 */
export type QuoteMessageContent = {
  /** 引用人的 nickname */
  nickname: string;
  /** 应用的文本-message */
  message: string;
  /** 引用的语音-地址 */
  voice: string;
  /** 引用的语音-时长 */
  duration: number;
  /** 引用的图片-地址 */
  image: string;
};

/**
 * 自定义事件Id枚举
 * 石墨文档: https://shimo.im/sheets/ZzkLMXQgNeUEbPAQ/MODOC
 */
export enum CustomEventIdEnum {
  // 正在说话中
  talking = 701,
  // 正在输入中
  typing = 702,
  // 编辑备注
  editRemarkName = 703,
  // 用户当日免费消息已用完
  freeMessageUsedUp = 704,
  // 聊愈师设置下线了
  doctorOffLine = 705,

  // 即时文字服务开始
  ConsultInstantTextServiceFreeMessage = 61,

  // 即时文字服务开始
  chatServiceStarted = 62,
  // 购买单次通话
  callBuySuccess = 63,
  // 语音结束后评价推送
  callEndComment = 65,
  // 收到聊愈师赠送过期时长 收到聊愈师赠送过期时长
  callReceiveExpiredTime = 66,
  // 通话时长过期后
  callTimeExpired = 67,
  // 通话相关的 已取消/已拒绝/通话时长02:00
  callInfoStatus = 72,

  // 服务中3分钟了，聊愈师未回复
  notReplyInService3Minut = 68,

  // 用户加时支付成功
  consultAddTime = 53,
  // 服务中聊愈师关闭订单
  doctorClosed = 54,
  // 服务中用户关闭订单
  userClosed = 55,
  // 即时文字服务结束
  chatServiceEnd = 56,
  // 文字结束后评价推送
  chatEndComment = 57,
  // 通话接听来源
  callAnsweringSource = 49,
  // 在线超180分钟
  onlineTime180 = 1008,
  // 工作状态变更
  workStatusChange = 1013,
  leaveWork = 9000,

  // 拨打电话
  consultantCall3000 = 3000,
  // 用户接听电话
  consultantCall3001 = 3001,
  // 挂断
  consultantCall3002 = 3002,
  // 挂断电话
  consultantCall3003 = 3003,
  // 服务即将开始
  consultantCall3004 = 3004,

  consultantCall3005 = 3005,
  // 咨询师敏感词提示
  consultantSensitiveWordTip = 3008,

  // 提交订单未完成
  consultantCall3010 = 3010,
  // 提交订单完成
  consultantCall3011 = 3011,
  // 面对面咨询预约成功
  consultantCall3012 = 3012,

  // 有新的订单
  consultantNewConfirmOrder = 4006,

  /**
   * 本地自定义event事件
   */
  /** 剩余三分钟提示 */
  ingLeft3Minute = 100001,
}

export enum SourceEnum {
  Web = 'Web',
  App = 'App',
}

export enum CallInfoType {
  /** 未知 */
  unknown = 0,
  /** 无应答 */
  noAnswer = 1,
  /** 拒绝 */
  refuse = 2,
  /** 结束 */
  finish = 3,
  /** 取消 */
  cancel = 4,
}

/**
 * 自定义事件类型
 */
export type CustomEventType = {
  localType?: string;
  isWrite?: boolean;
  isTalking?: boolean;
  remarkDoctorId?: string;
  remarkUserId?: string;
  createTime?: Date;
  /** 加时结束时间 */
  endTime?: number;
  /** 加时的金额 */
  payment?: number;
  /** 加时的时长 */
  seconds?: number;
  /** 关闭订单的类型 */
  closeType?: CounsellingServiceCloseEnum;
  /** 推送评价的订单id */
  orderId?: string;
  /** 赠送了N条消息 */
  num?: number;
  /** 赠送过期时长-描述 */
  consultSeconds?: number;
  /** 赠送过期时长-有效时长3天 */
  validityTime?: number;
  /** 赠送过期时长-过期事件 */
  expireTime?: number;
  /** 通话时长过期，当前过期时长N */
  remainingCallDuration?: number;
  /** 购买通话 consultSeconds秒时长，剩余总时长balance */
  balance?: number;
  /** 通话相关的type 1无应答 2拒绝 3 结束 4取消 */
  type?: CallInfoType;
  /** 通话正常结束的时长 时间 */
  time?: number;
  /** 已评价-标签 */
  consultOrderCommentTags?: number[];
  /** 已评价的分数 */
  score?: number;
  /** 已评价的内容描述 */
  content?: string;
  /** 当前服务用户的ID，聊愈师端收到下单消息时用 */
  serviceUserAliasId?: string;
  /** 聊愈师昵称 */
  doctorNickName?: string;
  /** 聊愈师头像 */
  doctorAvatar?: string;
  /** 聊愈师id */
  doctorAliasId?: string;
  /** 下单提醒的昵称 */
  nickName?: string;
  /** 下单提醒的头像 */
  avatar?: string;
};

export enum ChatServiceType {
  NONE = 0,
  START = 1,
  END = 2,
}
