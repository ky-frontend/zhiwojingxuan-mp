import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image, ScrollView } from '@tarojs/components';
import { navigateTo } from '@/utils/navigate';
import { rpx2px } from '@/modules/utils/tools';
import Taro from '@tarojs/taro';
import { ImgUrlFormat } from '@/modules/utils/format';
import { serviceTypeOptions } from '@/constants/values';
import classNames from 'classnames';
import styles from './index.module.less';
import Shaixuan from './components/Shaixuan';

type States = {
  tabFixedTop: number;
  navTop: number;
  leftnum: number;
};
type Props = {
  tabFixed: boolean;
  sendTabFixedTop: (top: number) => void;
};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  state = {
    tabFixedTop: 0,
    navTop: 0,
    leftnum: 0,
  };
  subWidth = 0;

  async componentDidMount() {
    setTimeout(() => {
      Taro.createSelectorQuery()
        .select('#shaixuanFixedliao')
        .boundingClientRect((rect: any) => {
          const sbh = Taro.getSystemInfoSync().statusBarHeight || 0;
          this.setState(
            {
              navTop: sbh + rpx2px(48),
              tabFixedTop: rect.top - sbh - rpx2px(48),
            },
            () => {
              this.props.sendTabFixedTop(this.state.tabFixedTop);
            },
          );
        })
        .exec();

      if ((this.cistore.troubleTagList || []).length >= 5) {
        Taro.createSelectorQuery()
          .select('#coachJingang')
          .boundingClientRect((rect: any) => {
            if (rect?.width) {
              this.subWidth = rect.width - Taro.getSystemInfoSync().windowWidth;
            }
          })
          .exec();
      }
    }, 50);
  }

  get cistore() {
    return this.store.coachInfoStore;
  }

  onJingangScroll = (e) => {
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
  };

  handleClickTroubleTag = (item: { code: string; name: string }) => {
    navigateTo(`/subCounselling/pages/classify/index`, {
      type: 'Coach',
      title: item.name,
      trouble: item.code,
    });
  };

  handleSearch() {
    navigateTo('/subCommon/pages/search/index');
  }

  render() {
    const { navTop, leftnum } = this.state;
    const { tabFixed } = this.props;
    const troubleTagList = this.cistore.troubleTagList || [];
    // >=5 保持横向滚动；<5 等分居中
    const useEqualLayout = troubleTagList.length > 0 && troubleTagList.length < 5;
    const useScrollLayout = troubleTagList.length >= 5;

    return (
      <View className={styles.index}>
        <View className={styles.tipsView}>
          <View className={styles.p}>优选心理教练，助力人生破局</View>
          <Image
            src="https://cdn-public.knowyourself.cc/icon/wechat/20240129_ly_icon_search.png"
            className={styles.i1}
            onClick={this.handleSearch}
          />
          <Image
            onClick={() => {
              navigateTo('/subConsultant/pages/serviceData/index');
            }}
            src="https://cdn-public.knowyourself.cc/icon/wechat/20240129_titlebar_icon_information_black.png"
            className={styles.i2}
          />
        </View>

        {/* 困扰标签金刚位 */}
        {troubleTagList.length > 0 ? (
          <View className={styles.jingangListView}>
            {useEqualLayout ? (
              <View className={styles.jingangEqual}>
                {troubleTagList.map((item) => {
                  return (
                    <View
                      className={styles.jingangEqualItem}
                      key={item.code}
                      onClick={() => this.handleClickTroubleTag(item)}
                    >
                      <View className={styles.jingangItemImg}>
                        <Image src={item.iconUrl || ''} className={styles.icon} />
                      </View>
                      <View className={styles.jingangItemTitle}>{item.name}</View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <>
                <ScrollView
                  scrollX={useScrollLayout}
                  className={styles.jingangViewScroll}
                  onScroll={(e) => this.onJingangScroll(e)}
                >
                  <View
                    id="coachJingang"
                    className={styles.jingangView}
                    style={{ width: 'fit-content' }}
                  >
                    {troubleTagList.map((item) => {
                      return (
                        <View
                          className={styles.jingangItem}
                          key={item.code}
                          onClick={() => this.handleClickTroubleTag(item)}
                        >
                          <View className={styles.jingangItemImg}>
                            <Image src={item.iconUrl || ''} className={styles.icon} />
                          </View>
                          <View className={styles.jingangItemTitle}>{item.name}</View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
                {useScrollLayout ? (
                  <View className={styles.huacao}>
                    <View className={styles.hua} style={{ left: leftnum + '%' }}></View>
                  </View>
                ) : null}
              </>
            )}
          </View>
        ) : null}

        <Shaixuan
          tabFixed={tabFixed}
          navTop={navTop}
          tabFixedTop={this.state.tabFixedTop}
          clickShaixuan={() => {
            Taro.pageScrollTo({
              scrollTop: this.state.tabFixedTop,
              duration: 100,
            });
          }}
        />

        {this.cistore.coachList.length > 0 ? (
          this.cistore.coachList.map((item, index) => {
            return (
              <View
                key={index}
                className={classNames({
                  [styles.item]: true,
                  [styles.firstItem]: index === 0 && this.cistore.coachList.length === 1,
                })}
                onClick={() => {
                  navigateTo(
                    `/subCommon/pages/userInfo/index?sence=${item.coachId}&identity=${'coach'}`,
                  );
                }}
              >
                <View className={styles.left}>
                  <Image
                    src={ImgUrlFormat.imagesLimFunc(item.avatar)}
                    className={styles.avatar}
                    mode="aspectFill"
                  />
                </View>
                <View className={styles.right}>
                  <View className={styles.info}>
                    <View className={styles.name}>{item.realName}</View>
                  </View>
                  <View style={{ display: 'flex' }}>
                    {item.serviceType.map((element, i) => {
                      return (
                        <View className={styles.p2} key={i}>
                          {i + 1 === item.serviceType.length
                            ? serviceTypeOptions.find((e) => element === e.value)?.label
                            : `${serviceTypeOptions.find((e) => element === e.value)?.label} |`}
                          &nbsp;
                        </View>
                      );
                    })}
                  </View>

                  {item.goodAtTags.length > 0 ? (
                    <View className={styles.pp}>
                      <Image
                        src="https://cdn-public.knowyourself.cc/icon/coach/20250617_goodAt.png"
                        className={styles.tImg}
                      />
                      {item.goodAtTags.map((element) => (
                        <View className={styles.c} key={element}>
                          {element}
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View className={styles.desc}>{item.introduction}</View>

                  <View className={styles.p1}>{item.briefIntroduction}</View>
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.empty}>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/common/empty_Illustration_message@3x.png"
              className={styles.img}
            />
            <View className={styles.txt}>暂无符合条件的心理教练</View>
          </View>
        )}
      </View>
    );
  }
}

export default Index;
