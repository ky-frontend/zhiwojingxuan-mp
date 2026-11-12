import BaseKyComponent from '@/components/BaseKyComponent';
import { inject, observer } from 'mobx-react';
import { View, Image, ScrollView } from '@tarojs/components';
import { navigateTo, replaceTo } from '@/utils/navigate';
import { getRect } from '@/utils/util';
import Taro from '@tarojs/taro';
import { KYTrack } from '@/modules/track';
import { T_ConsultantIconClick } from '@/modules/track/events';
import styles from './index.module.less';

type IResourceSlotState = {
  isMoreThanFive: boolean;
  leftnum: number;
};

@inject('store')
@observer
class ResourceSlot extends BaseKyComponent<{}, IResourceSlotState> {
  get cistore() {
    return this.store.counsellingIndexStore;
  }
  state = {
    isMoreThanFive: false,
    leftnum: 0,
  };
  subWidth = 0;

  async componentDidMount() {
    // 判断金刚位每行的个数是否大于5
    let isMoreThanFive = false;
    for (let i = 0; i < this.cistore.resourceSlotList.length; i++) {
      if (this.cistore.resourceSlotList[i].length > 5) {
        isMoreThanFive = true;
      }
    }
    if (isMoreThanFive) {
      this.setState({
        isMoreThanFive: true,
      });
      setTimeout(async () => {
        const coninner = (await getRect('#jingang')) || {};
        console.log('coninner', coninner);
        this.subWidth = coninner.width - Taro.getSystemInfoSync().windowWidth;
      }, 50);
    }
  }

  onScroll(e) {
    const { scrollLeft } = e.detail;
    let s = (scrollLeft / this.subWidth) * 50;
    if (s > 50) {
      s = 50;
    }
    if (s < 0) {
      s = 0;
    }
    this.setState({
      leftnum: s,
    });
  }

  handleClickJingGang(item: any) {
    console.log('click+++', item);
    // 埋点: 聊愈下单页开始聊愈按钮点击
    KYTrack(
      T_ConsultantIconClick({
        consultant_icon_sort: 1,
        consultant_icon_name: item.title,
      }),
    );
    if (item.miniProgramLink.includes('qiyuShuntId')) {
      // Taro.navigateTo({
      //   url: item.miniProgramLink,
      // });
      navigateTo(item.miniProgramLink);
      return;
    }

    if (item.miniProgramLink.includes('#小程序://')) {
      // #小程序://KY小卖部/8UOIzBuKHDKb6jb
      Taro.navigateToMiniProgram({
        shortLink: item.miniProgramLink,
      });
      return;
    }
    // Taro.redirectTo({ url: `${item.miniProgramLink}&title=${item.title}` });
    navigateTo(item.miniProgramLink, { title: item.title });
  }

  moreThanFiveResourceRender(isScroll: boolean) {
    return (
      <>
        <ScrollView
          scrollX={isScroll}
          className={styles.jingangViewScroll}
          onScroll={(e) => this.onScroll(e)}
        >
          <View id="jingang" style={{ width: 'fit-content' }}>
            {this.cistore.resourceSlotList
              .filter((item) => item.length > 0)
              .map((item, index) => {
                return (
                  <View className={styles.jingangView} key={index + 'resource'}>
                    {item.map((item1, index1) => {
                      return (
                        <View
                          className={styles.jingangItem}
                          key={index1 + 'ires'}
                          onClick={() => this.handleClickJingGang(item1)}
                        >
                          <View className={styles.jingangItemImg}>
                            <Image src={item1.icon} className={styles.icon} />
                          </View>
                          <View className={styles.jingangItemTitle}>{item1.title}</View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
          </View>
        </ScrollView>
        {isScroll ? (
          <View className={styles.huacao}>
            <View className={styles.hua} style={{ left: this.state.leftnum + '%' }}></View>
          </View>
        ) : null}
      </>
    );
  }
  render() {
    const { isMoreThanFive } = this.state;
    return (
      <View className={styles.jingangListView}>
        {this.moreThanFiveResourceRender(isMoreThanFive)}
      </View>
    );
  }
}
export default ResourceSlot;
