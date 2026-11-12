import { makeObservable, observable } from 'mobx';
import { platformApi } from '@/services';

export type Itags =
  | 'liaoyushi'
  | 'shequjigou'
  | 'yuyinfang'
  | 'shequdaren'
  | 'yunyingmajia'
  | 'zixunshi';
export type ItagsObj = {
  width: number;
  height: number;
  url: string;
};
export type ItagMap = {
  [key in Itags]: {
    light: ItagsObj;
    normal: ItagsObj;
    small: ItagsObj;
  };
};

export class Platform {
  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
    this.getTagLabel();
  }
  @observable tagLabel: ItagMap = {
    liaoyushi: {
      light: {
        width: 0,
        height: 0,
        url: '',
      },
      normal: {
        width: 0,
        height: 0,
        url: '',
      },
      small: {
        width: 0,
        height: 0,
        url: '',
      },
    },
    shequjigou: {
      light: {
        width: 0,
        height: 0,
        url: '',
      },
      normal: {
        width: 0,
        height: 0,
        url: '',
      },
      small: {
        width: 0,
        height: 0,
        url: '',
      },
    },
    yuyinfang: {
      light: {
        width: 0,
        height: 0,
        url: '',
      },
      normal: {
        width: 0,
        height: 0,
        url: '',
      },
      small: {
        width: 0,
        height: 0,
        url: '',
      },
    },
    shequdaren: {
      light: {
        width: 0,
        height: 0,
        url: '',
      },
      normal: {
        width: 0,
        height: 0,
        url: '',
      },
      small: {
        width: 0,
        height: 0,
        url: '',
      },
    },
    yunyingmajia: {
      light: {
        width: 0,
        height: 0,
        url: '',
      },
      normal: {
        width: 0,
        height: 0,
        url: '',
      },
      small: {
        width: 0,
        height: 0,
        url: '',
      },
    },
    zixunshi: {
      light: {
        width: 0,
        height: 0,
        url: '',
      },
      normal: {
        width: 0,
        height: 0,
        url: '',
      },
      small: {
        width: 0,
        height: 0,
        url: '',
      },
    },
  };

  /**
   * 获取身份标签图标
   */
  getTagLabel = async () => {
    if (!platformApi) return;
    const res = await platformApi?.getCustomConfigByconfigId('nYDmO1');
    if (res.code == 0) {
      const data = JSON.parse(res.data.jsonValue);
      data.forEach((item: { identityTag: Itags; tagImages: ItagsObj }) => {
        this.tagLabel = {
          ...this.tagLabel,
          [item.identityTag]: item.tagImages,
        };
      });
    }
  };
}

export type IPlatform = Platform;
