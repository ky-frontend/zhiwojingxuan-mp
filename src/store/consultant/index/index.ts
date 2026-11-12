import { KYLoading } from '@/components/KYLoading';
import { consultantApi, userApi } from '@/services';
import {
  ConsultantAdminType,
  ConsultantBaseEnum,
  ConsultantModelType,
  ConsultantUserClassifyType,
} from '@ky-client/consultant-type';
import { IdentityTagsEnum } from '@ky-middleground/user-type';
import Taro from '@tarojs/taro';
import { action, makeObservable, observable } from 'mobx';

export class ConsultantIndexStore {
  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
  }
  lastTimestamp = 0;
  @observable userClassify: ConsultantUserClassifyType = {
    domainList: [],
    scheduleList: [],
    timePeriodName: [],
    priceList: [],
    sex: [],
    specialList: [],
  };

  // 用于筛选的参数
  @observable params: {
    /** 擅长领域 */
    domainIds: string[];
    /** 可约时间 */
    date: string[];
    timePeriodName: number[];
    /** 价格 */
    prices: number;
    /** 性别 */
    sex: 'male' | 'female' | '';
    /** 流派 */
    specialId: string[];
    offset: number;
    pageSize: number;
  } = {
      domainIds: [],
      date: [],
      timePeriodName: [],
      prices: 0,
      sex: '',
      specialId: [],
      offset: 0,
      pageSize: 20,
    };

  @observable consultantList: {
    address: string;
    /** 咨询师Id */
    counselorId: string;
    /** 头像 */
    avatar: string;
    /** 昵称 */
    nickName: string;
    /** 咨询订单总时长 */
    consultationDuration: number;
    /** 个人简介 */
    profileSummary: string;
    /** 资质列表 */
    certificationList: string[];
    /** 咨询过程及方式 */
    consultationProcess: string;
    consultationProcessV2: string;
    /** 产品价格 */
    price: number;
    /** 最近可约时间 */
    latestScheduleTime: number;
    /** 最近可约时间文案 */
    latestScheduleTimeStr: string;
    tags: string[];
  }[] = [];

  @observable consultantInfo: {
    address: string;
    /** 照片墙 */
    photoList: string[];
    /** 真实名称 */
    realName: string;
    /** 产品价格 */
    price: number;
    /** 资质 */
    certificationList: string[];
    /** 咨询时长 */
    consultationDuration: number;
    /** 长程系统培训 */
    longTermTraining: number;
    /** 短程系统培训 */
    shortTermTraining: number;
    /** 咨询师等级  1实习 0 正式 */
    level: ConsultantBaseEnum.LevelEnum;

    /** 个人简介 */
    profileSummary: string;
    /** 个人简介  短*/
    profileSummary1: string;
    /** 个人简介 长 */
    profileSummary2: string;
    domainList: ConsultantModelType.ConsultantDomain[];
    specialList: ConsultantAdminType.ConsultantSpecial[];
    /** 长程系统培训 */
    longTermTrainingList: ConsultantModelType.TermTrainingType[];
    /** 短程系统培训 */
    shortTermTrainingList: ConsultantModelType.TermTrainingType[];
    /** 教育经历 */
    educationHistory: ConsultantModelType.EducationType[];
    /** 咨询过程及方式 */
    consultationProcess: string;

    consultationProcessV2: string;
    counselorProduct: {
      price: number;
      productName: string;
      skuinfo: any;
    }[];
    partnerProduct?: {
      price: number;
      productName: string;
      skuinfo: any;
    }[];
    /** 费用说明 */
    feeDescription: string;
    scheduleList: {
      /** 日期 2023-11-07 */
      date: string;
      /** 年 */
      year: number;
      /** 月 */
      month: number;
      /** 日 */
      day: number;
      /** 周几  周一/周二 */
      week: string;
      /** 状态 0可用 1不可用 2休息  */
      status: number;
      /** 可预约数量 */
      availableNum: number;
    }[];
  };

  @observable
  tipBarData: {
    /** 咨询师Id */
    counselorId: string;
    /** 咨询状态 */
    status: ConsultantBaseEnum.ConsultantTipBarStatusEnum;
    /** 头像 */
    avatar: string;
    /** 昵称 */
    nickName: string;
    /** 真名 */
    realName: string;
    /** 用户当前服务次数 */
    userOrderCount: number;
    /** 咨询预约段Id */
    scheduleId: string;
    /** 咨询预约时间 */
    scheduleTime: number;
    /** 咨询方式 */
    consultationProcess?: string;
    workStatus: number;
    consultationProcessV2: string;
    address: string;
  }[] = [];

  @observable
  zhuangtai = 4;

  @observable
  isHasData = false;

  // 搜索返回值
  @observable searchDoctorAndConsultantList: {
    list: {
      appId: number;
      area: string;
      areaCode: number;
      avatar: string;
      birthday: string;
      createdAt: string;
      doctorServiceCount: string;
      id: string;
      /** 身份标签 liaoyushi 聊愈师； yuyinfang 通话房主持人；shequjigou 社区机构号；shequdaren 社区达人号；yunyingmajia 运营马甲号*/
      identityTags: IdentityTagsEnum[];
      imSig: string;
      loginAt: number;
      name: string;
      sex: number;
      shortId: string;
      sign: string;
      status: string;
      updatedAt: string;
      userId: string;
      constantServiceTime: string;
      coachId?: string;
    }[];
    count: number;
  } = { list: [], count: 0 };

  @observable consultantListHasMore: 'more' | 'no' | 'ing' = 'more';

  @action
  getUserClassiy = async () => {
    KYLoading.show();
    const res = await consultantApi.getConsultantUserClassify();
    KYLoading.hide();
    if (res.code === 0) {
      this.userClassify = res.data;
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
    }
  };

  @action
  getConsultantInfo = async (counselorId: string) => {
    KYLoading.show();
    const res = await Promise.all([
      consultantApi.consultantIndex(counselorId),
      consultantApi.consultantIntroduction(counselorId),
    ]);
    KYLoading.hide();
    if (res[0].code === 0 && res[1].code === 0) {
      this.consultantInfo = {
        ...res[0].data,
        ...res[1].data,
        profileSummary1: '',
        profileSummary2: '',
      } as any;
    } else {
      Taro.showToast({
        title: res[0].message || res[1].message,
        icon: 'none',
      });
      Taro.navigateBack();
    }
  };

  @action
  getConsultantList = async () => {
    console.log('consultantListHasMore+++++', this.consultantListHasMore);
    if (this.consultantListHasMore !== 'more') return;
    KYLoading.show();
    const res = await consultantApi.consultantList(this.params as any);
    KYLoading.hide();
    if (res.code === 0) {
      this.lastTimestamp = Date.now();
      if (this.params.offset === 0) {
        this.consultantList = res.data;
      } else {
        this.consultantList = [...this.consultantList, ...res.data];
      }
      // res.data.length < this.params.pageSize（原先判断条件）
      // 返回的数组长度即时小于20，也不一定没有数据了（后台有可能过滤），这里修改为返回数组为空才判断没有数据 2024-5-22
      if (res.data && res.data.length === 0) {
        this.consultantListHasMore = 'no';
      } else {
        this.consultantListHasMore = 'more';
      }
      this.params.offset = this.consultantList.length;
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
    }
  };

  @action
  getTipBar = async () => {
    // KYLoading.show();
    // const res = await consultantApi.getConsultantTipBar();
    // KYLoading.hide();
    // if (res.code === 0 && res.data) {
    //   this.tipBarData = (res as any).data;
    //   this.isHasData = true;
    //   this.zhuangtai = (res as any).data.status;
    // } else if (res.code === 0 && !res.data) {
    //   this.isHasData = false;
    //   this.tipBarData = {} as any;
    //   this.zhuangtai = 4;
    // }
    KYLoading.show();
    const res = await consultantApi.getConsultantTipBarV2();
    KYLoading.hide();
    if (res.code === 0 && (res.data as any)?.length > 0) {
      this.tipBarData = (res as any).data;
      this.isHasData = true;
    }
  };

  @action
  resetConsultantList = async () => {
    this.params.offset = 0;
    this.consultantListHasMore = 'more';
    this.consultantList = [];
  };

  @action
  initConsultantParams = async () => {
    this.params.offset = 0;
    this.consultantListHasMore = 'more';
  };

  @action
  setProfileSummary = (profileSummary: string, num: number) => {
    if (num === 1) {
      this.consultantInfo.profileSummary1 = profileSummary;
      this.consultantInfo.profileSummary2 = '';
    } else {
      this.consultantInfo.profileSummary1 = '';
      this.consultantInfo.profileSummary2 = profileSummary;
    }
  };

  // 搜索咨询师/疗愈师
  @action
  toSearchDoctorAndConsultantList = async (params: {
    limit?: number;
    offset: number;
    keyWord: string;
  }) => {
    KYLoading.show();
    const res = await userApi.searchDoctorAndConsultantList(params);
    KYLoading.hide();
    if (res.code === 0) {
      this.searchDoctorAndConsultantList = res.data;
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
    }
  };
}

export type IConsultantIndexStore = ConsultantIndexStore;
