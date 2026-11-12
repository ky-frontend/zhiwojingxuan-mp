import { KYLoading } from '@/components/KYLoading';
import { counsellingApi } from '@/services';
import { formatDate } from '@/utils/util';
import { CounsellingDoctorOnlineLogType } from '@ky-client/counselling-type';
import Taro from '@tarojs/taro';

import { observable, action, makeObservable } from 'mobx';

export class DoctorOnlineTimeListStore {
  @observable month =
    new Date().getFullYear() +
    '-' +
    (new Date().getMonth() + 1 < 10
      ? '0' + (new Date().getMonth() + 1)
      : new Date().getMonth() + 1);
  @observable onlineTime: CounsellingDoctorOnlineLogType[] = [];
  @observable loading = false;
  constructor() {
    makeObservable(this);
  }

  @action
  getOnlineTimeData = async () => {
    this.loading = true;
    KYLoading.show();
    const res = await counsellingApi.getDoctorOnlineList(this.month);
    this.loading = false;
    KYLoading.hide();
    if (res.code != 0) {
      Taro.showToast({
        title: res.message,
        icon: 'none',
      });
      return;
    } else {
      const list: any[] = [];
      res.data.forEach((item) => {
        const index = list.findIndex((i) => i.beginTime === formatDate(item.beginTime, 'MM月DD日'));
        if (index > -1) {
          list[index].list.push(item);
        } else {
          list.push({
            beginTime: formatDate(item.beginTime, 'MM月DD日'),
            list: [item],
          });
        }
      });
      this.onlineTime = list;
    }
  };

  @action
  setMonth = async (month: string) => {
    this.onlineTime = [];
    this.month = month;
    this.getOnlineTimeData();
  };
}

export type IDoctorOnlineTimeListStore = DoctorOnlineTimeListStore;
