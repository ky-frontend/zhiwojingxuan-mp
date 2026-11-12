import BaseKyComponent from '@/components/BaseKyComponent';
import classnames from 'classnames';
import { View, Image } from '@tarojs/components';
import { Itags } from '@/store/platform';
import Taro from '@tarojs/taro';
import { KYTrack } from '@/modules/track';
import { T_AliasChangeButtonClick } from '@/modules/track/events';
import { observer, inject } from 'mobx-react';
import { UserAliasListType } from '@ky-middleground/user-type';
import styles from './index.module.less';

type Props = {};
type IStates = {
  currentAlias: number;
};

@inject('store')
@observer
export class AliasSelect extends BaseKyComponent<Props, IStates> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      currentAlias: -1,
    };
  }
  async componentDidMount() {
    console.log(this.props);
  }
  render() {
    const { aliasList, changeAliasInfo } = this.store.loginStore;
    const { tagLabel } = this.store.platformStore;
    const { currentAlias } = this.state;
    const res = Taro.getSystemInfoSync();
    const navStyle: string = (res.statusBarHeight ? res.statusBarHeight + 52 + 44 : 52 + 44) + 'px';
    return (
      <View className={styles.AliasSelect}>
        <View className={styles.logoview} style={{ paddingTop: navStyle }}>
          <View className={styles.p1}>选择你要登录的分身</View>
        </View>
        <View className={styles.aliasListView}>
          {aliasList.map((item: UserAliasListType, index) => {
            const src = item.identityTags?.length
              ? tagLabel[item.identityTags[0] as Itags].normal.url
              : '';

            return (
              <View
                className={
                  currentAlias == index
                    ? classnames(styles.aliasItem, styles.aliasItemAc)
                    : styles.aliasItem
                }
                key={item.id}
                onClick={() => {
                  this.setState({ currentAlias: index });

                  changeAliasInfo(index);
                  // 埋点: 切换分身按钮点击
                  KYTrack(T_AliasChangeButtonClick());
                }}
              >
                <View className={styles.avator}>
                  <Image
                    className={styles.img}
                    src={item?.avatar + '?x-oss-process=style/avatar'}
                  />
                  <Image className={styles.tagImg} src={src} />
                </View>
                <View className={styles.aliasItemright}>
                  <View className={styles.p1}>{item.name}</View>
                  <View className={styles.p2}>ID：{item.id}</View>
                </View>
                <View className={styles.tag}>分身 {index + 1}</View>
              </View>
            );
          })}
        </View>

        {/* <View className={styles.bottomarea}>
          <View
            className={styles.submitbottombtn}
            onClick={() => {
              if (
                aliasList[currentAlias].identityTags?.[0] == IdentityTagsEnum.liaoyushi ||
                aliasList[currentAlias].identityTags?.[0] == IdentityTagsEnum.zixunshi
              ) {
                Taro.showToast({ title: '咨询师/聊愈师暂不可登录', icon: 'none' });
                return;
              }
              changeAliasInfo(currentAlias);
            }}
          >
            确认
          </View>
        </View> */}
      </View>
    );
  }
}
