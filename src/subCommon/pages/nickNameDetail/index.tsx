import { observer, inject } from 'mobx-react';
import { getAvatarUrl } from '@/utils/util';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Text, Image } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import { KYLoading } from '@/components/KYLoading';
import { userApi } from '@/services';
import { UserAliasTypeAndMobile } from '@ky-middleground/user-type';
import KYNavigation from '@/components/KYNavigation';
import styles from './index.module.less';

interface NickNameDetailState {
  nickVisible: boolean;
  info: UserAliasTypeAndMobile;
}

@inject('store')
@observer
class NickNameDetail extends BaseKyComponent<{}, NickNameDetailState> {
  state = {
    nickVisible: false,
    info: {} as any as UserAliasTypeAndMobile,
  };

  async componentDidMount() {
    console.log('index componentDidMount');
    KYLoading.show();
    const { data: info } = await userApi.getUserAliasInfo();
    KYLoading.hide();
    this.setState({ info });
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

  handleName = () => {
    this.setState({ nickVisible: true });
    setTimeout(() => {
      this.setState({ nickVisible: false });
    }, 2000);
  };

  render() {
    const { nickVisible, info } = this.state;
    return (
      <KYPage className={styles.me_nickName_info}>
        <KYNavigation showBack />

        <View className={styles.me_nickName_info_top}>
          <Text className={styles.me_nickName_info_top_txt}>编辑资料</Text>
          <Image
            src={getAvatarUrl(info.avatar || '') || ''}
            className={styles.me_nickName_info_top_img}
          />
        </View>

        <View className={styles.me_nickName_info_name}>
          <Text className={styles.me_nickName_info_name_l}>昵称</Text>
          <Text className={styles.me_nickName_info_name_r} onClick={this.handleName}>
            {info.name}
          </Text>
        </View>

        {nickVisible && (
          <View className={styles.me_nickName_info_toast}>
            <Text className={styles.me_nickName_info_toast_txt}>前往知我心理APP修改资料 </Text>
          </View>
        )}
      </KYPage>
    );
  }
}

export default NickNameDetail;
