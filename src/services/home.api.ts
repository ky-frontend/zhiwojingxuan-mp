import { CounsellingUserApi } from '@ky-client/counselling-api';
import type { GateWayType } from '@ky-frontend/common';
import { GetResourceSlotListApi } from '@ky-middleground/platform-api';
import { SlotTypeEnum } from '@ky-middleground/platform-type';

class HomeApi {
  #gateway: GateWayType;

  constructor(gateway: GateWayType) {
    this.#gateway = gateway;
  }

  /**
   *
   * c端获取金刚位
   */
  public getResourceSlotList = async (slotType: SlotTypeEnum) => {
    return await this.#gateway<GetResourceSlotListApi>({
      path: '/platform/getResourceSlotList',
      method: 'get',
      params: {
        slotType,
      },
    });
  };

  /**
   * 首页聊愈师列表-by ids
   */
  public getCounsellingDoctorListByIds = async (ids: string[]) => {
    return await this.#gateway<CounsellingUserApi.CounsellingDoctorListByIds>({
      path: '/counselling/doctor/getListByIds',
      method: 'post',
      params: {
        doctorIds: ids,
      },
      apiLevel: 'None',
    });
  };
}

export default HomeApi;
