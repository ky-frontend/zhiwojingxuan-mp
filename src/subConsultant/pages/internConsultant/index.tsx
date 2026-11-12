import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { KYLoading } from '@/components/KYLoading';
// import Taro from '@tarojs/taro';
import { navigateTo } from '@/utils/navigate';
import { CounselorIdentityEnum } from '@/types/common.type';
import KYNavigation from '@/components/KYNavigation';
import { View, Image } from '@tarojs/components';
import { consultantApi } from '@/services';
import KYNumber from '@/components/KYNumber';
import { formatPrice, getAvatarUrl } from '@/utils/util';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';
// import KYLoading from '@/components/KYLoading';

type IProps = {};
type IState = {
  internList: any[];
  loading: boolean;
};

@inject('store')
@observer
class InternConsultant extends BaseKyComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      internList: [],
      loading: true,
    };
  }
  onLoad(): void {
    this.getInterConsultantList();
  }

  getInterConsultantList = async () => {
    KYLoading.show();
    const res = await consultantApi.getConsultantInternshipList();
    KYLoading.hide();
    if (res.code === 0 && res.data.length > 0) {
      this.setState({ internList: res.data });
    }
    this.setState({ loading: false });
  };

  render() {
    const { internList, loading } = this.state;
    if (loading) {
      return;
    }
    return (
      <KYPage className={styles.InternConsultant}>
        <KYNavigation showBack title="实习心理咨询师" className={styles.MyOrder_navBg} />
        <View className={styles.content}>
          {internList.length > 0 ? (
            internList.map((item, index) => {
              return (
                <View
                  className={styles.item}
                  key={index}
                  onClick={() => {
                    // Taro.navigateTo({
                    //   url: `/subCommon/pages/userInfo/index?sence=${item.counselorId}&identity=${CounselorIdentityEnum.Consultant}`,
                    // });
                    navigateTo(
                      `/subCommon/pages/userInfo/index?sence=${item.counselorId}&identity=${CounselorIdentityEnum.Consultant}`,
                    );
                  }}
                >
                  <View className={styles.avatar}>
                    <Image
                      className={styles.img}
                      src={getAvatarUrl(item.avatar)}
                      mode="widthFix"
                    ></Image>
                  </View>
                  <View className={styles.info}>
                    <View className={styles.name}>
                      {item.nickName}
                      <Image
                        className={styles.tag}
                        src="https://cdn-public.knowyourself.cc/icon/consultant/20240517_intern.png"
                      ></Image>
                    </View>
                    <View className={styles.p}>
                      {item.certificationList.length > 0 ? item.certificationList[0] : ''}
                    </View>
                    <View className={styles.desc}>{item.profileSummary}</View>
                    <View className={styles.footer}>
                      <View className={styles.p1}>{item.consultationProcess}</View>
                      <View className={styles.p2}>
                        <View className={styles.t}>¥</View>
                        <KYNumber color="#F85D48" style={{ fontSize: '15px' }}>
                          {formatPrice(item.price)}
                        </KYNumber>
                        <View className={styles.text}>/次</View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View className={styles.empty}>
              <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/empty_img_20230321.png"
              ></Image>
              暂无更多数据
            </View>
          )}
        </View>
      </KYPage>
    );
  }
}

export default InternConsultant;
