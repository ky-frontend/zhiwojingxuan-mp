import Taro from '@tarojs/taro';
import { Image, View } from '@tarojs/components';
import { CounselorIdentityEnum } from '@/types/common.type';
import { CounsellingDoctorWorkStatusEnum } from '@ky-client/counselling-type';
import { navigateTo } from '@/utils/navigate';
import styles from './index.module.less';

type UserAvatarProps = {
  msg: any;
  chatInfo: any;
};

const UserAvatar = (props: UserAvatarProps) => {
  const { msg, chatInfo } = props;
  const AvatarEle = (
    <View
      className={styles.userAvatar}
      style={{ cursor: msg.flow === 'in' ? 'pointer' : 'default' }}
      onClick={() => {
        if (msg.flow == 'in') {
          if (chatInfo.consultant.workStatus === CounsellingDoctorWorkStatusEnum.leave) {
            Taro.showToast({ title: '该咨询师已离职，如需继续咨询请更换咨询师', icon: 'none' });
            return;
          }
          // Taro.navigateTo({
          //   url: `/subCommon/pages/userInfo/index?sence=${msg.from}&identity=${CounselorIdentityEnum.Consultant}`,
          // });
          navigateTo(
            `/subCommon/pages/userInfo/index?sence=${msg.from}&identity=${CounselorIdentityEnum.Consultant}`,
          );
        }
      }}
    >
      <Image
        src={msg.avatar}
        defaultSource="https://cdn-public.knowyourself.cc/icon/zxs/default_user.png"
      />
    </View>
  );

  return AvatarEle;
};

export default UserAvatar;
