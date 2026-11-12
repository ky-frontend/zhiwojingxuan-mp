import { getAvatarUrl } from '@/utils/util';
import { FixTxt } from '@/types/common.type';
import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { checkLogin, gotoLogin } from '@/utils/identity';
import { getCurrentFullRoute } from '@/utils/navigate';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import KYTabBar from '@/components/KYTabBar';
import { View, Text, Image } from '@tarojs/components';
import { UserAliasStatusEnum, UserAliasType } from '@ky-middleground/user-type';
import Taro from '@tarojs/taro';
import { userApi } from '@/services';
import styles from './index.module.less';

interface MeState {
  myInfo: UserAliasType;
}

@inject('store')
@observer
class Me extends BaseKyComponent<{}, MeState> {
  state = {
    myInfo: {
      imSig: '',
      status: UserAliasStatusEnum['available'],
      avatar: '',
      id: '',
      userId: '',
      name: '',
    },
  };
  currentRoute = getCurrentFullRoute();

  onShareAppMessage() {
    return {
      title: FixTxt.indexPageText,
      path: '/pages/index/index',
      imageUrl: 'https://cdn-public.knowyourself.cc/icon/wechat/shareImg.jpg',
    };
  }

  async componentDidMount() {
    const isLogin = await checkLogin();
    if (!isLogin) {
      gotoLogin(true, this.currentRoute);
      return;
    }
    const resp = await userApi.getUserAliasInfo();
    this.setState({
      myInfo: resp.data as UserAliasType,
    });
  }

  componentDidShow() {
    if (this.state.myInfo == null) {
      Taro.clearStorageSync();
      gotoLogin(false, this.currentRoute);
    }
  }

  handleCopy = (text: string) => {
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: '复制成功', duration: 2000 }),
      fail: () => Taro.showToast({ title: '复制失败', duration: 2000 }),
    });
  };

  render() {
    const { myInfo } = this.state;
    return (
      <KYPage className={styles.Me}>
        <KYNavigation showBack={false} title="" />
        <View
          className={styles.changeID}
          onClick={async () => {
            await this.store.loginStore.getAliasList();
            if (this.store.loginStore.aliasList.length > 1) {
              Taro.reLaunch({ url: '/pages/login/index?type=changeID' });
            } else {
              Taro.showToast({ title: '暂无可切换的分身', icon: 'none' });
            }
          }}
        >
          <View>切换分身</View>
          <Image
            className={styles.img}
            src="https://cdn-public.knowyourself.cc/icon/wechat/icon_arrow_right@3x.png"
          />
        </View>
        {myInfo ? (
          <>
            {/* nick */}
            <View className={styles.me_nick}>
              <View className={styles.me_nick_l}>
                <Image src={getAvatarUrl(myInfo.avatar) || ''} className={styles.me_nick_l_icon} />
              </View>
              <View className={styles.me_nick_r}>
                <Text className={styles.me_nick_r_t}>{myInfo.name}</Text>
                <View className={styles.me_nick_r_b}>
                  ID：{myInfo.id}
                  <Image
                    src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/liaoyu/icon_copy_20230330.png"
                    className={styles.me_nick_r_b_icon}
                    onClick={() => this.handleCopy(myInfo.id)}
                  />
                </View>
              </View>
            </View>
            {/* 退出登录 */}
            <View className={styles.logout}>
              <View
                className={styles.text}
                onClick={() => {
                  Taro.showModal({
                    title: '提示',
                    confirmText: '确认',
                    cancelText: '取消',
                    content: '是否退出登录？',
                    success: (res) => {
                      if (res.confirm) {
                        Taro.clearStorageSync();
                        Taro.reLaunch({ url: '/pages/login/index' });
                      }
                    },
                  });
                }}
              >
                退出登录
                <Image
                  className={styles.img}
                  src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
                />
              </View>
            </View>
          </>
        ) : null}

        <KYTabBar index={1} />
        {/* <Button
          className={styles.button}
          type="primary"
          onClick={() => {
            Taro.navigateTo({ url: '/subCommon/pages/setting/index' });
          }}
        >
          设置
        </Button> */}
      </KYPage>
    );
  }
}

export default Me;
