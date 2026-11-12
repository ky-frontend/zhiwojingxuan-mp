import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { ScrollView, View, Image } from '@tarojs/components';
import { navigateTo } from '@/utils/navigate';
import { getRect } from '@/utils/util';
import Taro from '@tarojs/taro';
import { PlatformResourceSlotType } from '@ky-middleground/platform-type';
import styles from './index.module.less';

type IProps = {
  data: Array<Array<PlatformResourceSlotType>>;
};
type IState = {
  isScroll: boolean;
  leftnum: number;
  haveData: boolean;
};

@inject('store')
@observer
class Index extends BaseKyComponent<IProps, IState> {
  state = {
    isScroll: false,
    leftnum: 0,
    haveData: true,
  };
  subWidth = 0;

  componentDidUpdate(prevProps: Readonly<IProps>): void {
    if (prevProps.data != this.props.data) {
      const { data } = this.props;
      let flag = false;

      // 判断金刚位每行的个数是否大于5
      let isMoreThanFive = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i].length > 5) {
          isMoreThanFive = true;
        }
        flag = flag || data[i].length > 0;
      }
      console.log('isMoreThanFive', isMoreThanFive);

      if (isMoreThanFive) {
        setTimeout(async () => {
          const coninner = (await getRect('#jingang')) || {};
          this.subWidth = coninner.width - Taro.getSystemInfoSync().windowWidth;
        }, 50);
      }
      this.setState({
        isScroll: isMoreThanFive,
        haveData: flag,
      });
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
    // 埋点: 聊愈下单页开始聊愈按钮点击

    if (item.miniProgramLink.includes('qiyuShuntId')) {
      navigateTo(item.miniProgramLink);
      return;
    }

    if (item.miniProgramLink.includes('#小程序://')) {
      Taro.navigateToMiniProgram({
        shortLink: item.miniProgramLink,
      });
      return;
    }
    navigateTo(item.miniProgramLink, { title: item.title });
  }

  render() {
    const { data } = this.props;
    const { isScroll, leftnum, haveData } = this.state;

    return haveData ? (
      <View className={styles.index}>
        <ScrollView
          scrollX={isScroll}
          className={styles.jingangViewScroll}
          onScroll={(e) => this.onScroll(e)}
        >
          <View id="jingang" style={{ width: 'fit-content' }}>
            {data
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
            <View className={styles.hua} style={{ left: leftnum + '%' }}></View>
          </View>
        ) : null}
      </View>
    ) : null;
  }
}

export default Index;
