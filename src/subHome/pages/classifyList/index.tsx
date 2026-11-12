import { observer, inject } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import {
  IdentityTagsEnum,
  StaffCoachType,
  StaffZiXunShiType,
  UserStaffType,
} from '@ky-middleground/user-type';
import { KYLoading } from '@/components/KYLoading';
import { homeApi, userApi } from '@/services';
import { serviceTypeOptions, troubleJinGang } from '@/constants/values';

import { SERVICE_STATUS_MAP } from '@/constants';
import classNames from 'classnames';
import { CounsellingItemKeyEnum, CounsellingUserType } from '@ky-client/counselling-type';
import { navigateTo } from '@/utils/navigate';
import { formatPriceNoZero } from '@/utils/util';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYNumber from '@/components/KYNumber';
import { navigateBack } from '@/modules/utils/navigate';
import KYNavigation from '@/components/KYNavigation';
import Taro from '@tarojs/taro';
import KYPage from '@/components/KYPage';
import styles from './index.module.less';

type Props = {};
type States = {
  data: UserStaffType[];
  liaoyuList: CounsellingUserType.DoctorListResponseType[];
};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = { data: [], liaoyuList: [] };
  }
  onLoad(options: any) {
    const { tagId } = options;
    if (tagId) {
      this.getList(tagId);
      console.log(tagId);
    } else {
      navigateBack();
    }
  }
  getList = async (tagId: string) => {
    KYLoading.show();
    const res = await userApi.getStaffListByTagId(tagId);
    if (res.code === 0 && res.data?.staffList.length > 0) {
      const ids: string[] = [];
      res.data.staffList.forEach((item) => {
        if (item.identityTag === 'liaoyushi' && item.aliasId) {
          ids.push(item.aliasId);
        }
      });
      const liaoyuList = await homeApi.getCounsellingDoctorListByIds(ids);
      KYLoading.hide();
      this.setState({ liaoyuList: liaoyuList.data, data: res.data.staffList });
    } else {
      KYLoading.hide();
      Taro.showToast({ title: '获取失败', icon: 'none' });
    }
  };

  /**
   *
   */
  getTags = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach': {
        if (data.data) {
          return (data.data as StaffCoachType).goodAtTags?.map((item, i) => {
            return (
              <Text className={styles.tag} key={i}>
                {item}
              </Text>
            );
          });
        }
        return '';
      }
      case 'liaoyushi': {
        const info =
          this.state.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};

        if (info.characteristic && info.characteristic.length > 0) {
          return info.characteristic.map((item, i) => {
            return (
              <Text className={styles.tag} key={i}>
                {item}
              </Text>
            );
          });
        } else {
          return null;
        }
      }
      case 'zixunshi':
        return (data.data as StaffZiXunShiType)?.certificationList?.map((item, i) => {
          if (i < 3) {
            return (
              <Text className={styles.tag} key={i}>
                {item}
              </Text>
            );
          }
          return null;
        });
    }
  };

  getDesc = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach': {
        if (data.data) {
          return (data.data as StaffCoachType)?.introduction || '';
        }
        return '';
      }

      case 'liaoyushi': {
        const info =
          this.state.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};
        return info.sign;
      }

      case 'zixunshi':
        return (data.data as StaffZiXunShiType)?.profileSummary;
    }
  };

  /**
   * 头像列表的状态
   * 聊愈师 服务状态 可服务 服务中等
   * 教练 服务类型： 家庭关系 亲密关系等
   */
  getStatus = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach': {
        if (data.data) {
          const trouble = (data.data as StaffCoachType).trouble?.[0] ?? '';
          const res = troubleJinGang.find((item) => item.id === trouble);
          return res && res.image ? <Image className={styles.tag} src={res.tag} /> : null;
        }
        return null;
      }

      case 'liaoyushi': {
        const info =
          this.state.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};

        return (
          <View
            className={classNames(styles.state1, {
              [styles.state2]: info.serviceStatus === 3,
              [styles.state3]: info.serviceStatus === 1,
            })}
          >
            {SERVICE_STATUS_MAP.get(info.serviceStatus)}
          </View>
        );
      }

      // case 'zixunshi':
      // return (data.data as StaffZiXunShiType).profileSummary;
    }
  };

  getPrice = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach': {
        if (data.data) {
          return (
            <View className={styles.price}>
              <Text className={styles.priceText}>
                视频
                <Text className={styles.t1}>
                  ￥
                  <KYNumber color="#F85D48">
                    {formatPriceNoZero((data.data as StaffCoachType)?.price || 0)}
                  </KYNumber>
                </Text>
                <Text className={styles.t2}>起</Text>
              </Text>
            </View>
          );
        }
        return;
      }

      case 'liaoyushi': {
        const info =
          this.state.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};

        return (
          <View className={styles.price}>
            {info.powers?.includes(CounsellingItemKeyEnum.JSWZCS) ? (
              <Text className={styles.priceText}>
                对话
                <Text className={styles.t1}>
                  ￥<KYNumber color="#F85D48">{formatPriceNoZero(info.chatMinDot)}</KYNumber>
                </Text>
                <Text className={styles.t2}>起</Text>
              </Text>
            ) : null}

            {info.powers?.includes(CounsellingItemKeyEnum.JSTH) ? (
              <Text className={styles.priceText}>
                通话
                <Text className={styles.t1}>
                  ￥<KYNumber color="#F85D48">{formatPriceNoZero(info.callMinDot)}</KYNumber>
                </Text>
                <Text className={styles.t2}>起</Text>
              </Text>
            ) : null}
          </View>
        );
      }

      case 'zixunshi':
        return (
          <View className={styles.price}>
            {(data.data as StaffZiXunShiType)?.price &&
            (data.data as StaffZiXunShiType).price! > 0 ? (
              <Text className={styles.priceText}>
                咨询
                <Text className={styles.t1}>
                  ￥
                  <KYNumber color="#F85D48">
                    {formatPriceNoZero((data.data as StaffCoachType).price!)}
                  </KYNumber>
                </Text>
                <Text className={styles.t2}>起</Text>
              </Text>
            ) : null}
          </View>
        );
    }
  };

  getBtn = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach':
        return <View className={styles.b}>立即咨询</View>;
      case 'liaoyushi': {
        const info =
          this.state.liaoyuList.filter((item) => data.aliasId === item.userAliasId)[0] || {};
        return (
          <View>
            {['可服务', '服务中'].includes(SERVICE_STATUS_MAP.get(info.serviceStatus) || '') && (
              <View
                className={styles.b}
                onClick={(e) => {
                  this.store.imStore.initChatInfo();
                  e.stopPropagation();
                  navigateTo(`/subCounselling/pages/chat/index?`, {
                    doctorId: data.aliasId,
                  });
                }}
              >
                立即咨询
              </View>
            )}
            {SERVICE_STATUS_MAP.get(info.serviceStatus) === '休息中' && (
              <View
                className={styles.b}
                onClick={(e) => {
                  this.store.imStore.initChatInfo();
                  e.stopPropagation();
                  navigateTo(`/subCounselling/pages/chat/index`, {
                    doctorId: data.aliasId,
                  });
                }}
              >
                给Ta留言
              </View>
            )}
          </View>
        );
      }

      case 'zixunshi':
        return (
          <View
            className={styles.b}
            onClick={(e) => {
              this.store.imStore.initChatInfo();
              e.stopPropagation();

              navigateTo('/subConsultant/pages/chat/index?counselorId=' + data.aliasId);
            }}
          >
            立即咨询
          </View>
        );
    }
  };

  /**
   * 1 教练返回专业咨询类型
   * 2. 聊愈师返回服务人次
   */
  getServiceData = (data: UserStaffType) => {
    switch (data.identityTag) {
      case 'coach': {
        if (data.data) {
          const serviceType = (data.data as StaffCoachType).serviceType || [];
          return (
            <View className={styles.pp}>
              {serviceType.length > 0
                ? serviceType.map((item, i) => {
                    return (
                      <View key={i}>
                        {i + 1 === serviceType.length
                          ? serviceTypeOptions.find((e) => item === e.value)?.label
                          : `${serviceTypeOptions.find((e) => item === e.value)?.label} |`}
                        &nbsp;
                      </View>
                    );
                  })
                : null}
            </View>
          );
        }
        return '';
      }
      case 'liaoyushi': {
        const info =
          this.state.liaoyuList.filter((item) => item.userAliasId === data.aliasId)[0] || {};

        const getServiceCountText = (count: number) => {
          if (count < 100) {
            return '近100';
          }

          // 大于等于100时，按100区间显示
          const divisor = Math.floor(count / 100) * 100;
          return `${divisor}+`;
        };

        return ` 服务人次： ${info.serviceCount ? getServiceCountText(info.serviceCount) : '0'}`;
      }
      case 'zixunshi':
        return `服务时长： ${(data.data as StaffZiXunShiType)?.consultationDuration || 0}`;
    }
  };

  handleClick = (item: UserStaffType) => {
    const id = item.identityTag != 'coach' ? item.aliasId : (item.data as StaffCoachType).coachId;
    console.log(id);

    navigateTo(`/subCommon/pages/userInfo/index?sence=${id}&identity=${item.identityTag}`);
  };

  render() {
    const { data } = this.state;

    return (
      <KYPage className={styles.index}>
        <KYNavigation className={styles.nav} showBack />

        <View className={styles.list}>
          {data.length > 0 ? (
            data.map((item, index) => {
              if (
                item.identityTag === IdentityTagsEnum.zixunshi &&
                !(item.data as StaffZiXunShiType)
              ) {
                return null;
              }
              return (
                <View className={styles.item} key={index} onClick={() => this.handleClick(item)}>
                  <View className={styles.left}>
                    <Image className={styles.avatar} src={item.avatar || ''} mode="aspectFill" />
                    {this.getStatus(item)}
                  </View>
                  <View className={styles.right}>
                    <View className={styles.name}>{item.name}</View>
                    <View className={styles.count}>{this.getServiceData(item)}</View>
                    <View className={styles.tags}>{this.getTags(item)}</View>
                    <View className={styles.desc}>{this.getDesc(item)}</View>

                    {item.identityTag === 'coach' && item.data ? (
                      <View className={styles.p}>
                        {(item.data as StaffCoachType).briefIntroduction}
                      </View>
                    ) : null}

                    <View className={styles.btn}>
                      {this.getPrice(item)}
                      {this.getBtn(item)}
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View className={styles.noData}>
              <Image
                className={styles.img}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/empty_img_20230321.png"
              />
              <View className={styles.text}>暂无数据</View>
            </View>
          )}
        </View>
      </KYPage>
    );
  }
}

export default Index;
