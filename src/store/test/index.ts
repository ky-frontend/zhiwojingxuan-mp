import { action, makeObservable, observable } from 'mobx';

export class TestStore {
  constructor() {
    // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
    makeObservable(this);
  }

  @observable count = 0;

  @action
  addCount = () => {
    this.count += 1;
  };
}

export type ITestStore = TestStore;
