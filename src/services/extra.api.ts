import type { GateWayType } from '@ky-frontend/common';
import { SpeechToText } from '@ky-middleground/extra-api';

class ExtraApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   * 通话转文本
   * @param audioUrl
   * @returns
   */
  SpeechToText = async (audioUrl: string) => {
    return await this.#gateway<SpeechToText>({
      path: '/extra/speechToText',
      method: 'post',
      params: { audioUrl },
      apiLevel: 'Anonym',
    });
  };
}

export default ExtraApi;
