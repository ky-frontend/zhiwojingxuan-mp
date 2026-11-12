import type { GateWayType } from '@ky-frontend/common';
// import {
//   GetProtocolByProtocolId,
// } from '@ky-middleground/platform-api';

import { MarketingUserApi } from '@ky-middleground/marketing-api';

class MarketingApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 获取优惠券信息
   * @param couponCode
   * @returns
   */
  getCouponDetail = async (couponCode: string) => {
    return await this.#gateway<any>({
      path: '/marketing/user/getCouponDetail',
      method: 'get',
      params: {
        couponCode,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 领取优惠券
   * @param couponCode
   * @returns
   */
  receiveCoupon = async (info: { couponCode: string; countryCode: string; phone: string }) => {
    return await this.#gateway<any>({
      path: '/marketing/user/receiveCoupon',
      method: 'post',
      params: {
        couponCode: info.couponCode,
        countryCode: info.countryCode,
        phone: info.phone,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 兑换优惠券
   * @param exchangeCode
   * @returns
   */
  exchangeCode = async (exchangeCode: string) => {
    return await this.#gateway<any>({
      path: '/marketing/user/exchangeCoupon',
      method: 'post',
      params: {
        exchangeCode,
      },
      apiLevel: 'User',
    });
  };
  /**
   * 优惠券列表
   * @param offset
   * @param limit
   * @returns
   */
  getCouponList = async (offset: number, limit: number) => {
    return await this.#gateway<MarketingUserApi.GetUserCouponList>({
      path: '/marketing/user/getCouponList',
      params: { offset, limit },
      method: 'get',
      apiLevel: 'User',
    });
  };
  /**
   * 最大优惠
   */
  getMaxCoupon = async (appItemKey: string, productId: string) => {
    return await this.#gateway<MarketingUserApi.GetMaxCouponList>({
      method: 'get',
      params: { appItemKey, productId },
      path: '/marketing/user/getMaxCoupon',
      apiLevel: 'User',
    });
  };
  /**
   * 可用优惠券列表
   * @param appItemKey
   * @param productId
   * @returns
   */
  getAvailableCouponList = async (appItemKey?: string, productId?: string) => {
    return await this.#gateway<MarketingUserApi.GetAvailableCouponList>({
      path: '/marketing/user/getAvailableCouponList',
      params: {
        appItemKey,
        productId,
      },
      method: 'get',
      apiLevel: 'User',
    });
  };
  /**
   * 不可用优惠券列表
   * @param appItemKey
   * @param productId
   * @returns
   */
  getUnAvailableCouponList = async (appItemKey?: string, productId?: string) => {
    return await this.#gateway<MarketingUserApi.GetUnAvailableCouponList>({
      path: '/marketing/user/getUnAvailableCouponList',
      params: {
        appItemKey,
        productId,
      },
      method: 'get',
      apiLevel: 'User',
    });
  };
}

export default MarketingApi;
