import { platformApi } from '@/services';
import Taro from '@tarojs/taro';
import { navigateTo } from '@/utils/navigate';
import { KYLoading } from '@/components/KYLoading';
import classNames from 'classnames';
import KYMarkdown from '@/components/KYMarkdown';
import { observer, inject } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYNavigation from '@/components/KYNavigation';
import KYPage from '@/components/KYPage';
import styles from './index.module.less';

type Props = {};
type States = {
  dataList: any[];
  isAgree: boolean;
  current: 'liaoyu' | 'zixunshi';
  display: number;
  data: {};
};
@inject('store')
@observer
class Assistant extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      dataList: [],
      isAgree: false,
      current: 'liaoyu',
      display: -1,
      data: { liaoyu: [], xinli: [] },
    };
  }
  async onLoad(option) {
    const tab = option?.type || 'liaoyu';

    KYLoading.show();
    const { data: liaoyu } = await platformApi.getCustomConfigByconfigId('qhunQC');
    const { data: xinli } = await platformApi.getCustomConfigByconfigId('knowyouselfXLZX');
    KYLoading.hide();
    if (tab == 'liaoyu') {
      this.setState({
        dataList: JSON.parse(liaoyu.jsonValue),
        current: tab,
        data: { liaoyu: JSON.parse(liaoyu.jsonValue), xinli: JSON.parse(xinli.jsonValue) },
      });
    } else {
      this.setState({
        dataList: JSON.parse(xinli.jsonValue),
        current: tab,
        data: { liaoyu: JSON.parse(liaoyu.jsonValue), xinli: JSON.parse(xinli.jsonValue) },
      });
    }
  }
  componentWillUnmount() {
    console.log('index componentWillUnmount');
  }

  componentDidShow() {
    console.log('index componentDidShow');
  }

  componentDidHide() {
    console.log('index componentDidHide');
  }
  onTab = async (tab: 'liaoyu' | 'zixunshi') => {
    if (tab == 'liaoyu') {
      this.setState({
        dataList: this.state.data['liaoyu'],
        current: tab,
        display: -1,
      });
    } else {
      this.setState({
        dataList: this.state.data['xinli'],
        current: tab,
        display: -1,
      });
    }
  };

  render() {
    const res = Taro.getSystemInfoSync();
    const { dataList, current, display } = this.state;
    let navHight = 48;
    if (res.statusBarHeight) {
      navHight = navHight + res.statusBarHeight;
    }
    return (
      <KYPage className={styles.index}>
        <KYNavigation showBack className={styles.nav} />
        <View className={styles.tab} style={{ top: navHight + 'px' }}>
          <View
            className={
              current == 'liaoyu' ? classNames(styles.tabItem, styles.tabItemAc) : styles.tabItem
            }
            onClick={() => {
              this.onTab('liaoyu');
            }}
          >
            即时咨询介绍
          </View>
          {/* 心理咨询业务下线：心理咨询介绍 tab 隐藏 */}
          {/* <View
            className={
              current == 'zixunshi' ? classNames(styles.tabItem, styles.tabItemAc) : styles.tabItem
            }
            onClick={() => {
              this.onTab('zixunshi');
            }}
          >
            心理咨询介绍
          </View> */}
        </View>

        <View className={styles.place}></View>
        <View className={styles.middle}>
          {dataList.map((item: any, index: number) => {
            return (
              <View
                key={index}
                className={styles.item}
                onClick={() => {
                  if (display != index) {
                    this.setState({ display: index });
                  } else {
                    this.setState({ display: -1 });
                  }
                }}
              >
                <View className={styles.title}>
                  {item.title}
                  <Image
                    className={styles.img}
                    mode="widthFix"
                    src="https://cdn-public.knowyourself.cc/icon/liaoyu/20231101_down_fill.png.png"
                  ></Image>
                </View>
                <View
                  className={
                    display == index ? classNames(styles.content, styles.contentAc) : styles.content
                  }
                >
                  {item.list.map((inneritem: any, innerIndex: number) => {
                    if (inneritem.type === 'h') {
                      return (
                        <View className={styles.subTitle} key={innerIndex}>
                          {inneritem.text}
                        </View>
                      );
                    } else if (inneritem.type === 'p') {
                      return (
                        <View className={styles.subtext} key={innerIndex}>
                          {inneritem.text}
                        </View>
                      );
                    } else if (inneritem.type === 'image') {
                      return (
                        <Image
                          key={innerIndex}
                          src={inneritem.text}
                          mode="widthFix"
                          style={{ width: '100%' }}
                        ></Image>
                      );
                    } else if (inneritem.type === 'html') {
                      return (
                        <View
                          className={styles.subtext}
                          dangerouslySetInnerHTML={{ __html: inneritem.text }}
                          key={innerIndex}
                        ></View>
                      );
                    } else if (inneritem.type === 'md') {
                      return (
                        <View key={innerIndex}>
                          <KYMarkdown url={inneritem.text}></KYMarkdown>
                        </View>
                      );
                    }
                  })}
                </View>
              </View>
            );
          })}
        </View>
        <View className={styles.btn}>
          <View
            className={styles.agree}
            onClick={() => {
              navigateTo(`/subWebview/pages/webviewV1/index?qiyuShuntId=1098754`);
            }}
          >
            联系客服
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/liaoyu/20231101_lianxi.png"
            />
          </View>
        </View>
      </KYPage>
    );
  }
}

export default Assistant;
