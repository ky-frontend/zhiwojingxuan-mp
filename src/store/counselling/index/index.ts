import { KYLoading } from '@/components/KYLoading';
import { counsellingApi } from '@/services';
import { CounsellingResourceSlotType, CounsellingUserType } from '@ky-client/counselling-type';
import Taro from '@tarojs/taro';

import { observable, action, makeObservable } from 'mobx';

export class CounsellingIndexStore {
  @observable resourceSlotList: Array<Array<CounsellingResourceSlotType>> = [];
  @observable zhutiList: Array<any> = [];
  params: CounsellingUserType.DoctorListRequestType = {
    /** 主题 */
    subjectIds: [''],
    /** 服务类型 0 全部 1 文字 2 通话 */
    serviceType: 0,
    /** 0 全部聊愈师（默认） 1 与我服务过  2 当前可服务 */
    status: 0,
    /** 0 推荐排序（默认） 1 人气优先  2 服务经验优先 */
    sort: 0,
    /** 分页 */
    pagination: {
      offset: 0,
      limit: 10,
    },
  };

  constructor() {
    makeObservable(this);
  }

  @observable counsellingListHasMore: 'more' | 'no' | 'ing' = 'more';

  @observable counsellingList: CounsellingUserType.DoctorListResponseType[] = [];

  @observable counsellingDoctorClassifyList: CounsellingUserType.DoctorListResponseType[] = [];

  initParams = () => {
    this.params = {
      ...this.params,
      subjectIds: [''],
      serviceType: 0,
      status: 0,
      sort: 0,
      pagination: {
        offset: 0,
        limit: 10,
      },
    };
  };

  @action
  getResourceSlotList = async () => {
    KYLoading.show();
    const res = await counsellingApi.getResourceSlotListApi();
    KYLoading.hide();
    if (res.code != 0) {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
      return;
    } else {
      // 过滤掉是小游戏的金刚经地址
      // this.resourceSlotList = res.data.map(innerArray => innerArray.filter(item => !item.pageLink.startsWith('https://')));
      this.resourceSlotList = res.data;
    }
  };

  @action
  getZhutiList = async () => {
    const res = await counsellingApi.getZhutiList();
    if (res.code != 0) {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
      return;
    } else {
      this.zhutiList = [{ id: '', title: '全部' }, ...res.data];
    }
  };

  // 疗愈师列表
  @action
  getCounsellingDoctorList = async () => {
    if (this.counsellingListHasMore !== 'more') return;
    KYLoading.show();
    const res = await counsellingApi.counsellingDoctorList(this.params as any);
    KYLoading.hide();
    if (res.code === 0) {
      if (this.params.pagination?.offset === 0) {
        this.counsellingList = res.data;
      } else {
        this.counsellingList = [...this.counsellingList, ...res.data];
      }
      if (res.data.length < (this.params.pagination as { offset: number; limit: number }).limit) {
        this.counsellingListHasMore = 'no';
      } else {
        this.counsellingListHasMore = 'more';
      }
      (this.params.pagination as { offset: number; limit: number }).offset =
        this.counsellingList.length;
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
    }
  };

  // 疗愈师分类列表
  @action
  getCounsellingDoctorClassifyList = async (
    params: CounsellingUserType.DoctorClassifyListRequestType,
  ) => {
    KYLoading.show();
    const res = await counsellingApi.counsellingDoctorClassifyList(params);
    KYLoading.hide();
    if (res.code === 0) {
      this.counsellingDoctorClassifyList = [
        ...this.counsellingDoctorClassifyList,
        ...(res.data as any).doctorList,
      ];
    } else {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }
  };
}

export type ICounsellingIndexStore = CounsellingIndexStore;
