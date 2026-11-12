import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image, Text } from '@tarojs/components';
import KYNumber from '@/components/KYNumber';
import { StaffCoachType, StaffZiXunShiType, UserStaffType } from '@ky-middleground/user-type';
import { navigateTo } from '@/modules/utils/navigate';
import { CounsellingItemKeyEnum, CounsellingUserType } from '@ky-client/counselling-type';
import { formatPrice, ImgUrlFormat } from '@/modules/utils/format';
import { serviceTypeOptions } from '@/constants/values';
import styles from './index.module.less';

type IProps = {
  data: {
    tagId: string;
    tagName: string;
    staffList: UserStaffType[];
  }[];
  liaoyuList: CounsellingUserType.DoctorListResponseType[];
};
type IState = {};
@inject('store')
@observer
class StaffIndex extends BaseKyComponent<IProps, IState> {
  /**
   * 1 教练返回专业咨询类型
   * 2. 聊愈师返回服务人次
   */
  getServiceData = (data: UserStaffType) => {
    const { liaoyuList } = this.props;
    switch (data.identityTag) {
      case 'coach': {
        const serviceType = (data.data as StaffCoachType).serviceType || [];
        return (
          <View className={styles.p}>
            {serviceType.length > 0
              ? serviceType.map((item, i) => {
                  return (
                    <View key={i}>
                      {i + 1 === serviceType.length
                        ? serviceTypeOptions.find((e) => item === e.value)?.label.split('服务')[0]
                        : `${serviceTypeOptions.find((e) => item === e.value)?.label.split('服务')[0]} |`}
                      &nbsp;
                    </View>
                  );
                })
              : null}
          </View>
        );
      }
      case 'liaoyushi': {
        const info = liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};

        const getServiceCountText = (count: number) => {
          if (count < 100) {
            return '近100';
          }

          // 大于等于100时，按100区间显示
          const divisor = Math.floor(count / 100) * 100;
          return `${divisor}+`;
        };

        return `服务人次: ${info.serviceCount ? getServiceCountText(info.serviceCount) : '0'}`;
      }
      case 'zixunshi':
        return `服务时长： ${(data.data as StaffZiXunShiType).consultationDuration}`;
    }
  };
  list = [1, 2, 3];

  getTags = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach':
        return (data.data as StaffCoachType).goodAtTags?.map((item, i) => {
          return (
            <Text className={styles.tagText} key={i}>
              {item}
            </Text>
          );
        });
      case 'liaoyushi': {
        const info =
          this.props.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};

        if (info.characteristic && info.characteristic.length > 0) {
          return info.characteristic.map((item, i) => {
            return (
              <Text className={styles.tagText} key={i}>
                {item}
              </Text>
            );
          });
        } else {
          return null;
        }
      }
      case 'zixunshi':
        return (data.data as StaffZiXunShiType).certificationList?.map((item, i) => {
          return (
            <Text className={styles.tagText} key={i}>
              {item}
            </Text>
          );
        });
    }
  };

  getPrice = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach':
        return formatPrice((data.data as StaffCoachType).price || 0, 0);
      case 'liaoyushi': {
        const info =
          this.props.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};

        let price = 0;
        if (info.callMinDot && info.chatMinDot) {
          price = Math.min(info.callMinDot, info.chatMinDot);
        } else if (info.callMinDot) {
          price = info.callMinDot;
        } else if (info.chatMinDot) {
          price = info.chatMinDot;
        }

        return formatPrice(price, 0);
      }
      case 'zixunshi':
        return formatPrice((data.data as StaffZiXunShiType).price || 0, 0);
    }
  };

  getType = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach':
        return '视频';
      case 'liaoyushi': {
        const info =
          this.props.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};
        const textElements: string[] = [];
        if (info.powers?.includes(CounsellingItemKeyEnum.JSWZCS)) {
          textElements.push('对话');
        }
        if (info.powers?.includes(CounsellingItemKeyEnum.JSTH)) {
          textElements.push('通话');
        }
        const text = textElements.join('/');
        return text;
      }
      case 'zixunshi':
        return (data.data as StaffZiXunShiType).consultationProcessV2;
    }
  };

  render() {
    const { data } = this.props;
    const length = this.list.length;
    return (
      <View className={styles.pages}>
        {data?.map((item, index) => (
          <View
            className={styles.index}
            key={index}
            style={{
              background: index === 0 ? 'linear-gradient(to bottom, #d8d9fe, #f5f6ff)' : '',
            }}
          >
            <View className={styles.title}>
              <Text className={styles.t}>{item.tagName}</Text>
              <View
                className={styles.m}
                onClick={() => {
                  navigateTo('/subHome/pages/classifyList/index', { tagId: item.tagId });
                }}
              >
                更多
                <Image
                  className={styles.img}
                  src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_arr.png"
                />
              </View>
            </View>
            <View className={styles.list}>
              {item.staffList.map((element: any, i) => {
                return (
                  <View
                    className={styles.card}
                    key={i}
                    onClick={() => {
                      const id =
                        element.identityTag != 'coach'
                          ? element.aliasId
                          : (element.data as StaffCoachType).coachId;

                      navigateTo(
                        `/subCommon/pages/userInfo/index?sence=${id}&identity=${element.identityTag}&userAliasId=${element.aliasId}`,
                      );
                    }}
                  >
                    <View className={styles.info}>
                      <View className={styles.left}>
                        <Image
                          className={styles.avatar}
                          src={ImgUrlFormat.imagesLimFunc(element.avatar || '')}
                        />
                      </View>
                      <View className={styles.right}>
                        <View className={styles.name}>{element.name}</View>
                        <View className={styles.t}>个人简介 ›</View>
                        <View className={styles.count}>{this.getServiceData(element)}</View>
                      </View>
                    </View>
                    <View
                      className={styles.tag}
                      style={{ paddingBottom: length % 2 === 0 ? '28px' : '8px' }}
                    >
                      {this.getTags(element)}
                    </View>
                    <View className={styles.b}>
                      <View className={styles.price}>
                        ¥
                        <KYNumber color="#F85E49" type="Bold">
                          {this.getPrice(element)}
                        </KYNumber>
                        <Text className={styles.unit}>起</Text>
                      </View>
                      <View className={styles.t}>{this.getType(element)}</View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    );
  }
}

export default StaffIndex;
