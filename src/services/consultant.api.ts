import type { GateWayType } from '@ky-frontend/common';
import { ChatInfo, ConsultantUserApi } from '@ky-client/consultant-api';
import { ConsultantBaseEnum } from '@ky-client/consultant-type';

class ConsultantApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 编辑咨询信息
   * @param params
   * @returns
   */

  editConsultationPersonal = async (params: any) => {
    return await this.#gateway<ConsultantUserApi.EditConsultationPersonalInfo>({
      path: '/consultant/editConsultationPersonalInfo',
      method: 'post',
      params: { info: params.info },
      apiLevel: 'User',
    });
  };

  getConsultationPersonal = async () => {
    return await this.#gateway<ConsultantUserApi.GetConsultationPersonalInfo>({
      path: '/consultant/getConsultationPersonalInfo',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };

  getConsultantUserClassify = async () => {
    return await this.#gateway<ConsultantUserApi.ConsultantUserClassify>({
      path: '/consultant/user/classify',
      method: 'get',
      params: {},
      apiLevel: 'None',
    });
  };

  /**
   * 获取咨询师列表
   * @returns
   */
  consultantList = async (params: {
    domainIds: string[];
    date: string[];
    timePeriodName: number[];
    prices: number;
    sex: 'male' | 'female';
    specialId: string[];
    offset: number;
    pageSize: number;
  }) => {
    return await this.#gateway<ConsultantUserApi.ConsultantList>({
      path: '/consultant/list',
      method: 'post',
      params,
      apiLevel: 'Anonym',
    });
  };

  /**
   * 获取咨询师个人主页信息
   * @returns
   */
  consultantIndex = async (counselorId: string) => {
    return await this.#gateway<ConsultantUserApi.ConsultantIndex>({
      path: '/consultant/index',
      method: 'get',
      params: {
        counselorId,
      },
      apiLevel: 'None',
    });
  };

  /**
   * 个人介绍
   * @returns
   */
  consultantIntroduction = async (counselorId: string) => {
    return await this.#gateway<ConsultantUserApi.ConsultantIntroduction>({
      path: '/consultant/introduction',
      method: 'get',
      params: {
        counselorId,
      },
      apiLevel: 'None',
    });
  };

  // 根据咨询师id, 获取产品Id
  getProductId = async (counselorId: string) => {
    return await this.#gateway<ConsultantUserApi.GetProductIdByCounselorId>({
      path: '/consultant/getProductId',
      method: 'get',
      params: { counselorId: counselorId },
      apiLevel: 'User',
    });
  };

  // 根据咨询师id，获取产品列表
  getProductList = async (counselorId: string) => {
    return await this.#gateway<ConsultantUserApi.GetProductListByCounselorId>({
      path: '/consultant/getProductList',
      method: 'get',
      params: {
        counselorId,
      },
    });
  };
  // 获取一个咨询师的2周安排
  getAvailableSchedule = async (counselorId: string) => {
    return await this.#gateway<ConsultantUserApi.ConsultantAvailableSchedule>({
      path: '/consultant/availableSchedule',
      method: 'get',
      params: { counselorId: counselorId },
      apiLevel: 'User',
    });
  };
  // 获取一个咨询师的2周安排V2
  getAvailableScheduleV2 = async (
    counselorId: string,
    consultationMethod: ConsultantBaseEnum.OrderTypeEnum,
  ) => {
    return await this.#gateway<ConsultantUserApi.ConsultantAvailableScheduleV2>({
      path: '/consultant/availableScheduleV2',
      method: 'get',
      params: {
        counselorId,
        consultationMethod,
      },
    });
  };

  // 获取咨询师一天下的 可用小时段
  getGetScheduleTime = async (date: string, week: string, counselorId: string) => {
    return await this.#gateway<ConsultantUserApi.ConsultantGetSchedule>({
      path: '/consultant/getSchedule',
      method: 'get',
      params: { date: date, week: week, counselorId: counselorId },
      apiLevel: 'User',
    });
  };

  // 获取咨询师一天下的 可用小时段V2
  getGetScheduleTimeV2 = async (
    date: string,
    week: string,
    counselorId: string,
    consultationMethod: ConsultantBaseEnum.OrderTypeEnum,
  ) => {
    return await this.#gateway<ConsultantUserApi.ConsultantGetScheduleV2>({
      path: '/consultant/getScheduleV2',
      method: 'get',
      params: { date: date, week: week, counselorId: counselorId, consultationMethod },
      apiLevel: 'User',
    });
  };

  /**
   * 对话页接口
   * @returns
   */
  chatInfo = async (params: { aliasId: string; type: 'user' | 'consultant' }) => {
    return await this.#gateway<ChatInfo>({
      path: '/consultant/chat/info',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };

  /**
   * 最近咨询信息
   */
  getConsultantTipBar = async () => {
    return await this.#gateway<ConsultantUserApi.ConsultantTipBar>({
      path: '/consultant/tipBar',
      method: 'get',
      params: {},
      apiLevel: 'Anonym',
    });
  };
  /**
   * 最近咨询信息V2
   */
  getConsultantTipBarV2 = async () => {
    return await this.#gateway<ConsultantUserApi.ConsultantTipBarV2>({
      path: '/consultant/tipBar/v2',
      method: 'get',
      params: {},
    });
  };

  // 获取咨询师产品信息
  getProductInfo = async (productId: string) => {
    return await this.#gateway<ConsultantUserApi.GetProductInfoByProductId>({
      path: '/consultant/getProductInfo',
      method: 'get',
      params: { productId: productId },
      apiLevel: 'User',
    });
  };

  /**
   * 校验订单是否可以下单
   */
  orderCheck = async (counselorId: string) => {
    return await this.#gateway<ConsultantUserApi.OrderCheck>({
      path: '/consultant/order/check',
      method: 'post',
      params: { counselorId },
      apiLevel: 'User',
    });
  };
  /**
   * 判断用户是否填写咨询信息
   */
  getExistConsultationPersonalInfo = async () => {
    return await this.#gateway<ConsultantUserApi.GetExistConsultationPersonalInfo>({
      path: '/consultant/getExistConsultationPersonalInfo',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };
  /**
   * 咨询师给用户发送的第一条信息的短信提醒
   * 当 type 为 to_user 时，from 为咨询师的 counselorId，to 为用户的 aliasId
   */
  sendFirstMessageRemind = async (from: string, to: string) => {
    return await this.#gateway<ConsultantUserApi.FirstMessageRemind>({
      path: '/consultant/firstMessageRemind',
      method: 'post',
      params: {
        from,
        to,
        type: 'to_consultant',
      },
    });
  };

  /**
   * 获取咨询师实习列表
   */
  getConsultantInternshipList = async () => {
    return await this.#gateway<ConsultantUserApi.ConsultantInternshipList>({
      path: '/consultant/internship/list',
      method: 'post',
      params: {},
    });
  };
}

export default ConsultantApi;
