import type { GateWayType } from '@ky-frontend/common';

import { CoachApi } from '@ky-client/consultant-api';
import { CoachType } from '@ky-client/consultant-type';

class CoachUserApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 获取疗愈师列表
   * @returns
   */
  getCoachDoctorList = async (
    params: {
      /** 困扰（标签 code 列表） */
      trouble?: string[];
      /** 服务周期 */
      appItemKey?: any;
      /** 服务类型 */
      serviceType?: CoachType.CoachServiceTypeEnum;
    } & CoachType.PaginationType,
  ) => {
    return await this.#gateway<CoachApi.GetCoachUserListAnonym>({
      path: '/consultant/coach/getCoachUserList',
      method: 'post',
      params,
      apiLevel: 'Anonym',
    });
  };

  /**
   * 获取教练信息
   */
  getCoachInfo = async (coachId: string) => {
    return await this.#gateway<CoachApi.GetCoachUserInfoAnonym>({
      path: '/consultant/coach/getCoachUserInfo',
      method: 'get',
      params: { coachId },
      apiLevel: 'Anonym',
    });
  };

  /**
   *获取商品详情
   */
  getProductInfo = async (productId: string) => {
    return await this.#gateway<CoachApi.GetProductInfo>({
      path: '/consultant/coach/getProductInfo',
      method: 'get',
      params: { productId },
      apiLevel: 'User',
    });
  };

  /**
   * 困扰标签列表-C端
   */
  getTroubleTagList = async () => {
    return await this.#gateway<CoachApi.GetTroubleTagListAnonym>({
      path: '/consultant/coach/getTroubleTagList',
      method: 'get',
      params: {} as any,
      apiLevel: 'Anonym',
    });
  };
}

export default CoachUserApi;
