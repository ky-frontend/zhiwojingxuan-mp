import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';

type Props = {
  children: React.ReactNode; // popup中心展示内容
  visiable: boolean; // popup是否显示
  type?: 'BOTTOM' | 'CENTER'; // 默认为下端
  isCloseBG?: boolean; // 默认不可以关闭
  zIndex?: number; // 默认998
  closeModel?: () => void;
  style?: any;
};
type States = {};

@inject('store')
@observer
class KYPopup extends BaseKyComponent<Props, States> {
  render() {
    const { visiable, children, type, isCloseBG, zIndex = 998, closeModel, style } = this.props;

    return (
      <View
        className={styles.popup}
        style={visiable ? { display: 'block', zIndex: '' + zIndex } : { display: 'none' }}
        onClick={() => {
          if (isCloseBG == true && closeModel) {
            closeModel();
          }
        }}
      >
        <View className={type == 'CENTER' ? styles.center : styles.content} style={style}>
          {children}
        </View>
      </View>
    );
  }
}

export default KYPopup;
