import { SexType } from '@ky-middleground/user-type';
import { callHandler } from './base';

/* ---------------    调取原生指令 ---------------- */
//没有 setBarInfo
const appBridgeCall = {
  /**
   * 禁用侧滑功能
   * @param boolean
   * @returns
   */
  setPopGesture: (isBol: boolean) => {
    return callHandler('setPopGesture', isBol);
  },
  /**
   * 获取系统信息
   * {statusBarHeight: AppInfo.barHeight}
   *
   * */
  getSystemInfo: (): Promise<{ statusBarHeight: number }> => {
    return callHandler('getSystemInfo');
  },

  /**
   * 是否隐藏系统状态栏
   *
   */
  hideStatusHeight: () => {
    return callHandler('hideStatusHeight');
  },

  /**
   * 获取客户端token
   * 新系统token和php token
   */
  getToken: (): Promise<{ token: string; phpToken: string }> => {
    return callHandler('getToken');
  },

  /**
   * 客户端登录
   */
  login: () => {
    return callHandler('login');
  },

  /**
   * 客户端退出登录
   */
  logout: () => {
    return callHandler('logout');
  },

  /**
   * 设置页面title
   */
  setTitle: (title: string) => {
    document.title = title;
    return callHandler('setTitle', title);
  },

  /**
   * 设置页面setBarInfo({title: String, rightInfo: {}}, leftInfo: {}})
   * color: 需要传argb 十六进制
   */
  setBarInfo: (params: {
    titleInfo?: { text?: string; color: string };
    rightInfo?: { icon?: string; url?: string; text?: string };
    leftInfo?: { icon?: string; url?: string; text?: string };
    background?: string;
  }) => {
    return callHandler('setBarInfo', params);
  },

  /**
   * 打开新的webview
   * @param {string} params.url 跳转的url
   * @param {boolean} params.isPresent 是否是present方式打开
   * @param {boolean} params.animation 是否需要动画
   */
  openUrl: (params: { url: string; isPresent: boolean; animation: boolean }) => {
    return callHandler('openUrl', params);
  },

  /**
   * 我同意聊愈服务协议
   */
  agreement: () => {
    return callHandler('agreement');
  },
  /**
   * 关闭当前壳，返回上级页面
   */
  pop: () => {
    return callHandler('pop');
  },
  /**
   * 获取当前登录用户信息
   */
  getUserInfo: (): Promise<{
    token: string;
    name: string;
    avatar: string;
    id: string;
    sex: SexType;
    aliasId: string;
  }> => {
    return callHandler('getUserInfo');
  },

  /**
   * 清除缓存
   */
  clearLocalStorage: () => {
    return callHandler('clearLocalStorage');
  },

  /**
   * 设置缓存
   */
  setLocalStorage: (info: any) => {
    return callHandler('setLocalStorage', info);
  },

  /**
   * 获取缓存
   */
  getLocalStorage: (key: string) => {
    return callHandler('getLocalStorage', key);
  },

  /**
   * 是否安装微信 支付宝
   * appType 0 weChat, 1 qq, 2 weibo, 3pocket, 4alipay, 5twitter
   */
  isAppInstalled: (appType: number): Promise<boolean> => {
    return callHandler('isAppInstalled', appType);
  },

  /**
   * 向App发送事件
   * @param {string} params.key 事件名称
   *  ProfileUpdated 刷新app用户聊愈个人主页
   * @param {string} params.dataId 数据唯一标识（如userId、orderId）
   * @param {object} params.extra 额外数据
   */
  sendEvent: (params: { eventName: string; dataId?: string; extra?: {} }) => {
    return callHandler('sendEvent', params);
  },

  /**
   * App选择+上传图片，成功返回{'url': 'https://xxx.png'}
   */
  pickAndUploadImage: () => {
    return callHandler('pickAndUploadImage', {});
  },
  /**
   * 预览图片
   * @param params
   *   images base64类型的图片数组
   * @returns
   */
  onImgPreview: (params: { images: string[]; index: number }) => {
    return callHandler('onImgPreview', params);
  },

  /**
   * 保存相册
   * @param image base64 字符串
   * @returns
   */
  saveImageToAlbum: (image: string) => {
    return callHandler('saveImageToAlbum', image);
  },

  /**
   * 播放视频-画中画
   * @param url 视频地址
   * @returns
   */
  playVideo: (url: string) => {
    return callHandler('playVideo', { url });
  },

  /**
   * 返回webview 内容高度
   * @param
   * @returns
   */
  loadCmp: (info: { docHeight: number }) => {
    return callHandler('loadCmp', info);
  },
  /**
   * 获取当前登录用户信息
   */
  payMoneyByThirdParty: (params: any) => {
    return callHandler('payMoneyByThirdParty', params);
  },
  /**
   * 弹出分享弹窗
   * @param params
   *   currentPageId 当前页面id
   *   targetPageId 分享页面pageId
   *   params 分享页面参数
   *   mode 模式：0-链接，1-图片
   * @returns
   */

  showSharePopup: (params: {
    currentPageId: string;
    targetPageId: string;
    params?: Record<string, string>;
    mode?: number;
  }) => {
    return callHandler('showSharePopup', params);
  },
};

export default appBridgeCall;
