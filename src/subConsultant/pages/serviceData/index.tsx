import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { observer, inject } from 'mobx-react';
import KYNavigation from '@/components/KYNavigation';
import { View, Image } from '@tarojs/components';
// 心理咨询业务下线：相关条目隐藏期间暂未使用，恢复时一并打开
// import classNames from 'classnames';
import { consultantApi } from '@/services';
import { navigateTo } from '@/utils/navigate';
import styles from './index.module.less';

type Props = {};
type States = {
  isExit: boolean;
};

@inject('store')
@observer
class CounsellInfo extends BaseKyComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isExit: false,
    };
  }
  async onLoad() {
    const res = await consultantApi.getExistConsultationPersonalInfo();
    if (res.code == 0) {
      this.setState({ isExit: res.data.isExist });
    }
  }

  render() {
    return (
      <KYPage className={styles.pages}>
        <KYNavigation showBack className={styles.back} />
        {/* 心理咨询业务下线：来访者信息（个人心理咨询档案）隐藏 */}
        {/* <View className={styles.title}>来访者信息</View>
        <View className={styles.item}>
          <View className={styles.txt}>个人心理咨询档案</View>
          <View
            className={classNames({ [styles.status]: true, [styles.noOk]: !this.state.isExit })}
            onClick={() => {
              // Taro.navigateTo({ url: '/subConsultant/pages/counselInfo/index' });
              navigateTo('/subConsultant/pages/counselInfo/index');
            }}
          >
            {this.state.isExit ? '已完善' : '待完善'}
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
        </View> */}
        <View className={styles.title}>我签署的协议</View>
        {/* 心理咨询业务下线：心理咨询服务协议隐藏 */}
        {/* <View className={styles.item}>
          <View className={styles.txt}>心理咨询服务协议</View>
          <View
            className={styles.status}
            onClick={() => {
              // Taro.navigateTo({
              //   url: '/subWebview/pages/md/index?protocolId=zixunfuwuxieyi',
              // });
              navigateTo('/subWebview/pages/md/index?protocolId=zixunfuwuxieyi');
            }}
          >
            {this.state.isExit ? '已签署' : '待签署'}
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
        </View> */}
        {/* 心理咨询业务下线：心理咨询服务知情同意书隐藏 */}
        {/* <View
          className={styles.item}
          onClick={() => {
            // Taro.navigateTo({
            //   url: '/subWebview/pages/md/index?protocolId=zixunfuwuzhiqingtongyishu',
            // });
            navigateTo('/subWebview/pages/md/index?protocolId=zixunfuwuzhiqingtongyishu');
          }}
        >
          <View className={styles.txt}>心理咨询服务知情同意书</View>
          <View className={styles.status}>
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
        </View> */}
        <View
          className={styles.item}
          onClick={() => {
            // Taro.navigateTo({
            //   url: '/subWebview/pages/md/index?protocolId=newzhiqingfuwutongyishu',
            // });
            navigateTo('/subWebview/pages/md/index?protocolId=newzhiqingfuwutongyishu');
          }}
        >
          <View className={styles.txt}>即时咨询（聊愈）服务知情同意书</View>
          <View className={styles.status}>
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
        </View>
        <View
          className={styles.item}
          onClick={() => {
            navigateTo('/subWebview/pages/md/index?protocolId=xinlijiaolianfuwuxieyi');
          }}
        >
          <View className={styles.txt}>心理教练服务协议</View>
          <View className={styles.status}>
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
        </View>
        <View
          className={styles.item}
          onClick={() => {
            navigateTo('/subWebview/pages/md/index?protocolId=xinlijiaolianzhiqingtongyishu');
          }}
        >
          <View className={styles.txt}>心理教练服务知情同意书</View>
          <View className={styles.status}>
            <Image
              className={styles.img}
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
            />
          </View>
        </View>
      </KYPage>
    );
  }
}

export default CounsellInfo;
