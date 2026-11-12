import { TestStore } from './test';
import { GlobalDataStore } from './globalData';
import { LoginStore } from './login';
import { Platform } from './platform';
import { ConsultantIndexStore } from './consultant/index';
import { CounsellingIndexStore } from './counselling/index';
import { DoctorInfoStore } from './counselling/doctorInfo';
import { CounsellInfoStore } from './counselling/counsellInfo';

import type { ITestStore } from './test';
import type { IGlobalDataStore } from './globalData';
import type { ILoginStore } from './login';
import type { IPlatform } from './platform';
import type { IConsultantIndexStore } from './consultant/index';
import type { ICounsellingIndexStore } from './counselling/index';
import type { IDoctorInfoStore } from './counselling/doctorInfo';
import type { ICounsellInfoStore } from './counselling/counsellInfo';
import { IImStore, ImStore } from './IM/index';
import { CoachInfoStore, type ICoachInfoStore } from './counselling/coachInfo';

export type IKYStore = {
  testStore: ITestStore;
  globalDataStore: IGlobalDataStore;
  loginStore: ILoginStore;
  doctorInfoStore: IDoctorInfoStore;
  platformStore: IPlatform;
  consultantIndexStore: IConsultantIndexStore;
  counsellingIndexStore: ICounsellingIndexStore;
  imStore: IImStore;
  counsellInfoStore: ICounsellInfoStore;
  coachInfoStore: ICoachInfoStore;
};

export const store: IKYStore = {
  testStore: new TestStore(),
  doctorInfoStore: new DoctorInfoStore(),
  globalDataStore: new GlobalDataStore(),
  loginStore: new LoginStore(),
  platformStore: new Platform(),
  consultantIndexStore: new ConsultantIndexStore(),
  counsellingIndexStore: new CounsellingIndexStore(),
  imStore: new ImStore(),
  counsellInfoStore: new CounsellInfoStore(),
  coachInfoStore: new CoachInfoStore(),
};
