import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import classNames from 'classnames';
import { deepClone } from '@/utils/util';
import styles from './index.module.less';

type IShaixuanProps = {
  navTop: number;
  tabFixed: boolean;
  tabFixedTop: number;
  clickShaixuan: () => void;
};

type IShaixuanStates = {
  showCurrent: number;
  // 选中主题列表
  showZhutiList: string[];

  // 可约时间展示的列表
  showServerState: number;

  // 推荐排序展示
  showTuijian: number;

  // 更多展示的列表
  showMoreChoose: number;
};

@inject('store')
@observer
class Shaixuan extends BaseKyComponent<IShaixuanProps, IShaixuanStates> {
  get ciStore() {
    return this.store.counsellingIndexStore;
  }
  get serverStateList() {
    return [
      {
        id: 0,
        name: '全部',
      },
      {
        id: 1,
        name: '对话',
      },
      {
        id: 2,
        name: '通话',
      },
    ];
  }
  get tuijianList() {
    return [
      {
        id: 0,
        name: '推荐排序',
      },
      {
        id: 2,
        name: '服务经验优先',
      },
    ];
  }
  get moreList() {
    return [
      {
        id: 0,
        name: '全部聊愈师',
      },
      {
        id: 1,
        name: '与我服务过',
      },
      {
        id: 2,
        name: '当前可服务',
      },
    ];
  }
  state: Readonly<IShaixuanStates> = {
    showCurrent: -1,

    // 选中主题列表
    showZhutiList: [],

    // 服务方式展示的列表
    showServerState: 0,

    // 推荐排序展示
    showTuijian: 0,

    // 更多展示
    showMoreChoose: 0,
  };
  async componentDidMount() {
    // this.store.consultantIndexStore.getUserClassiy();
    // this.store.counsellingIndexStore.getZhutiList();
  }

  // 获取咨询师列表数据
  getCounsellingDoctorList = async () => {
    this.ciStore.counsellingListHasMore = 'more';
    this.ciStore.params.pagination!.offset = 0;
    await this.ciStore.getCounsellingDoctorList();

    Taro.pageScrollTo({
      scrollTop: this.props.tabFixedTop,
      duration: 0,
    });
  };

  // 打开筛选事件
  openShaixuan = async (index: number) => {
    // 如果没有获取到数据，获取数据
    if (this.ciStore.zhutiList.length === 0) {
      await this.ciStore.getZhutiList();
    }
    // 如果没有吸顶，点击筛选，吸顶
    if (!this.props.tabFixed) {
      this.props.clickShaixuan();
    }

    let current = index;
    if (index == this.state.showCurrent) {
      current = -1;
    }
    this.setState({
      showCurrent: current,
    });
    this.netDataBackShowData();
  };

  // 主题的点击事件
  onZhutiClick(item: string) {
    const { showZhutiList } = this.state;

    let newZhutiList;
    if (item === '') {
      newZhutiList = showZhutiList.includes(item) ? [] : [''];
    } else {
      const filteredList = showZhutiList.includes('')
        ? showZhutiList.filter((item1) => item1 !== '')
        : showZhutiList;
      newZhutiList = this.addOrRemove(filteredList, item);
    }

    this.setState({
      showZhutiList: newZhutiList,
    });
  }

  // 选择服务方式点击事件
  onServerStateClick(item: number) {
    this.setState({
      showServerState: item,
      showCurrent: -1,
    });
    this.ciStore.params.serviceType = item;
    this.getCounsellingDoctorList();
  }

  // 选择排序点击事件
  onTuijianClick(item: number) {
    this.setState({
      showTuijian: item,
      showCurrent: -1,
    });
    this.ciStore.params.sort = item;
    this.getCounsellingDoctorList();
  }

  // 更多点击事件
  onMoreClick(item: number) {
    this.setState({
      showMoreChoose: item,
      showCurrent: -1,
    });
    this.ciStore.params.status = item;
    this.getCounsellingDoctorList();
  }

  // 传入一个数组和一个值，如果数组中有这个值，就删除，没有就添加
  addOrRemove(arr: any[], item: any, ismore = true) {
    const index = arr.indexOf(item);
    if (index > -1) {
      arr.splice(index, 1);
    } else if (ismore) {
      arr.push(item);
    } else {
      arr = [item];
    }
    return arr;
  }

  // 请求数据回填展示的数据
  netDataBackShowData() {
    this.setState({
      showZhutiList: deepClone(this.ciStore.params.subjectIds),
      showServerState: this.ciStore.params.serviceType as number,
      showTuijian: this.ciStore.params.sort as number,
      showMoreChoose: this.ciStore.params.status as number,
    });
  }

  /**
   * 重置按钮
   * @param index 第几个筛选器的重置按钮
   * @returns null
   */
  resetBtn(index: number) {
    switch (index) {
      case 0:
        this.setState({
          showZhutiList: [''],
        });
        break;
      default:
        break;
    }
  }

  /**
   * 确定按钮
   * @param index 第几个筛选器的确定按钮
   * @returns null
   */
  confirmBtn(index: number) {
    switch (index) {
      case 0:
        this.ciStore.params.subjectIds = deepClone(this.state.showZhutiList);
        break;
      default:
        break;
    }
    this.setState({
      showCurrent: -1,
    });
    // 过滤空字符串的情况(全部)
    this.ciStore.params.subjectIds =
      this.ciStore.params.subjectIds?.filter((item) => item !== '') || [];
    this.getCounsellingDoctorList();
  }

  // 箭头Render
  arrowRender(index: number) {
    const { showCurrent } = this.state;
    if (showCurrent == index) {
      return (
        <Image
          src="https://cdn-public.knowyourself.cc/icon/liaoyu/chevron_on_blue_230317_002.png"
          className={styles.icon}
        />
      );
    }
    return (
      <Image
        src="https://cdn-public.knowyourself.cc/icon/liaoyu/chevron_on_230317_003.png"
        className={styles.icon}
      />
    );
  }
  // 重置&确定
  resetAndConfirmRender(resetCb: () => void, confirmCb: () => void) {
    return (
      <View className={styles.resetAndConfirmView}>
        <View className={styles.reset} onClick={resetCb}>
          重置
        </View>
        <View className={styles.confirm} onClick={confirmCb}>
          确定
        </View>
      </View>
    );
  }

  // 选中的主题的文案，通过，拼接
  getZhutiText() {
    const ls: string[] = [];
    this.ciStore.zhutiList.forEach((item) => {
      if (this.ciStore.params.subjectIds && this.ciStore.params.subjectIds.indexOf(item.id) > -1) {
        ls.push(item.title);
      }
    });

    return ls.length > 0 ? ls.join('，') : '主题';
  }

  // 选中的服务方式
  getServerStateText() {
    let str = '服务方式';
    this.serverStateList.forEach((item) => {
      if (this.ciStore.params.serviceType && this.ciStore.params.serviceType == item.id) {
        str = item.name;
      }
    });
    return str;
  }

  // 选中的推荐排序的文案
  getPriceText() {
    let str = '推荐排序';
    this.tuijianList.forEach((item) => {
      if (this.ciStore.params.sort && this.ciStore.params.sort == item.id) {
        str = item.name;
      }
    });
    return str;
  }

  // 选中更多的文案
  getMoreText() {
    let str = '更多';
    this.moreList.forEach((item) => {
      if (this.ciStore.params.status && this.ciStore.params.status == item.id) {
        str = item.name;
      }
    });
    return str;
  }

  render() {
    const { showCurrent, showTuijian, showMoreChoose, showServerState, showZhutiList } = this.state;
    const subjectIds = this.ciStore.params.subjectIds || [];
    const serviceType = this.ciStore.params.serviceType || 0;
    const sort = this.ciStore.params.sort || 0;
    const status = this.ciStore.params.status || 0;

    return (
      <View className={styles.shaixuanView}>
        <View
          className={styles.shaixuanFixed}
          style={
            this.props.tabFixed
              ? { position: 'fixed', top: this.props.navTop + 'px', zIndex: 100 }
              : {}
          }
          id="shaixuanFixedliao"
        >
          <View className={styles.shaixuanFixedBtn}>
            <View className={styles.cellBtn} onClick={() => this.openShaixuan(0)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 0
                    ? styles.pAC
                    : subjectIds.length && subjectIds[0] !== ''
                      ? styles.pAB
                      : '',
                )}
              >
                {this.getZhutiText()}
              </View>
              {this.arrowRender(0)}
            </View>
            <View className={styles.cellBtn} onClick={() => this.openShaixuan(1)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 1 ? styles.pAC : serviceType > 0 ? styles.pAB : '',
                )}
              >
                {this.getServerStateText()}
              </View>
              {this.arrowRender(1)}
            </View>
            <View className={styles.cellBtn} onClick={() => this.openShaixuan(2)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 2 ? styles.pAC : sort > 0 ? styles.pAB : '',
                )}
              >
                {this.getPriceText()}
              </View>
              {this.arrowRender(2)}
            </View>
            <View className={styles.cellBtn} onClick={() => this.openShaixuan(3)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 3 ? styles.pAC : status > 0 ? styles.pAB : '',
                )}
              >
                {this.getMoreText()}
              </View>
              {this.arrowRender(3)}
            </View>
          </View>
          {showCurrent >= 0 ? (
            <View
              className={styles.shaoxuankuang}
              catchMove
              onClick={() => {
                this.setState({ showCurrent: -1 });
              }}
            >
              {showCurrent == 0 ? (
                <View
                  className={styles.sCV}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <View className={styles.empty}></View>
                  <View className={styles.do}>
                    <View className={styles.p1}>
                      类型<Text className={styles.t}>(可多选)</Text>
                    </View>
                    <View className={styles.tags}>
                      {this.ciStore.zhutiList.map((item1) => {
                        return (
                          <View className={styles.tag} key={item1.id}>
                            <SelectBtn
                              isSelect={showZhutiList.indexOf(item1.id) > -1}
                              text={item1.title}
                              onClick={() => this.onZhutiClick(item1.id)}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  {this.resetAndConfirmRender(
                    () => {
                      this.resetBtn(0);
                    },
                    () => {
                      this.confirmBtn(0);
                    },
                  )}
                </View>
              ) : null}
              {showCurrent == 1 ? (
                <View
                  className={styles.sCV}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <View className={styles.priceslist}>
                    {this.serverStateList.map((item) => {
                      const clss = classNames(
                        styles.price,
                        showServerState == item.id ? styles.priceAc : '',
                      );
                      return (
                        <View
                          className={clss}
                          key={item.id}
                          onClick={() => this.onServerStateClick(item.id)}
                        >
                          {item.name}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
              {showCurrent == 2 ? (
                <View
                  className={styles.sCV}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <View className={styles.priceslist}>
                    {this.tuijianList.map((item) => {
                      const clss = classNames(
                        styles.price,
                        showTuijian == item.id ? styles.priceAc : '',
                      );
                      return (
                        <View
                          className={clss}
                          key={item.id}
                          onClick={() => this.onTuijianClick(item.id)}
                        >
                          {item.name}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
              {showCurrent == 3 ? (
                <View
                  className={styles.sCV}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <View className={styles.priceslist}>
                    {this.moreList.map((item) => {
                      const clss = classNames(
                        styles.price,
                        showMoreChoose == item.id ? styles.priceAc : '',
                      );
                      return (
                        <View
                          className={clss}
                          key={item.id}
                          onClick={() => this.onMoreClick(item.id)}
                        >
                          {item.name}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

export default Shaixuan;

/**
 * 点击选择选中按钮
 */
type ISelectBtnProps = {
  text: string;
  isSelect: boolean;
  onClick?: () => void;
};

class SelectBtn extends BaseKyComponent<ISelectBtnProps> {
  render() {
    const tagClass = classNames(styles.SelectBtn, this.props.isSelect ? styles.SelectBtnTag : '');
    return (
      <View className={tagClass} onClick={() => this.props.onClick && this.props.onClick()}>
        <View className={styles.content}></View>
        {this.props.text}
      </View>
    );
  }
}
