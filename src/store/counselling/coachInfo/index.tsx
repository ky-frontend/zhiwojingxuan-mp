import { KYLoading } from '@/components/KYLoading';
import { coachApi } from '@/services';
import Taro from '@tarojs/taro';
import { CoachType } from '@ky-client/consultant-type';

import { observable, action, makeObservable } from 'mobx';

export class CoachInfoStore {
  coachParams: any = {
    // 困扰
    trouble: [],
    // 服务周期
    appItemKey: '',
    // 服务类型
    serviceType: '',
    // 价格范围
    price: '',
    // 性别
    gender: '0',
    /** 分页 */
    offset: 0,
    limit: 10,
  };

  constructor() {
    makeObservable(this);
  }

  @observable coachListHasMore: 'more' | 'no' | 'ing' = 'more';

  @observable coachList: any = [];
  @observable coachDetail: any = null;

  @observable coachDoctorClassifyList: any = [];

  /** 困扰标签列表（金刚位） */
  @observable troubleTagList: CoachType.CoachTroubleTagType[] = [];

  initCoachParams = () => {
    this.coachParams = {
      ...this.coachParams,
      offset: 0,
      limit: 10,
      trouble: [],
      appItemKey: '',
      serviceType: '',
      price: '',
      gender: '0',
    };
  };

  /** 获取困扰标签列表 */
  @action
  getTroubleTagList = async () => {
    const res = await coachApi.getTroubleTagList();
    if (res.code === 0) {
      this.troubleTagList = (res.data || []).filter((item) => !item.isDeleted);
    }
  };

  // 教练列表
  @action
  getCoachList = async () => {
    if (this.coachListHasMore !== 'more') {
      return;
    }
    let params: any = {
      ...this.coachParams,
      gender: parseInt(this.coachParams.gender, 10),
    };
    if (this.coachParams.price) {
      params = {
        ...params,
        priceMin: parseInt(this.coachParams.price.split('-')[0], 10) * 100 || 0,
        priceMax: parseInt(this.coachParams.price.split('-')[1], 10) * 100 || 0,
      };
    }
    delete params.price;

    KYLoading.show();
    const res = await coachApi.getCoachDoctorList(params);
    KYLoading.hide();
    if (res.code === 0) {
      if (this.coachParams.offset === 0) {
        this.coachList = res.data.list;
      } else {
        this.coachList = [...this.coachList, ...res.data.list];
      }
      if (res.data.list.length < this.coachParams.limit) {
        this.coachListHasMore = 'no';
      } else {
        this.coachListHasMore = 'more';
      }
      this.coachParams.offset = this.coachList.length;
    } else {
      Taro.showToast({
        title: '暂无数据',
        icon: 'none',
      });
    }
  };

  // 分类教练列表
  @action
  getCoachClassifyList = async (params) => {
    KYLoading.show();
    const res = await coachApi.getCoachDoctorList(params);
    KYLoading.hide();
    if (res.code === 0) {
      if (this.coachParams.offset === 0) {
        this.coachDoctorClassifyList = res.data.list;
      } else {
        this.coachDoctorClassifyList = [...this.coachDoctorClassifyList, ...res.data.list];
      }
    } else {
      Taro.showToast({
        title: '暂无数据',
        icon: 'none',
      });
    }
  };

  @action
  getCoachDetail = async (id: string) => {
    // 先清空，避免切换教练时短暂展示上一次详情
    this.coachDetail = null;
    const res = await coachApi.getCoachInfo(id);
    if (res.code === 0) {
      this.coachDetail = res.data;
    } else {
      Taro.showToast({
        title: '获取教练详情失败',
        icon: 'none',
      });
      return null;
    }
  };
}

export type ICoachInfoStore = CoachInfoStore;
