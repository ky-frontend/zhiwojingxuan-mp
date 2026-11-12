import type { GateWayType } from '@ky-frontend/common';
import { AppKeyEnum } from '@ky-middleground/commodity-type';
import {
  OrderUserList,
  OrderUserInfo,
  OrderUserDelete,
  OrderCreate,
  GetOrderInfo,
  OrderCalculate,
} from '@ky-middleground/order-api';
import {
  PaginationType,
  OrderCreateRequestType,
  OrderCalculateRequestType,
} from '@ky-middleground/order-type';

class OrderApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 获取订单列表
   * @param params
   * @returns
   */
  public getOrderList = async (params: { appKey: AppKeyEnum; pagination: PaginationType }) => {
    return await this.#gateway<OrderUserList>({
      path: '/order/user/getList',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };

  /**
   * 获取用户订单详情
   * @param orderId
   * @returns
   */
  getUserOrderInfo = async (orderId: string) => {
    return await this.#gateway<OrderUserInfo>({
      path: '/order/user/getInfo',
      method: 'get',
      params: {
        orderId,
      },
      apiLevel: 'User',
    });
  };

  /**
   * 删除用户订单
   * @param orderId
   * @returns
   */
  deleteUserOrder = async (orderId: string) => {
    return await this.#gateway<OrderUserDelete>({
      path: '/order/user/delete',
      method: 'post',
      params: {
        orderId,
      },
      apiLevel: 'User',
    });
  };

  /**
   * 订单创建
   * @param orderId
   * @returns
   */
  createOrder = async (params: OrderCreateRequestType) => {
    return await this.#gateway<OrderCreate>({
      path: '/order/create',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };

  /**
   * 获取订单详情
   * @param orderId
   * @returns
   */
  getOrderInfo = async (orderId: string) => {
    return await this.#gateway<GetOrderInfo>({
      path: '/order/getInfo',
      method: 'get',
      params: {
        orderId,
      },
      apiLevel: 'User',
    });
  };
  /**
   * 订单计算接口
   */
  getOrderCalculate = async (params: OrderCalculateRequestType) => {
    return await this.#gateway<OrderCalculate>({
      params,
      method: 'post',
      path: '/order/calculate',
      apiLevel: 'User',
    });
  };
}

export default OrderApi;
