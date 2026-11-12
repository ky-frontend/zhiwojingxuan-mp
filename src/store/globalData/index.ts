import Taro from '@tarojs/taro';
import { action, makeObservable, observable } from 'mobx';

export class GlobalDataStore {
  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
  }

  @observable kyLoading = false;
  @observable globalAudioContext = Taro.createInnerAudioContext();
  @observable globalAudioID = '';

  timer: NodeJS.Timeout | null = null;

  @action
  setShowKyLoading = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.kyLoading = true;

    // 如果超过10秒还没有加载出来，就直接隐藏
    this.timer = setTimeout(() => {
      this.setHideKyLoading();
    }, 10000);
  };

  @action
  setHideKyLoading = () => {
    if (!this.kyLoading) return;
    this.kyLoading = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  @action
  setGlobalAudioUrl = (url: string) => {
    this.globalAudioContext.src = url;
  };

  @action
  setGlobalAudioID = (id: string) => {
    this.globalAudioID = id;
  };

  /** 小程序从后台唤醒等场景，驱动 TabBar 重新计算 */
  @observable appShowTick = 0;

  @action
  bumpAppShowTick = () => {
    this.appShowTick += 1;
  };
}

export type IGlobalDataStore = GlobalDataStore;
