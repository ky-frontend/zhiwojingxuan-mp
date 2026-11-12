import type { AppItemKeyType, GateWayType } from '@ky-frontend/common';
import {
  CounsellingUserApi,
  CounsellingCommentListApi,
  CallRecordList,
  GetDoctorAutoReply,
  EditDoctorAutoReply,
  CounsellingIncomeListApi,
  CounsellingDoctorServiceListApi,
  CallClose,
  CallReply,
  CounsellingDoctorInfo,
  CounsellingChatInfo,
  GetDoctorCommonWord,
  CounsellingServiceClose,
  CardInfo,
  CardProductList,
  CardLogList,
  CardProductInfo,
} from '@ky-client/counselling-api';
import {
  AutoReplyType,
  CounsellingItemKeyEnum,
  CounsellingReportType,
  CounsellingDoctorServiceStatusEnum,
  CounsellingUserType,
  CounsellingServiceCloseEnum,
  PageType,
} from '@ky-client/counselling-type';

class CounsellingApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 获取用户退款详情
   * @param orderId
   * @returns
   */
  getUserRefundDetail = async (orderId: string) => {
    return await this.#gateway<any>({
      path: '/counselling/order/refund/detail',
      method: 'get',
      params: {
        orderId,
      },
      apiLevel: 'User',
    });
  };
  /**
   * 设置聊愈师状态
   */
  updateDoctorServiceStatus = async (serviceStatus: CounsellingDoctorServiceStatusEnum) => {
    return await this.#gateway<CounsellingUserApi.CounsellingDoctorUpdateStatusApi>({
      path: '/counselling/doctor/updateStatus',
      method: 'post',
      apiLevel: 'User',
      params: { serviceStatus },
    });
  };

  /**
   * 获取聊愈师订单列表
   * @returns
   */
  getDoctorOrderList = async (info: { sifts: string[]; offset: number; limit: number }) => {
    const { sifts, offset, limit } = info;
    return await this.#gateway<CounsellingCommentListApi>({
      path: '/counselling/doctor/orderList',
      method: 'post',
      params: {
        sifts,
        offset,
        limit,
      },
      apiLevel: 'User',
    });
  };

  public getServiceData = async () => {
    return await this.#gateway<any>({
      path: '/counselling/doctor/serviceData',
      method: 'get',
      apiLevel: 'User',
      params: {},
    });
  };

  public getDoctorOnlineList = async (time: string) => {
    return await this.#gateway<CounsellingUserApi.CounsellingDoctorOnlineLogListApi>({
      path: '/counselling/doctor/onlineLog',
      method: 'get',
      apiLevel: 'User',
      params: { time },
    });
  };

  getDoctorServerTimeList = async (params: {
    offset: number;
    limit: number;
    month: string;
    appItemKey: CounsellingItemKeyEnum.JSTH | CounsellingItemKeyEnum.JSWZCS;
  }) => {
    return await this.#gateway<CounsellingDoctorServiceListApi>({
      path: '/counselling/doctor/serviceList',
      method: 'get',
      apiLevel: 'User',
      params,
    });
  };
  /**
   * 获取聊愈师信息
   */
  getDoctorInfo = async (userAliasId: string) => {
    return await this.#gateway<CounsellingDoctorInfo>({
      path: '/counselling/doctor/info',
      method: 'get',
      // apiLevel: 'User',
      params: { userAliasId },
    });
  };

  /**
   * 聊愈师回执通话
   */
  callReply = async (callId: string) => {
    return await this.#gateway<CallReply>({
      path: '/counselling/call/reply',
      method: 'post',
      apiLevel: 'User',
      params: {
        callId,
      },
    });
  };

  /**
   * 挂断通话
   */
  callClose = async (callId: string) => {
    return await this.#gateway<CallClose>({
      path: '/counselling/call/close',
      method: 'post',
      apiLevel: 'User',
      params: {
        callId,
      },
    });
  };

  /**
   * 获取聊天会话信息
   */
  getChatInfo = async (params: { userAliasId: string; orderId: string }) => {
    return await this.#gateway<CounsellingChatInfo>({
      path: '/counselling/chatInfo',
      method: 'get',
      // apiLevel: 'User',
      params,
    });
  };

  /**
   * 获取聊愈师订单详情
   * @returns
   */
  getDoctorOrderDetail = async (info: { orderId: string }) => {
    return await this.#gateway<any>({
      path: '/counselling/doctor/orderDetail',
      method: 'get',
      params: {
        orderId: info.orderId,
      },
      apiLevel: 'User',
    });
  };

  /**
   * 查询服务是否被举报
   */
  checkServiceHaveReport = async (info: { serviceId: string; type: CounsellingReportType }) => {
    return await this.#gateway<CounsellingUserApi.CounsellingServiceHaveReportApi>({
      path: '/counselling/serviceHaveReport',
      method: 'get',
      params: {
        serviceId: info.serviceId,
        type: info.type,
      },
      apiLevel: 'User',
    });
  };

  /**
   * 获取通话记录
   */
  getCallRecordList = async (params: { userAliasId: string; doctorUserAliasId: string }) => {
    return await this.#gateway<CallRecordList>({
      path: '/counselling/callRecord/list',
      method: 'get',
      params,
      apiLevel: 'User',
    });
  };

  /**
   * 获取聊愈师自动回复
   */
  getDoctorAutoReply = async () => {
    return await this.#gateway<GetDoctorAutoReply>({
      path: '/counselling/getDoctorAutoReply',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };

  /**
   * 修改聊愈师自动回复
   */
  editDoctorAutoReply = async (autoReply: AutoReplyType) => {
    return await this.#gateway<EditDoctorAutoReply>({
      path: '/counselling/editDoctorAutoReply',
      method: 'post',
      params: {
        autoReply: autoReply,
      },
      apiLevel: 'User',
    });
  };
  /**
   * 聊愈师个人信息
   */
  getDoctorDetailsApi = async (doctorAliasId: string) => {
    return await this.#gateway<CounsellingUserApi.CounsellingGetDoctorDetailsApi>({
      path: '/counselling/doctor/details',
      method: 'get',
      params: { doctorAliasId },
      apiLevel: 'User',
    });
  };
  /**
   * 聊愈师个人信息
   */
  getDoctorDetailsApi2 = async (doctorAliasId: string) => {
    return await this.#gateway<CounsellingUserApi.CounsellingGetDoctorDetailsAnonymApi>({
      path: '/counselling/doctor/detailsAnonym',
      method: 'get',
      params: { doctorAliasId },
      apiLevel: 'Anonym',
    });
  };
  /**
   * 聊愈师收益中心
   */
  counsellingIncomeListApi = async (params: any) => {
    return await this.#gateway<CounsellingIncomeListApi>({
      path: '/counselling/doctor/incomeList',
      method: 'get',
      params: {
        month: params.month,
        offset: params.offset,
        limit: params.limit,
      },
      apiLevel: 'User',
    });
  };

  /**
   * 编辑聊愈师详情
   */
  counsellingEditDetailsApi = async (params: any) => {
    return await this.#gateway<any>({
      path: '/counselling/doctor/editDetails',
      method: 'post',
      params: params,
      apiLevel: 'User',
    });
  };

  /**
   * 获取标签分类（不包含营销分类）
   */
  counsellingGetClassifyListApi = async () => {
    return await this.#gateway<any>({
      path: '/counselling/getClassifyList',
      method: 'get',
      params: {},
      apiLevel: 'None',
    });
  };
  /**
   * 获取金刚位
   */
  getResourceSlotListApi = async () => {
    return await this.#gateway<CounsellingUserApi.GetResourceSlotList>({
      path: '/counselling/getResourceSlotList',
      method: 'get',
      params: {},
      apiLevel: 'Anonym',
    });
  };
  // 首页筛选的主题数据
  getZhutiList = async () => {
    return await this.#gateway<any>({
      path: '/counselling/getClassifyList',
      method: 'get',
      params: {},
      apiLevel: 'None',
    });
  };
  /**
   * 查询聊愈师在服务中的服务信息
   */
  getDoctorInService = async () => {
    return await this.#gateway<CounsellingUserApi.GetDoctorInService>({
      path: '/counselling/doctor/inService',
      method: 'get',
      apiLevel: 'User',
      params: {},
    });
  };

  getCommonWords = async () => {
    return await this.#gateway<GetDoctorCommonWord>({
      path: '/counselling/getDoctorCommonWord',
      method: 'get',
      params: {},
    });
  };

  /**
   * 获取疗愈师列表
   * @returns
   */
  counsellingDoctorList = async (params: CounsellingUserType.DoctorListRequestType) => {
    return await this.#gateway<CounsellingUserApi.CounsellingDoctorList>({
      path: '/counselling/doctor/list',
      method: 'post',
      params,
      apiLevel: 'None',
    });
  };

  /**
   * 疗愈师分类列表
   */
  counsellingDoctorClassifyList = async (
    params: CounsellingUserType.DoctorClassifyListRequestType,
  ) => {
    return await this.#gateway<CounsellingUserApi.CounsellingDoctorClassifyList>({
      path: '/counselling/doctor/classifyList',
      method: 'get',
      params,
      apiLevel: 'None',
    });
  };

  /**
   * 聊愈师上线提醒
   */
  CounsellingDoctorOnlineNotice = async (doctorAliasId: string) => {
    return await this.#gateway<CounsellingUserApi.CounsellingDoctorOnlineNoticeApi>({
      params: { doctorAliasId },
      method: 'post',
      path: '/counselling/doctor/onlineNotice',
      apiLevel: 'User',
    });
  };
  /**
   * 聊愈师自动回复
   */
  doctorTriggerAutoReply = async (doctorUserAliasId: string) => {
    return await this.#gateway<any>({
      params: { doctorUserAliasId },
      method: 'post',
      path: '/counselling/doctor/trigger/autoReply',
      apiLevel: 'User',
    });
  };
  /**
   * 聊愈师免费消息
   */
  freeMessage = async (doctorUserAliasId: string) => {
    return await this.#gateway<any>({
      params: { doctorUserAliasId },
      method: 'get',
      path: '/counselling/doctor/freeMessage',
      apiLevel: 'User',
    });
  };
  /**
   * c端订单创建前校验
   */
  OrderBeforeCreate = async (params: { doctorId: string; appItemKey: CounsellingItemKeyEnum }) => {
    return await this.#gateway<CounsellingUserApi.OrderBeforeCreate>({
      params,
      method: 'get',
      path: '/counselling/orderBeforeCreate',
      apiLevel: 'User',
    });
  };

  /**
   * 关闭服务
   */
  CounsellingServiceClose = async (params: {
    serviceId: string;
    closeType: CounsellingServiceCloseEnum;
    appItemKey: AppItemKeyType;
  }) => {
    return await this.#gateway<CounsellingServiceClose>({
      params,
      method: 'post',
      path: '/counselling/service/close',
      apiLevel: 'User',
    });
  };
  /**
   * 知我小程序 - 如果用户没有订单时，领取优惠券
   */
  receiveNoOrderCoupon = async () => {
    return await this.#gateway<CounsellingUserApi.ReceiveNoOrderCoupon>({
      path: '/counselling/receiveNoOrderCoupon',
      method: 'post',
      params: {},
    });
  };
  /**
   * 知我小程序 - 查询用户是否有订单
   */
  checkHasOrder = async () => {
    return await this.#gateway<CounsellingUserApi.CheckHasOrder>({
      path: '/counselling/checkHasOrder',
      method: 'get',
      params: {},
    });
  };
  /**
   * 用户储蓄卡余额
   */
  cardInfo = async () => {
    return await this.#gateway<CardInfo>({
      path: '/counselling/card/info',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };
  /**
   * 疗愈卡 - 充值产品列表
   */
  cardProductList = async () => {
    return await this.#gateway<CardProductList>({
      path: '/counselling/cardProduct/list',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };
  /**
   * 疗愈卡 - 优惠充时卡消费记录列表
   */
  cardLogList = async (params: PageType) => {
    return await this.#gateway<CardLogList>({
      path: '/counselling/cardLog/list',
      method: 'get',
      params,
      apiLevel: 'User',
    });
  };
  /**
   * 充值产品信息
   */
  cardProductInfo = async (productId: string) => {
    return await this.#gateway<CardProductInfo>({
      path: '/counselling/cardProduct/info',
      method: 'get',
      params: { productId },
      apiLevel: 'User',
    });
  };
}

export default CounsellingApi;
