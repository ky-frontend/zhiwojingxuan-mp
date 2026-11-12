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
  // 困扰列表
  showTroubleList: string[];

  // 可约时间展示的列表
  showServerTimeList: string;

  // 推荐排序展示
  showServerTypeList: string;

  // 性别展示
  showGender: string;

  // 价格展示
  showPrice: string;
};

@inject('store')
@observer
class Shaixuan extends BaseKyComponent<IShaixuanProps, IShaixuanStates> {
  get ciStore() {
    return this.store.coachInfoStore;
  }
  get troubleList() {
    const tags = (this.ciStore.troubleTagList || []).map((item) => ({
      id: item.code,
      name: item.name,
    }));
    return [
      {
        id: '0',
        name: '不限',
      },
      ...tags,
    ];
  }
  get serverTimeList() {
    return [
      {
        id: '',
        name: '不限',
      },
      {
        id: 'coachSingle',
        name: '单次服务',
      },
      {
        id: 'coachWeekly',
        name: '周服务',
      },
    ];
  }
  get serverTypeList() {
    return [
      {
        id: '',
        name: '不限',
      },
      {
        id: 'Single',
        name: '个体服务',
      },
      {
        id: 'Partner',
        name: '伴侣服务',
      },
      {
        id: 'Family',
        name: '家庭服务',
      },
    ];
  }

  get gender() {
    return [
      {
        id: '0',
        name: '不限',
      },
      {
        id: '1',
        name: '男',
      },
      {
        id: '2',
        name: '女',
      },
    ];
  }
  get price() {
    return [
      {
        id: '',
        name: '不限',
      },
      {
        id: '500-600',
        name: '500-600',
      },
      {
        id: '800-1000',
        name: '800-1000',
      },
      {
        id: '1200-1500',
        name: '1200-1500',
      },
      {
        id: '2000-4000',
        name: '2000-4000',
      },
    ];
  }
  state = {
    showCurrent: -1,

    // 选中主题列表
    showTroubleList: [] as string[],

    // 服务方式展示的列表
    showServerTimeList: '',

    // 推荐排序展示
    showServerTypeList: '',

    // 性别展示
    showGender: '',

    // 价格展示
    showPrice: '',
  };

  // 获取教练列表数据
  getCoachList = async () => {
    this.ciStore.coachListHasMore = 'more';
    this.ciStore.coachParams.offset = 0;
    await this.ciStore.getCoachList();

    Taro.pageScrollTo({
      scrollTop: this.props.tabFixedTop,
      duration: 0,
    });
  };

  // 打开筛选事件
  openShaixuan = async (index: number) => {
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

  // 困扰的点击事件
  onTroubleClick(item: string) {
    let newTroubleList;
    if (item === '0') {
      newTroubleList = this.state.showTroubleList.includes(item) ? [] : ['0'];
    } else {
      const filteredList = this.state.showTroubleList.includes('0')
        ? this.state.showTroubleList.filter((item1) => item1 !== '0')
        : this.state.showTroubleList;
      newTroubleList = this.addOrRemove(filteredList, item);
    }
    this.setState({
      showTroubleList: newTroubleList,
    });
  }

  // 服务周期点击事件
  onServerTimeClick(item: string) {
    this.setState({
      showServerTimeList: item,
      showCurrent: -1,
    });
    this.ciStore.coachParams.appItemKey = item;
    this.getCoachList();
  }

  // 选择服务类型点击事件
  onServerTypeClick(item: string) {
    this.setState({
      showServerTypeList: item,
      showCurrent: -1,
    });
    this.ciStore.coachParams.serviceType = item;
    this.getCoachList();
  }

  // 选择性别点击事件
  onGenderClick(item: string) {
    this.setState({
      showGender: item,
    });
  }
  // 选择价格点击事件
  onPriceClick(item: string) {
    this.setState({
      showPrice: item,
    });
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
      showTroubleList: deepClone(this.ciStore.coachParams.trouble || ['0']),
      showServerTimeList: this.ciStore.coachParams.appItemKey,
      showServerTypeList: this.ciStore.coachParams.serviceType,
      showGender: this.ciStore.coachParams.gender,
      showPrice: this.ciStore.coachParams.price,
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
          showTroubleList: [],
        });

        break;
      case 3:
        this.setState({
          showGender: '0',
          showPrice: '',
        });
        this.ciStore.coachParams.gender = '0';
        this.ciStore.coachParams.price = '';
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
        this.ciStore.coachParams.trouble = deepClone(this.state.showTroubleList);
        break;
      case 3:
        this.ciStore.coachParams.gender = this.state.showGender;
        this.ciStore.coachParams.price = this.state.showPrice;
        break;
      default:
        break;
    }
    this.setState({
      showCurrent: -1,
    });
    // 过滤空字符串的情况(全部)
    this.ciStore.coachParams.trouble =
      this.ciStore.coachParams.trouble?.filter((item) => item !== '0') || [];
    this.getCoachList();
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

  // 选中的困扰的文案，通过，拼接
  getTroubleText() {
    const ls: string[] = [];
    if (this.state.showTroubleList.length !== 0) {
      this.troubleList.forEach((item) => {
        if (this.state.showTroubleList.indexOf(item.id) > -1) {
          ls.push(item.name);
        }
      });
    }

    return ls.length > 0 ? ls.join('，') : '心理困扰';
  }

  // 选中的服务周期
  getServerTimeText() {
    let str = '服务周期';
    this.serverTimeList.forEach((item) => {
      if (this.ciStore.coachParams.appItemKey && this.ciStore.coachParams.appItemKey == item.id) {
        str = item.name;
      }
    });

    return str;
  }

  // 选中的服务类型
  getServerTypeText() {
    let str = '服务类型';
    this.serverTypeList.forEach((item) => {
      if (this.ciStore.coachParams.serviceType && this.ciStore.coachParams.serviceType == item.id) {
        str = item.name;
      }
    });
    return str;
  }

  render() {
    const {
      showCurrent,
      showTroubleList,
      showServerTimeList,
      showServerTypeList,
      showGender,
      showPrice,
    } = this.state;
    const appItemKey = this.ciStore.coachParams.appItemKey || '';
    const serviceType = this.ciStore.coachParams.serviceType || '';
    const more = this.ciStore.coachParams.price || this.ciStore.coachParams.gender || '';

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
            <View
              className={classNames(styles.cellBtn, styles.less)}
              onClick={() => this.openShaixuan(0)}
            >
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 0 ? styles.pAC : showTroubleList.length > 0 ? styles.pAB : '',
                )}
              >
                {this.getTroubleText()}
              </View>
              {this.arrowRender(0)}
            </View>

            <View className={styles.cellBtn} onClick={() => this.openShaixuan(1)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 1 ? styles.pAC : appItemKey !== '' ? styles.pAB : '',
                )}
              >
                {this.getServerTimeText()}
              </View>
              {this.arrowRender(1)}
            </View>

            <View className={styles.cellBtn} onClick={() => this.openShaixuan(2)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 2 ? styles.pAC : serviceType !== '' ? styles.pAB : '',
                )}
              >
                {this.getServerTypeText()}
              </View>
              {this.arrowRender(2)}
            </View>

            <View
              className={classNames(styles.cellBtn, styles.less)}
              onClick={() => this.openShaixuan(3)}
            >
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 3 ? styles.pAC : more !== '' && more !== '0' ? styles.pAB : '',
                )}
              >
                更多
              </View>
              {this.arrowRender(3)}
            </View>
          </View>

          {showCurrent >= 0 ? (
            <View
              className={styles.shaixuankuang}
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
                      {this.troubleList.map((item1) => {
                        return (
                          <View className={styles.tag} key={item1.id}>
                            <SelectBtn
                              isSelect={showTroubleList.indexOf(item1.id) > -1}
                              text={item1.name}
                              onClick={() => this.onTroubleClick(item1.id)}
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
                    {this.serverTimeList.map((item) => {
                      const clss = classNames(
                        styles.price,
                        showServerTimeList == item.id ? styles.priceAc : '',
                      );
                      return (
                        <View
                          className={clss}
                          key={item.id}
                          onClick={() => this.onServerTimeClick(item.id)}
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
                    {this.serverTypeList.map((item) => {
                      const clss = classNames(
                        styles.price,
                        showServerTypeList == item.id ? styles.priceAc : '',
                      );
                      return (
                        <View
                          className={clss}
                          key={item.id}
                          onClick={() => this.onServerTypeClick(item.id)}
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
                  <View className={styles.empty}></View>
                  <View className={styles.do}>
                    <View className={styles.p1}>价格</View>
                    <View className={styles.tags}>
                      {this.price.map((item) => {
                        const clss = classNames(
                          styles.SelectBtn,
                          showPrice == item.id ? styles.SelectBtnTag : '',
                        );
                        return (
                          <View className={styles.tag} key={item.id}>
                            <View className={clss} onClick={() => this.onPriceClick(item.id)}>
                              {item.name}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  <View className={styles.do}>
                    <View className={styles.p1}>性别</View>
                    <View className={styles.tags}>
                      {this.gender.map((item) => {
                        const clss = classNames(
                          styles.SelectBtn,
                          showGender == item.id ? styles.SelectBtnTag : '',
                        );
                        return (
                          <View className={styles.tag} key={item.id}>
                            <View className={clss} onClick={() => this.onGenderClick(item.id)}>
                              {item.name}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  {this.resetAndConfirmRender(
                    () => {
                      this.resetBtn(3);
                    },
                    () => {
                      this.confirmBtn(3);
                    },
                  )}
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
