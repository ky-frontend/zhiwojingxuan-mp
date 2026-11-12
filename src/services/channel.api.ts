import type { GateWayType } from '@ky-frontend/common';
import { RedeemLyCard } from '@ky-middleground/channel-api/user.api';

class ChannelApi {
  #getway: GateWayType;

  constructor(gateway: GateWayType) {
    this.#getway = gateway;
  }

  /**
   * 疗愈优惠充时卡兑换
   * @param params
   * @returns
   */

  public getRedeemLyCard = async (code: string) => {
    return await this.#getway<RedeemLyCard>({
      path: '/channel/user/lyCardRedeem',
      params: { code },
      method: 'post',
      apiLevel: 'User',
    });
  };
}

export default ChannelApi;
