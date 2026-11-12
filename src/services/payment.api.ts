import type { GateWayType } from '@ky-frontend/common';
import { DomainName } from '@ky-middleground/payment-api';
import { PaymentPayInputType } from '@ky-middleground/payment-type';

class PaymentApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  createPayment = async (params: PaymentPayInputType) => {
    return await this.#gateway<DomainName.Payment>({
      path: '/payment/create',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };
  createPaymentV2 = async (params: PaymentPayInputType) => {
    return await this.#gateway<any>({
      path: '/payment/quanminfu/xcx/create',
      method: 'post',
      params,
      apiLevel: 'User',
    });
  };
  quanminfuApp = async (params: any) => {
    return await this.#gateway<any>({
      path: '/payment/quanminfu/app/create',
      method: 'post',
      params,
      apiLevel: 'None',
    });
  };
}

export default PaymentApi;
