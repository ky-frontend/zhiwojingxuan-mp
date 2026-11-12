import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { reLaunchTo } from '@/utils/navigate';
import KYNavigation from '@/components/KYNavigation';
import Taro from '@tarojs/taro';
import { USER_INFO } from '@/constants/values';
import styles from './index.module.less';

type PageStateProps = {};

interface Index {
  props: PageStateProps;
}

@inject('store')
@observer
class Index extends BaseKyComponent {
  async componentDidMount() {
    const userInfo = Taro.getStorageSync(USER_INFO);

    if (userInfo) {
      const info = JSON.parse(userInfo);
      this.store.imStore.init({
        userID: info.id,
        userSig: info.imSig,
      });
    }
  }
  onLoad() {
    // Taro.redirectTo({ url: '/subCounselling/pages/payPages/index' });
    this.store.platformStore.getTagLabel();

    reLaunchTo('/subCounselling/pages/index/index');
    // reLaunchTo(
    //   '/subCommon/pages/middlePage/index?img=https://cdn-public.knowyourself.cc/newstatic/20250312/channel/kyProduct/1741746467046.jpg&title=123',
    // );

    // Taro.reLaunch({ url: '/subConsultant/pages/index/index' });
    // 登录
  }

  render() {
    // const { testStore } = this.store;
    return (
      <KYPage className={styles.index}>
        <KYNavigation showBack={false} />
        {/* <View className={styles.searchbar}>
          <Image
            src="https://cdn-public.knowyourself.cc/icon/wechat/20231116_search.png"
            className={styles.icon}
          />
          <View className={styles.p}>搜索聊愈师</View>
        </View>
        index {testStore.count}
        <KYNumber>
          {900}-{testStore.count}
        </KYNumber>
        <View>
          <Button
            onClick={() => {
              testStore.addCount();
              KYLoading.show();
              setTimeout(() => {
                Taro.navigateTo({ url: '/moduleExam/pages/classify/index' });
              }, 1000);
            }}
          >
            add
          </Button>
          <Button
            onClick={() => {
              testStore.addCount();
              KYLoading.show();
              setTimeout(() => {
                Taro.navigateTo({ url: '/moduleConsoltant/pages/index/index' });
              }, 1000);
            }}
          >
            add
          </Button>
          <Button
            onClick={() => {
            }}
          >
            add
          </Button>
        </View>
        <Image
          mode="scaleToFill"
          style={{ width: '100px', height: '100px' }}
          src="https://cdn-public.knowyourself.cc/icon/liaoyu/20230715_list_icon_more.png"
        /> */}
      </KYPage>
    );
  }
}

export default Index;
