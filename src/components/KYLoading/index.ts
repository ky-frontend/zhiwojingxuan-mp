import { store } from '@/store';

export class KYLoading {
  static show() {
    store.globalDataStore.setShowKyLoading();
  }
  static hide() {
    store.globalDataStore.setHideKyLoading();
  }
}
