import { ConsultationPersonalInfoType } from '@ky-client/consultant-type';
import { consultantApi } from '@/services';
import { observable, makeObservable, action } from 'mobx';

export class CounsellInfoStore {
  @observable userId = '';

  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
  }
  @action
  editConsultationPersonal = async (info: ConsultationPersonalInfoType) => {
    const res = await consultantApi.editConsultationPersonal({
      info: info,
    });
    return res;
  };

  getConsultationPersonal = async () => {
    const res = await consultantApi.getConsultationPersonal();
    return res.data;
  };
}

export type ICounsellInfoStore = CounsellInfoStore;
