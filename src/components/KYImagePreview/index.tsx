import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';

type Props = {
  imageUrl: string;
  width: number;
  height: number;
  onClose?: () => void; // 具体事件页面中描述，这边只负责调用
};
type States = {};

@inject('store')
@observer
class ImagePreview extends BaseKyComponent<Props, States> {
  render() {
    const { imageUrl, onClose, width, height } = this.props;

    // if(width && height) {}
    const aspectRatio = width / height;
    return (
      <View
        className={styles.imagePreView}
        onClick={() => {
          onClose && onClose();
        }}
      >
        <Image
          className={styles.image}
          src={imageUrl}
          mode="aspectFit"
          style={{ width: '100vw', height: `calc(100vw / ${aspectRatio})` }}
        />
      </View>
    );
  }
}

export default ImagePreview;
