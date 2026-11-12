import type { GateWayType } from '@ky-frontend/common';
import {
  GetCustomConfigByConfigId,
  GetProtocolByProtocolId,
  GetWeChatInfo,
  GetWeChatJsConfig,
  PlatformUserOssConfig,
  getResourceSpotContent,
  CreateAccessLogApi,
} from '@ky-middleground/platform-api';

class PlatformApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  platformUserOssConfig = async () => {
    return await this.#gateway<PlatformUserOssConfig>({
      path: '/platform/user/ossConfig',
      method: 'get',
      params: {},
      apiLevel: 'User',
    });
  };
  /**
   * 获取自定义配置根据configId
   */
  getCustomConfigByconfigId = async (configId: string) => {
    return await this.#gateway<GetCustomConfigByConfigId>({
      path: '/platform/getCustomConfigByconfigId',
      method: 'get',
      params: {
        configId,
      },
      apiLevel: 'Anonym',
    });
  };
  /**
   * 获取协议根据协议Id
   * @param protocolId
   * @returns
   * @memberof PlatformService
   */
  getProtocolByProtocolId = async (protocolId: string) => {
    return await this.#gateway<GetProtocolByProtocolId>({
      path: '/platform/getProtocolConfigByProtocolId',
      method: 'get',
      params: {
        protocolId,
      },
      apiLevel: 'Anonym',
    });
  };

  /**
   * 获取微信js config
   * @memberof PlatformService
   */
  GetWeChatJsConfig = async (params: { debug: boolean; jsApiList: string[]; url: string }) => {
    return await this.#gateway<GetWeChatJsConfig>({
      path: '/platform/getWeChatJsConfig',
      method: 'post',
      params,
    });
  };

  /**
   * 获取微信信息(openId)
   * @memberof PlatformService
   */
  GetWeChatInfo = async (token: string) => {
    return await this.#gateway<GetWeChatInfo>({
      path: '/platform/getWeChatInfo',
      method: 'get',
      params: { token },
    });
  };

  /**
   * 资源位 - 金刚位
   * @param resourceIds
   */
  getResourceSpotContent = async (resourceIds: string | string[]) => {
    return await this.#gateway<getResourceSpotContent>({
      path: '/platform/getResourceSpotContent',
      method: 'get',
      params: {
        resourceIds,
      },
    });
  };

  /**
   * 添加访问日志
   */
  createAccessLog = async (params: {
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  }) => {
    return await this.#gateway<CreateAccessLogApi>({
      path: '/platform/access/log',
      method: 'post',
      params,
      apiLevel: 'Anonym',
    });
  };
}

export default PlatformApi;
