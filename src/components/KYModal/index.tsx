import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import classNames from 'classnames';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';

type Props = {
  visiable: boolean; // Modal是否显示
  title?: string;
  content?: string;
  actions: string[];
  event: (index: number) => void; // 具体事件页面中描述，这边只负责调用
};
type States = {};

@inject('store')
@observer
class KYModal extends BaseKyComponent<Props, States> {
  dialogEvent = (index: number) => {
    this.props.event(index);
  };
  render() {
    const { visiable, title = '', content = '', actions } = this.props;

    return (
      <View
        className={classNames({
          [styles.box]: true,
          [styles.ifShow]: visiable,
        })}
      >
        <View
          className={classNames({
            [styles.dialog]: true,
          })}
        >
          <View className={classNames({ [styles.diaTitle]: true, [styles.ifShow]: title != '' })}>
            {title}
          </View>
          <View className={classNames({ [styles.content]: true, [styles.ifShow]: title == '' })}>
            {content}
          </View>
          <View className={styles.btn}>
            {actions.map((item, index) => {
              return (
                <View
                  key={index}
                  className={classNames({ [styles.item]: true, [styles.border]: index == 0 })}
                  onClick={() => {
                    this.dialogEvent(index);
                  }}
                >
                  {item}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}

export default KYModal;
