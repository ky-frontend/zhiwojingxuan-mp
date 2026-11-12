import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import { getTabBarActiveIndex, getVisibleTabBarItems } from '@/utils/tabbar.util';
import { reLaunchTo } from '@/utils/navigate';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';

type Props = {
  index: number;
};
type States = {};

@inject('store')
@observer
class KYTabBar extends BaseKyComponent<Props, States> {
  render() {
    const visibleTabs = getVisibleTabBarItems();
    const activeIndex = getTabBarActiveIndex(this.props.index);

    return (
      <View className={styles.KYTabBar}>
        {visibleTabs.map((item, index) => {
          return (
            <View
              className={styles.tab}
              key={item.url}
              style={{ opacity: activeIndex === index ? '1' : '0.2' }}
              onClick={() => {
                reLaunchTo(item.url);
              }}
            >
              <Image src={item.icon} className={styles.icon} />
              <View className={styles.text}>{item.text}</View>
            </View>
          );
        })}
      </View>
    );
  }
}

export default KYTabBar;
