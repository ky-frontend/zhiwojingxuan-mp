import BaseKyComponent from '@/components/BaseKyComponent';
import { View } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';

type Props = {
  sty?: {};
  coachInfo: any;
};
type States = {};

@inject('store')
@observer
class CoachIntroduction extends BaseKyComponent<Props, States> {
  state = {};

  render() {
    const { coachInfo } = this.props;

    return (
      <View className={styles.CounselorInfo}>
        {/* 擅长领域 */}
        {coachInfo.goodAtTags.length ? (
          <View className={styles.t_p}>
            <View className={styles.t}>擅长领域</View>
            <View className={styles.liupai}>
              {coachInfo.goodAtTags.map((item: any) => {
                return (
                  <View className={styles.ll} key={item.id}>
                    {item}
                  </View>
                );
              })}
            </View>

            <View className={styles.pp}>{coachInfo.goodAtText}</View>
          </View>
        ) : null}

        {/* 我的专业背景 */}
        {coachInfo?.major &&
        (coachInfo.major.qualification ||
          coachInfo.major.education ||
          coachInfo.major.training ||
          coachInfo.major.workExperience) ? (
          <View className={styles.t_p}>
            <View className={styles.t}>我的专业背景</View>
            {coachInfo.major.qualification ? (
              <View className={styles.zizhi}>
                <View className={styles.tag}>专业资质</View>
                <View className={styles.p}>{coachInfo.major?.qualification}</View>
              </View>
            ) : null}
            {coachInfo.major.education ? (
              <View className={styles.changqiView}>
                <View className={styles.changqi}>
                  <View className={styles.tag}>学历背景</View>
                  <View className={styles.p}>{coachInfo.major?.education}</View>
                </View>
              </View>
            ) : null}

            {coachInfo.major.training ? (
              <View className={styles.duanqiView}>
                <View className={styles.changqi}>
                  <View className={styles.tag}>受训背景</View>
                  <View className={styles.p}>{coachInfo.major?.training}</View>
                </View>
              </View>
            ) : null}

            {coachInfo.major.workExperience ? (
              <View className={styles.duanqiView}>
                <View className={styles.changqi}>
                  <View className={styles.tag}>心理学相关工作经历</View>
                  <View className={styles.p}>{coachInfo.major?.workExperience}</View>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* 个人经验 */}
        {coachInfo?.experience ? (
          <View className={styles.t_p}>
            <View className={styles.t}>个人经验</View>
            <View className={styles.pp}>{coachInfo.experience}</View>
          </View>
        ) : null}

        {/* 我想对你说 */}
        {coachInfo?.summary ? (
          <View className={styles.t_p}>
            <View className={styles.t}>我想对你说</View>
            <View className={styles.pp}>{coachInfo.summary}</View>
          </View>
        ) : null}

        {/* 我的服务特色 */}
        {coachInfo?.features ? (
          <View className={styles.t_p} style={{ marginBottom: '0px' }}>
            <View className={styles.t}>我的服务特色</View>
            <View className={styles.pp}>{coachInfo.features}</View>
          </View>
        ) : null}
      </View>
    );
  }
}

export default CoachIntroduction;
