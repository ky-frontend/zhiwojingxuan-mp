import type { GateWayType } from '@ky-frontend/common';
import { WalletProductInfo, WalletUserBalance, WalletList } from '@ky-middleground/wallet-api';

class WalletApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 获取用户钱包余额
   * @returns
   */
  getUserBalance = async () => {
    return this.#gateway<WalletUserBalance>({
      path: '/wallet/user/balance',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };

  getWalletProductInfo = async () => {
    return this.#gateway<WalletProductInfo>({
      path: '/wallet/product/info',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };

  getWalletList = async (params: { offset: number; limit: number }) => {
    return this.#gateway<WalletList>({
      path: '/wallet/list',
      method: 'get',
      params,
      apiLevel: 'User',
    });
  };
}

export default WalletApi;
