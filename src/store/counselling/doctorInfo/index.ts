import { UserAliasCounsellingDoctorDetailsType } from '@ky-client/counselling-type';
import { navigateBack } from '@/modules/utils/navigate';
import { counsellingApi, userApi } from '@/services';
import { observable, action, makeObservable } from 'mobx';
import appBridge from '@/modules/bridge/app';
import Taro from '@tarojs/taro';
import { UserAliasTypeAndMobile } from '@ky-middleground/user-type';

export class DoctorInfoStore {
  @observable doctorInfo: null | UserAliasCounsellingDoctorDetailsType = null;
  @observable doctorData: null | UserAliasTypeAndMobile;
  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
  }

  /** 进入详情前清空，避免串数据 / 白屏前残留 */
  @action
  clearDoctorInfo = () => {
    this.doctorInfo = null;
    this.doctorData = null;
  };

  @action
  getDoctorInfo = async () => {
    const resp = await userApi.getUserAliasInfo();
    if (resp.code != 0) {
      Taro.showToast({ title: resp.message, icon: 'none', duration: 1000 });
      return;
    }
    // const inforesp = await counsellingApi.getDoctorDetailsApi(resp.data.id);
    const inforesp = await counsellingApi.getDoctorDetailsApi('1697784170410790');
    if (inforesp.code != 0) {
      Taro.showToast({ title: inforesp.message, icon: 'none', duration: 1000 });
      return;
    }
    this.doctorInfo = inforesp.data;
  };
  @action
  getDoctor = async (counselorId: string, userAliasId?: string) => {
    // 先清空旧数据，避免展示上一次详情
    this.clearDoctorInfo();

    if (userAliasId) {
      const resp = await userApi.getUserAliasInfo2(userAliasId);
      if (resp.code === 0) {
        this.doctorData = resp.data;
      }
    }

    const inforesp = await counsellingApi.getDoctorDetailsApi2(counselorId);
    if (inforesp.code != 0) {
      Taro.showToast({ title: inforesp.message, icon: 'none', duration: 1000 });
      return;
    }
    this.doctorInfo = inforesp.data;
  };

  @action
  editDoctorInfo = async (params: any) => {
    const resp = await counsellingApi.counsellingEditDetailsApi(params);
    if (resp.code != 0) {
      Taro.showToast({ title: resp.message, icon: 'none', duration: 1000 });
      return;
    } else {
      Taro.showToast({ title: '保存成功', icon: 'none', duration: 500 });
      setTimeout(() => {
        if (appBridge.inApp()) {
          appBridge.sendEvent({ eventName: 'ProfileUpdated' });
          appBridge.pop();
        } else {
          navigateBack();
        }
      }, 501);
    }
  };
}

export type IDoctorInfoStore = DoctorInfoStore;
