import type { GateWayType } from '@ky-frontend/common';
import {
  GetCountryCodeList,
  SendMobileCodeLogin,
  LoginByMobile,
  GetUserAliasInfo,
  GetUserAliasInfoAnonym,
  XCXQuickLoginByCode,
  XCXLoginByPhoneCode,
  UpdateUserAlertStatus,
  UpdateBalanceSyncStatus,
  GetWxJsConfig,
  SwitchAliasInfo,
  GetCounsellingUserInfoList,
  BatchGetDoctorAndConsultantInfo,
  SendMobileCodeWechatLogin,
  UserLoginMobileWeChat,
  GetAliasList,
  GetStaffGroupList,
  GetStaffListByTagId,
} from '@ky-middleground/user-api';
import { GetMobileCodeRequest, LoginMobileWeChatRequest } from '@ky-middleground/user-type';

class UserApi {
  #gateway: GateWayType;
  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  public getCountryCodeList = async () => {
    return await this.#gateway<GetCountryCodeList>({
      path: '/user/getCountryCodeList',
      method: 'get',
      params: {},
      apiLevel: 'Anonym',
    });
  };
  // 获取登录验证码
  public sendMobileCodeLogin = async (mobile: string, countryCode: string) => {
    return await this.#gateway<SendMobileCodeLogin>({
      path: '/user/sendMobileCodeLogin',
      method: 'post',
      params: {
        mobile,
        countryCode,
      },
      apiLevel: 'None',
    });
  };
  // 通过手机验证码快速登录
  public loginByMobile = async (mobile: string, countryCode: string, code: string) => {
    return await this.#gateway<LoginByMobile>({
      path: '/user/loginMobile',
      method: 'post',
      params: {
        mobile,
        countryCode,
        code,
      },
      apiLevel: 'None',
    });
  };

  /**
   * 获取用户分身信息
   * @param userAliasId
   * @returns
   */
  getUserAliasInfo = async (userAliasId?: string) => {
    const params = userAliasId ? { userAliasId } : {};
    return await this.#gateway<GetUserAliasInfo>({
      path: '/user/getUserAliasInfo',
      method: 'get',
      params,
      apiLevel: 'User',
    });
  };
  /**
   * 获取用户分身信息 - 无权限
   * @param userAliasId
   * @returns
   */
  getUserAliasInfo2 = async (userAliasId?: string) => {
    const params = userAliasId ? { userAliasId } : { userAliasId: '' };
    return await this.#gateway<GetUserAliasInfoAnonym>({
      path: '/user/getUserAliasInfoAnonym',
      method: 'get',
      params,
      apiLevel: 'Anonym',
    });
  };
  /**
   * 微信小程序快速登录
   */
  public xcxQuickLoginByCode = async (code: string) => {
    return await this.#gateway<XCXQuickLoginByCode>({
      path: '/user/xcxQuickLoginByCode',
      method: 'post',
      params: {
        code,
      },
      apiLevel: 'Anonym',
    });
  };
  /**
   * 微信的手机号登录
   */
  public xcxLoginByPhoneCode = async (params: {
    code: string;
    openId: string;
    unionid: string;
    session_key: string;
  }) => {
    return await this.#gateway<XCXLoginByPhoneCode>({
      path: '/user/xcxLoginByPhoneCode',
      method: 'post',
      params,
      apiLevel: 'Anonym',
    });
  };
  /**
   * 获取微信jssdk配置
   * @returns
   */
  getWxConfig = async (params: { debug: boolean; jsApiList: string[]; url: string }) => {
    return await this.#gateway<GetWxJsConfig>({
      path: '/user/getWxJsConfig',
      method: 'post',
      params,
      apiLevel: 'None',
    });
  };
  updateUserAlertStatus = async () => {
    return await this.#gateway<UpdateUserAlertStatus>({
      path: '/user/updateUserAlertStatus',
      method: 'post',
      params: {},
      apiLevel: 'User',
    });
  };
  updateBalanceSyncStatus = async (userAliasId: string) => {
    return await this.#gateway<UpdateBalanceSyncStatus>({
      path: '/user/updateBalanceSyncStatus',
      method: 'post',
      params: { userAliasId },
      apiLevel: 'User',
    });
  };

  /**
   * 用户切换分身
   *
   */
  switchAliasInfo = async (aliasId: string) => {
    return await this.#gateway<SwitchAliasInfo>({
      path: '/user/switchAliasInfo',
      params: { aliasId },
      method: 'post',
      apiLevel: 'User',
    });
  };

  /**
   * 传入用户ID列表 返回用户信息和备注
   */
  getUserInfoList = async (params: { userAliasIds: string[] }) => {
    return await this.#gateway<GetCounsellingUserInfoList>({
      path: '/user/getCounsellingUserInfoList',
      method: 'post',
      apiLevel: 'User',
      params,
    });
  };

  /**
   * 搜索咨询师和疗愈师
   */
  searchDoctorAndConsultantList = async (params: {
    limit?: number;
    offset: number;
    keyWord: string;
  }) => {
    return await this.#gateway<any>({
      path: '/user/searchDoctorAndConsultantList',
      method: 'get',
      apiLevel: 'Anonym',
      params,
    });
  };

  /**
   * 批量获取聊愈师/咨询师信息
   */
  batchGetDoctorAndConsultantInfo = async (userAliasIds: string[]) => {
    return await this.#gateway<BatchGetDoctorAndConsultantInfo>({
      path: '/user/batchGetDoctorAndConsultantInfo',
      method: 'post',
      apiLevel: 'User',
      params: { userAliasIds },
    });
  };

  /**
   * 微信登录未绑定手机号发送验证码
   */
  sendMobileCodeWechatLogin = async (params: GetMobileCodeRequest) => {
    return await this.#gateway<SendMobileCodeWechatLogin>({
      path: '/user/sendMobileCodeWechatLogin',
      method: 'post',
      params,
      apiLevel: 'None',
    });
  };

  /**
   * 微信携带手机号登录
   */
  userLoginMobileWeChat = async (params: LoginMobileWeChatRequest) => {
    return await this.#gateway<UserLoginMobileWeChat>({
      path: '/user/loginMobileWeChat',
      method: 'post',
      params,
      apiLevel: 'None',
    });
  };

  /** 获取用户分身列表 */
  getAliasList = async () => {
    return await this.#gateway<GetAliasList>({
      path: '/user/getAliasList',
      method: 'get',
      params: {},
    });
  };

  /**
   * 职员分组列表
   */
  getStaffGroupList = async () => {
    return await this.#gateway<GetStaffGroupList>({
      path: '/user/staff/getGroupList',
      method: 'get',
      params: {},
      apiLevel: 'Anonym',
    });
  };
  /**
   * 标签分类职员列表
   */
  getStaffListByTagId = async (tagId: string) => {
    return await this.#gateway<GetStaffListByTagId>({
      path: '/user/staff/getListByTagId',
      method: 'get',
      params: { tagId },
      apiLevel: 'Anonym',
    });
  };
}

export default UserApi;
