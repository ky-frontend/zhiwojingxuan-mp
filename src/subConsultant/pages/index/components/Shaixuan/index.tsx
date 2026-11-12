import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image, ScrollView, Text } from '@tarojs/components';
import classNames from 'classnames';
import KYNumber from '@/components/KYNumber';
import Taro from '@tarojs/taro';
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
  // 困扰问题展示的列表
  showDomainChooseList: string[];

  // 可约时间展示的列表
  showTimeDateList: string[];

  // 可选时间段展示的列表
  showTimeDayList: number[];

  // 价格展示的列表
  showPriceChoose: number;

  // 性别展示的列表
  showSexChoose: string;

  // 咨询流派展示的列表
  showSpecialChooseList: string[];
};

@inject('store')
@observer
class Shaixuan extends BaseKyComponent<IShaixuanProps, IShaixuanStates> {
  get ciStore() {
    return this.store.consultantIndexStore;
  }
  state: Readonly<IShaixuanStates> = {
    showCurrent: -1,

    // 困扰问题展示的列表
    showDomainChooseList: [],

    // 可约时间展示的列表
    showTimeDateList: [],

    // 可选时间段展示的列表
    showTimeDayList: [],

    // 价格展示的列表
    showPriceChoose: 0,

    // 性别展示的列表
    showSexChoose: '',

    // 咨询流派展示的列表
    showSpecialChooseList: [],
  };
  async componentDidMount() {
    // this.store.consultantIndexStore.getUserClassiy();
  }

  // 获取咨询师列表数据
  async getConsultantList() {
    this.ciStore.params.offset = 0;
    this.ciStore.consultantListHasMore = 'more';
    await this.ciStore.getConsultantList();
    console.log('发起网络请求', this.ciStore.params);

    Taro.pageScrollTo({
      scrollTop: this.props.tabFixedTop,
      duration: 0,
    });
  }

  // 打开筛选事件
  openShaixuan = async (index: number) => {
    // 如果没有获取到数据，获取数据
    if (this.ciStore.userClassify.domainList.length === 0) {
      await this.ciStore.getUserClassiy();
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

  // 困扰问题点击事件
  onDomainClick(item: string) {
    const { showDomainChooseList } = this.state;
    this.setState({
      showDomainChooseList: this.addOrRemove(showDomainChooseList, item),
    });
  }

  // 选择性别点击事件
  onSexClick(item: string) {
    let str = item;
    if (this.state.showSexChoose == item) {
      str = '';
    }
    this.setState({
      showSexChoose: str,
    });
  }

  // 选择价格点击事件
  onPriceClick(item: number) {
    this.setState({
      showPriceChoose: item,
      showCurrent: -1,
    });
    this.ciStore.params.prices = item;
    this.getConsultantList();
  }

  // 选择咨询流派点击事件
  onSpecialClick(item: string) {
    const { showSpecialChooseList } = this.state;
    this.setState({
      showSpecialChooseList: this.addOrRemove(showSpecialChooseList, item),
    });
  }

  // 选择可约时间点击事件
  onTimeClick(item: string) {
    const { showTimeDateList } = this.state;
    this.setState({
      showTimeDateList: this.addOrRemove(showTimeDateList, item),
    });
  }

  // 选择可选时间段点击事件
  onTimePeriodClick(item: number) {
    const { showTimeDayList } = this.state;
    this.setState({
      showTimeDayList: this.addOrRemove(showTimeDayList, item, false),
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
      showDomainChooseList: deepClone(this.ciStore.params.domainIds),
      showTimeDateList: deepClone(this.ciStore.params.date),
      showTimeDayList: deepClone(this.ciStore.params.timePeriodName),
      showSexChoose: this.ciStore.params.sex,
      showSpecialChooseList: deepClone(this.ciStore.params.specialId),
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
          showDomainChooseList: [],
        });
        break;
      case 1:
        this.setState({
          showTimeDateList: [],
          showTimeDayList: [],
        });
        break;
      case 3:
        this.setState({
          showSexChoose: '',
          showSpecialChooseList: [],
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
        this.ciStore.params.domainIds = deepClone(this.state.showDomainChooseList);
        break;
      case 1:
        this.ciStore.params.date = deepClone(this.state.showTimeDateList);
        this.ciStore.params.timePeriodName = deepClone(this.state.showTimeDayList);
        break;
      case 3:
        this.ciStore.params.sex = this.state.showSexChoose as 'male' | 'female' | '';
        this.ciStore.params.specialId = deepClone(this.state.showSpecialChooseList);
        break;
      default:
        break;
    }
    this.setState({
      showCurrent: -1,
    });
    this.getConsultantList();
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
  getDomainText() {
    const ls: string[] = [];
    this.ciStore.userClassify.domainList.forEach((item) => {
      item.data.forEach((item1) => {
        if (this.ciStore.params.domainIds.indexOf(item1.domainId) > -1) {
          ls.push(item1.title);
        }
      });
    });
    return ls.length > 0 ? ls.join('，') : '困扰';
  }

  // 选中的可约时间的文案，通过，拼接
  getTimeText() {
    const ls: string[] = [];
    this.ciStore.userClassify.scheduleList.forEach((item) => {
      if (this.ciStore.params.date.indexOf(item.date) > -1) {
        ls.push(item.month + '月' + item.day + '日');
      }
    });
    this.ciStore.userClassify.timePeriodName.forEach((item) => {
      if (this.ciStore.params.timePeriodName.indexOf(item.id) > -1) {
        ls.push(item.title);
      }
    });
    return ls.length > 0 ? ls.join('，') : '可约时间';
  }

  // 选中的可约时间的文案
  getPriceText() {
    let str = '价格筛选';
    this.ciStore.userClassify.priceList.forEach((item) => {
      if (this.ciStore.params.prices && this.ciStore.params.prices == item.id) {
        str = item.name;
      }
    });
    return str;
  }

  // 选中更多的文案
  getMoreText() {
    const ls: string[] = [];
    this.ciStore.userClassify.sex.forEach((item) => {
      if ((this.ciStore.params.sex as string) == item.id + '') {
        ls.push(item.title);
      }
    });
    this.ciStore.userClassify.specialList.forEach((item) => {
      if (this.ciStore.params.specialId.indexOf(item.specialId) > -1) {
        ls.push(item.name);
      }
    });

    return ls.length > 0 ? ls.join('，') : '更多';
  }

  render() {
    const {
      showCurrent,
      showDomainChooseList,
      showPriceChoose,
      showTimeDateList,
      showTimeDayList,
      showSexChoose,
      showSpecialChooseList,
    } = this.state;
    return (
      <View className={styles.shaixuanView}>
        <View
          className={styles.shaixuanFixed}
          style={
            this.props.tabFixed
              ? { position: 'fixed', top: this.props.navTop + 'px', zIndex: 100 }
              : {}
          }
          id="shaixuanFixed"
        >
          <View className={styles.shaixuanFixedBtn}>
            <View className={styles.cellBtn} onClick={() => this.openShaixuan(0)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 0
                    ? styles.pAC
                    : this.ciStore.params.domainIds.length
                      ? styles.pAB
                      : '',
                )}
              >
                {this.getDomainText()}
              </View>
              {this.arrowRender(0)}
            </View>
            <View className={styles.cellBtn} onClick={() => this.openShaixuan(1)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 1
                    ? styles.pAC
                    : this.ciStore.params.date.length || this.ciStore.params.timePeriodName.length
                      ? styles.pAB
                      : '',
                )}
              >
                {this.getTimeText()}
              </View>
              {this.arrowRender(1)}
            </View>
            <View className={styles.cellBtn} onClick={() => this.openShaixuan(2)}>
              <View
                className={classNames(
                  styles.p,
                  showCurrent == 2 ? styles.pAC : this.ciStore.params.prices ? styles.pAB : '',
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
                  showCurrent == 3
                    ? styles.pAC
                    : this.ciStore.params.sex || this.ciStore.params.specialId.length
                      ? styles.pAB
                      : '',
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
                  <ScrollView scrollY className={styles.sCVScroll}>
                    <View className={styles.title_p}>
                      困扰问题<Text className={styles.t}>（可多选）</Text>
                    </View>
                    {this.ciStore.userClassify.domainList.map((item) => {
                      return (
                        <View className={styles.do} key={item.parentId}>
                          <View className={styles.p1}>{item.parentType}</View>
                          <View className={styles.tags}>
                            {item.data.map((item1) => {
                              return (
                                <View
                                  className={styles.tag}
                                  key={item1.domainId}
                                  style={item1.title.length > 4 ? { marginRight: '10px' } : {}}
                                >
                                  <SelectBtn
                                    isSelect={showDomainChooseList.indexOf(item1.domainId) > -1}
                                    text={item1.title}
                                    onClick={() => this.onDomainClick(item1.domainId)}
                                  />
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
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
                  <View className={styles.empty}></View>
                  <View className={styles.do}>
                    <View className={styles.p1}>
                      咨询时段<Text className={styles.t}>（可多选）</Text>
                    </View>
                    <View className={styles.p2}>可选未来14天时段，最早提前24h预约（北京时间）</View>
                  </View>
                  <ScrollView scrollX className={styles.hdays}>
                    <View className={styles.list}>
                      {this.ciStore.userClassify.scheduleList.map((item) => {
                        const clss = classNames(
                          styles.state,
                          showTimeDateList.indexOf(item.date) > -1 ? styles.stateAc : '',
                        );
                        const color = showTimeDateList.indexOf(item.date) > -1 ? '#3B3FBD' : '#000';
                        return (
                          <View
                            className={styles.cell}
                            key={item.scheduleId}
                            onClick={() => this.onTimeClick(item.date)}
                          >
                            <View className={styles.p1}>{item.month}月</View>
                            <View className={clss}>
                              <View className={styles.p4}></View>
                              <KYNumber className={styles.p2} color={color}>
                                {item.day}
                              </KYNumber>
                              <View className={styles.p3}>{item.week}</View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                  <View className={classNames(styles.do, styles.dop)}>
                    <View className={styles.p1}>可选时间</View>
                    <View className={styles.tags}>
                      {this.ciStore.userClassify.timePeriodName.map((item1) => {
                        return (
                          <View className={styles.tag} key={item1.id}>
                            <SelectBtn
                              isSelect={showTimeDayList.indexOf(item1.id) > -1}
                              text={item1.title}
                              onClick={() => this.onTimePeriodClick(item1.id)}
                            />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  {this.resetAndConfirmRender(
                    () => {
                      this.resetBtn(1);
                    },
                    () => {
                      this.confirmBtn(1);
                    },
                  )}
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
                    {this.ciStore.userClassify.priceList.map((item) => {
                      const clss = classNames(
                        styles.price,
                        showPriceChoose == item.id ? styles.priceAc : '',
                      );
                      return (
                        <View
                          className={clss}
                          key={item.id}
                          onClick={() => this.onPriceClick(item.id)}
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
                  <ScrollView scrollY className={styles.sCVScroll}>
                    <View>
                      <View className={styles.empty}></View>
                      <View className={styles.do}>
                        <View className={styles.p1}>咨询师性别</View>
                        <View className={styles.tags}>
                          {this.ciStore.userClassify.sex.map((item1) => {
                            return (
                              <View className={styles.tag} key={item1.id}>
                                <SelectBtn
                                  isSelect={showSexChoose == item1.id + ''}
                                  text={item1.title}
                                  onClick={() => this.onSexClick(item1.id + '')}
                                />
                              </View>
                            );
                          })}
                        </View>
                      </View>
                      <View className={styles.do}>
                        <View className={styles.p1}>
                          咨询流派<Text className={styles.t}>(可多选)</Text>
                        </View>
                        <View className={styles.tags}>
                          {this.ciStore.userClassify.specialList.map((item1) => {
                            return (
                              <View className={styles.tag} key={item1.specialId}>
                                <SelectBtn
                                  isSelect={showSpecialChooseList.indexOf(item1.specialId) > -1}
                                  text={item1.name}
                                  onClick={() => this.onSpecialClick(item1.specialId)}
                                />
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  </ScrollView>
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
      <View
        className={tagClass}
        onClick={() => this.props.onClick && this.props.onClick()}
        style={this.props.text.length > 4 ? { padding: '0 8px' } : {}}
      >
        <View className={styles.content}></View>
        {this.props.text}
      </View>
    );
  }
}
