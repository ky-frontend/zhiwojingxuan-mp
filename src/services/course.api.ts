import type { GateWayType } from '@ky-frontend/common';
import {
  ChannelAdminApi,
  GetKyProductList,
  GetKyProductUserOrderList,
} from '@ky-middleground/channel-api';

class CourseApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /** 获取KY产品列表 */
  getKYproductList = async (params: { offset: number; limit: number; type?: string }) => {
    return await this.#gateway<GetKyProductList>({
      path: '/channel/getKyProductList',
      method: 'get',
      params,
      apiLevel: 'Anonym',
    });
  };

  /** 获取KY产品-用户订单列表 */
  getKyProductUserOrderList = async (params: { offset: number; limit: number; type?: string }) => {
    return await this.#gateway<GetKyProductUserOrderList>({
      path: '/channel/getKyProductUserOrderList',
      method: 'get',
      params,
      apiLevel: 'User',
    });
  };

  /** 获取KY产品详情 */
  getKYProductDetail = async (id: string) => {
    return await this.#gateway<ChannelAdminApi.GetKyProductDetails>({
      path: '/channel/admin/getKyProductDetails',
      method: 'get',
      params: {
        productId: id,
      },
      apiLevel: 'Anonym',
    });
  };
}

export default CourseApi;
