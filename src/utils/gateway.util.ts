// import { SignUtil, DomainKey } from '@ky-infra/common';
import Taro from '@tarojs/taro';
import { KYLoading } from '@/components/KYLoading';
import { TOKEN_KEY } from '@/constants/values';
import { getEnvConfig } from '@/utils/util';
import { GateWayType, KYResponseType, OptionsType } from './gateway.util.types';
import { SignUtil } from './sign.util';

export class GatewayUtil {
  static #headers: Record<string, string>;

  static createGateway(options: OptionsType): GateWayType {
    options.headers['Content-Type'] = 'application/json;charset=utf-8';
    options.headers['x-timestamp'] = new Date().valueOf() + '';

    GatewayUtil.#headers = options.headers || {};

    const geteway = async <
      T,
      R = T[keyof T] extends { data: object } ? T[keyof T]['data'] : undefined,
    >(params: {
      path: keyof T;
      method: T[keyof T] extends { method: 'get' | 'post' | 'delete' | 'put' }
        ? T[keyof T]['method']
        : 'get';
      params: T[keyof T] extends { params: object } ? T[keyof T]['params'] : {};
      apiLevel?: T[keyof T] extends { apiLevel: 'None' | 'Anonym' | 'User' | 'Admin' }
        ? T[keyof T]['apiLevel']
        : 'None';
    }): Promise<KYResponseType<R>> => {
      // 每次请求按当前 ENV_CONFIG 取 baseURL，避免环境切换后仍打旧域名
      const baseURL = getEnvConfig().API_URL || options.baseURL;
      const url = baseURL + (params.path as string);

      GatewayUtil.#headers['x-sig'] = SignUtil.createSign(
        GatewayUtil.#headers,
        params.method == 'get' ? params.params : {},
      );
      if (options.interceptorsRequest) {
        options.interceptorsRequest();
      }

      const token = Taro.getStorageSync(TOKEN_KEY);
      params.apiLevel = params.apiLevel ? params.apiLevel : (options.defauleApiLevel as 'None');
      console.log('params.apiLevel22', params.path, params.apiLevel, 'baseURL', baseURL);
      /**
       * 未登录用户访问需要登录,直接拦截
       */
      if ((params.apiLevel === 'User' || params.apiLevel === 'Admin') && token == '') {
        options.loginLoseEffect && options.loginLoseEffect();
        return await {
          code: 2,
          data: null as R,
          message: '用户未登录',
          domain: '',
        };
      }
      // 将params.method变成全大写
      try {
        const resp = await Taro.request({
          url, //仅为示例，并非真实的接口地址
          data: params.params,
          header: Object.assign(GatewayUtil.#headers, { 'ky-token': token }),
          method: params.method.toUpperCase() as any,
        });
        /**
         * token失效
         */
        if (
          resp.data.domain === 'Base' &&
          (resp.data.code === 2 || resp.data.code === 3 || resp.data.code === 4)
        ) {
          KYLoading.hide();
          options.loginLoseEffect && options.loginLoseEffect();
        }
        if (options.interceptorsResponse) {
          options.interceptorsResponse(resp);
        }
        return resp.data;
      } catch (error) {
        console.log('err gateway', error);
        Taro.showToast({
          title: error || error.message || '网络错误',
          icon: 'none',
        });
        KYLoading.hide();
        console.log(JSON.stringify(error));
        return {
          code: -1,
          message: '网络错误',
          domain: '',
          data: null as R,
        };
      }
    };

    return geteway;
  }
}
