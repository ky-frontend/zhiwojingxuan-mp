import React from 'react';
import { IKYStore } from '@/store';
import Taro from '@tarojs/taro';

class BaseKyComponent<P = {}, S = {}> extends React.Component<P, S> {
  get store() {
    return (this.props as any).store as IKYStore;
  }
  get systemInfo() {
    return Taro.getSystemInfoSync();
  }
}

export default BaseKyComponent;
