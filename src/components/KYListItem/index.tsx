import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import { StaffCoachType, StaffLiaoYuShiType, StaffZiXunShiType } from '@ky-middleground/user-type';
import { SERVICE_STATUS_MAP } from '@/constants';
import classNames from 'classnames';
import { CounsellingItemKeyEnum } from '@ky-client/counselling-type';
import { navigateTo } from '@/utils/navigate';
import { formatPriceNoZero } from '@/utils/util';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';
import KYNumber from '../KYNumber';

type Props = {
  identify: 'coach' | 'liaoyushi' | 'zixunshi';
  onClick?: () => void;
  data: StaffLiaoYuShiType | StaffZiXunShiType | StaffCoachType;
};
type States = {};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  getTags = () => {
    const { identify, data } = this.props;
    switch (identify) {
      case 'coach':
        return (
          <View className={styles.tags}>
            {(data as StaffCoachType).goodAtTags.map((item, index) => {
              return (
                <View key={index} className={styles.tag}>
                  {item}
                </View>
              );
            })}
          </View>
        );

      case 'liaoyushi':
        return (
          <View className={styles.tags}>
            {(data as StaffLiaoYuShiType).characteristic.map((item, index) => {
              return (
                <View key={index} className={styles.tag}>
                  {item}
                </View>
              );
            })}
          </View>
        );

      case 'zixunshi':
        return (
          <View className={styles.tags}>
            {(data as StaffZiXunShiType).certificationList.map((item, index) => {
              return (
                <View key={index} className={styles.tag}>
                  {item}
                </View>
              );
            })}
          </View>
        );
    }
  };

  getDesc = () => {
    const { identify, data } = this.props;
    switch (identify) {
      case 'coach':
        return (data as StaffCoachType).introduction;

      case 'liaoyushi':
        return (data as StaffLiaoYuShiType).userSign;

      case 'zixunshi':
        return (data as StaffZiXunShiType).profileSummary;
    }
  };

  getStatus = () => {
    const { identify, data } = this.props;
    switch (identify) {
      case 'coach':
        return (data as StaffCoachType).introduction;

      case 'liaoyushi':
        return (
          <View
            className={classNames(styles.state1, {
              [styles.state2]: (data as StaffLiaoYuShiType).serviceStatus === 3,
              [styles.state3]: (data as StaffLiaoYuShiType).serviceStatus === 1,
            })}
          >
            {SERVICE_STATUS_MAP.get((data as StaffLiaoYuShiType).serviceStatus)}
          </View>
        );

      case 'zixunshi':
        return (data as StaffZiXunShiType).profileSummary;
    }
  };

  getPrice = () => {
    const { identify, data } = this.props;

    switch (identify) {
      case 'coach':
        return (data as StaffCoachType).introduction;

      case 'liaoyushi':
        return (
          <View className={styles.price}>
            {(data as StaffLiaoYuShiType).products.findIndex(
              (item) => item.appItemKey === CounsellingItemKeyEnum.JSWZCS,
            ) !== -1 ? (
              <Text className={styles.priceText}>
                对话
                <Text className={styles.t1}>
                  ￥
                  <KYNumber color="#F85D48">
                    {formatPriceNoZero(
                      (data as StaffLiaoYuShiType).products.find(
                        (item) => item.appItemKey === CounsellingItemKeyEnum.JSWZCS,
                      )?.money || 0,
                    )}
                  </KYNumber>
                </Text>
                <Text className={styles.t2}>起</Text>
              </Text>
            ) : null}

            {(data as StaffLiaoYuShiType).products.findIndex(
              (item) => item.appItemKey === CounsellingItemKeyEnum.JSTH,
            ) !== -1 ? (
              <Text className={styles.priceText}>
                通话
                <Text className={styles.t1}>
                  ￥
                  <KYNumber color="#F85D48">
                    {formatPriceNoZero(
                      (data as StaffLiaoYuShiType).products.find(
                        (item) => item.appItemKey === CounsellingItemKeyEnum.JSWZCS,
                      )?.money || 0,
                    )}
                  </KYNumber>
                </Text>
                <Text className={styles.t2}>起</Text>
              </Text>
            ) : null}
          </View>
        );

      case 'zixunshi':
        return (data as StaffZiXunShiType).profileSummary;
    }
  };

  getBtn = () => {
    const { identify, data } = this.props;
    switch (identify) {
      case 'coach':
        return (data as StaffCoachType).introduction;

      case 'liaoyushi':
        return (
          <>
            {['可服务', '服务中'].includes(
              SERVICE_STATUS_MAP.get((data as StaffLiaoYuShiType).serviceStatus) || '',
            ) && (
              <View
                className={styles.b}
                onClick={(e) => {
                  this.store.imStore.initChatInfo();
                  e.stopPropagation();

                  navigateTo(`/subCounselling/pages/chat/index?`, {
                    doctorId: (data as StaffLiaoYuShiType).aliasId,
                  });
                }}
              >
                立即咨询
              </View>
            )}

            {SERVICE_STATUS_MAP.get((data as StaffLiaoYuShiType).serviceStatus) === '休息中' && (
              <View
                className={styles.b}
                onClick={(e) => {
                  this.store.imStore.initChatInfo();
                  e.stopPropagation();
                  navigateTo(`/subCounselling/pages/chat/index`, {
                    doctorId: (data as StaffLiaoYuShiType).aliasId,
                  });
                }}
              >
                给Ta留言
              </View>
            )}
          </>
        );

      case 'zixunshi':
        return (data as StaffZiXunShiType).profileSummary;
    }
  };

  render() {
    const { data, identify } = this.props;
    return (
      <View className={styles.item}>
        <View className={styles.left}>
          <Image className={styles.avatar} src={data.avatar} />
          {this.getStatus()}
        </View>
        <View className={styles.right}>
          <View className={styles.name}>{data.name}</View>
          <View className={styles.count}>服务人次：1000+</View>
          {/* {this.get} */}

          {this.getTags()}
          <View className={styles.desc}>{this.getDesc()}</View>

          {identify === 'coach' ? (
            <View className={styles.p}>{(data as StaffCoachType).briefIntroduction}</View>
          ) : null}

          <View className={styles.btn}>
            {this.getPrice()}
            {this.getBtn()}
          </View>
        </View>
      </View>
    );
  }
}

export default Index;
