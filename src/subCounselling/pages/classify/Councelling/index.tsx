import { observer, inject } from 'mobx-react';
import KYNumber from '@/components/KYNumber';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image } from '@tarojs/components';
import { CounsellingItemKeyEnum, CounsellingUserType } from '@ky-client/counselling-type';
import { SERVICE_STATUS_MAP } from '@/constants/index';
import { formatPriceNoZero } from '@/utils/util';
import { CounselorIdentityEnum } from '@/types/common.type';
import classNames from 'classnames';
import { navigateTo } from '@/utils/navigate';
import styles from './index.module.less';

type ClassifyProps = {
  list: CounsellingUserType.DoctorListResponseType[];
};

type ClassifyState = {};

@inject('store')
@observer
class CounsellingClassify extends BaseKyComponent<ClassifyProps, ClassifyState> {
  // 找到最大优惠
  maxCoupon = (item: CounsellingUserType.DoctorListResponseType) => {
    const hasChat = item.powers.includes(CounsellingItemKeyEnum.JSWZCS);
    const hasCall = item.powers.includes(CounsellingItemKeyEnum.JSTH);
    const chatCoup = item.coupon?.jswzcs;
    const callCoup = item.coupon?.jsth;
    if (hasChat && !hasCall) {
      // 有文字权限
      return chatCoup;
    }

    if (hasCall && !hasChat) {
      // 有通话权限
      return callCoup;
    }

    // 如果两个都有，则返回最大的
    if (chatCoup && callCoup) {
      return chatCoup.amount > callCoup.amount ? chatCoup : callCoup;
    }

    // 返回不为空的那个
    return chatCoup || callCoup || null;
  };

  updateCouponTxt = (item: CounsellingUserType.DoctorListResponseType) => {
    const discount = this.maxCoupon(item);
    if (discount) {
      const thresholdText =
        discount.threshold > 0 ? `满${formatPriceNoZero(discount.threshold)}` : '无门槛';
      return `${thresholdText}减${formatPriceNoZero(discount.amount)}`;
    }
    return null;
  };

  handleChat = (e, item: CounsellingUserType.DoctorListResponseType) => {
    this.store.imStore.initChatInfo();
    e.stopPropagation();
    // Taro.navigateTo({
    //   url: `/subCounselling/pages/chat/index?doctorId=${item.doctorId}`,
    // });
    navigateTo(`/subCounselling/pages/chat/index?doctorId=${item.doctorId}`);
  };

  isDiscount = (item: CounsellingUserType.DoctorListResponseType) => {
    // 文字
    let chatDiscountPrice = 0;
    let chatDiscountTxt = '';
    // 通话
    let callDiscountPrice = 0;
    let callDiscountTxt = '';

    const isChatDiscount =
      item?.chatActivity?.type === 'CounsellingDiscountActivity' &&
      item?.chatActivity?.minPayPrice < item.chatMinDot;
    const isCallDiscount =
      item?.callActivity?.type === 'CounsellingDiscountActivity' &&
      item?.callActivity?.minPayPrice < item.callMinDot;

    if (isChatDiscount) {
      chatDiscountPrice = item.chatActivity?.minPayPrice ?? item.chatMinDot;
      const discountNum = item.chatActivity?.discountActivity?.discount || 0;
      chatDiscountTxt = `${discountNum * 0.1}折`;
    }
    if (isCallDiscount) {
      callDiscountPrice = item.callActivity?.minPayPrice ?? item.callMinDot;
      const discountNum = item.callActivity?.discountActivity?.discount || 0;
      callDiscountTxt = `${discountNum * 0.1}折`;
    }

    return {
      isChatDiscount,
      isCallDiscount,
      chatDiscountPrice,
      chatDiscountTxt,
      callDiscountPrice,
      callDiscountTxt,
    };
  };

  getServiceCountText = (count: number) => {
    if (count < 100) {
      return '近100';
    }
    // 大于等于100时，按100区间显示
    const divisor = Math.floor(count / 100) * 100;
    return `${divisor}+`;
  };

  render() {
    const { list } = this.props;

    return (
      <View className={styles.classifyJingGang}>
        {/* 金刚 - 分类 */}
        <View className={styles.doctorList}>
          {list.map((item, index) => {
            return (
              <View
                className={styles.lysCell}
                key={index + '_liaoyu'}
                onClick={(e) => this.handleChat(e, item)}
              >
                <View className={styles.lysCellLeft}>
                  <Image
                    src={item.userAliasCounsellingData.avatar}
                    className={styles.avatar}
                    onClick={(e) => {
                      // 埋点: 聊愈师卡片头像点击

                      e.stopPropagation();
                      // Taro.navigateTo({
                      //   url: `/subCommon/pages/userInfo/index?sence=${item.doctorId}&identity=${CounselorIdentityEnum.Counselling}`,
                      // });
                      navigateTo(`/subCommon/pages/userInfo/index?`, {
                        sence: item.doctorId,
                        identity: CounselorIdentityEnum.Counselling,
                        userAliasId: item.userAliasId,
                      });
                    }}
                  />
                  <View
                    className={classNames(styles.state1, {
                      [styles.state2]: item.serviceStatus === 3,
                      [styles.state3]: item.serviceStatus === 1,
                    })}
                  >
                    {SERVICE_STATUS_MAP.get(item.serviceStatus)}
                  </View>
                </View>
                <View className={styles.lysCellRight}>
                  <View className={styles.nickview}>
                    <View className={styles.nick}>{item.userAliasCounsellingData.nickName}</View>
                    <Image
                      src={this.store.platformStore.tagLabel.liaoyushi.small.url}
                      className={styles.tag}
                    />
                    <View className={styles.num}>
                      服务人次:{' '}
                      {item.serviceCount ? this.getServiceCountText(item.serviceCount) : '0'}
                    </View>
                  </View>
                  {/* 服务特色 */}
                  <View className={styles.tagsview}>
                    {item.characteristic.map((item2, i) => (
                      <View className={styles.tag} key={i}>
                        {item2}
                      </View>
                    ))}
                  </View>
                  <View className={styles.desc}>{item.sign}</View>

                  {/* 即时活动  */}
                  <View className={styles.priceview}>
                    {item.powers.includes(CounsellingItemKeyEnum.JSWZCS) && (
                      <>
                        <View className={styles.p1}>对话</View>
                        <KYNumber
                          className={styles.price}
                          color={this.isDiscount(item).isChatDiscount ? '#F85D48' : '#000'}
                        >
                          ¥
                          {formatPriceNoZero(
                            this.isDiscount(item).isChatDiscount
                              ? this.isDiscount(item).chatDiscountPrice
                              : item.chatMinDot,
                          )}
                        </KYNumber>
                        <View className={styles.btn}>起</View>
                        {this.isDiscount(item).isChatDiscount && (
                          <View className={styles.xianshi}>
                            {this.isDiscount(item).chatDiscountTxt}
                          </View>
                        )}
                      </>
                    )}

                    {item.powers.includes(CounsellingItemKeyEnum.JSTH) && (
                      <>
                        <View
                          className={classNames({
                            [styles.p1]: true,
                            [styles.padd]: item.powers.includes(CounsellingItemKeyEnum.JSWZCS),
                          })}
                        >
                          通话
                        </View>
                        <KYNumber
                          className={styles.price}
                          color={this.isDiscount(item).isCallDiscount ? '#F85D48' : '#000'}
                        >
                          ¥
                          {formatPriceNoZero(
                            this.isDiscount(item).isCallDiscount
                              ? this.isDiscount(item).callDiscountPrice
                              : item.callMinDot,
                          )}
                        </KYNumber>
                        <View className={styles.btn}>起</View>
                        {this.isDiscount(item).isCallDiscount && (
                          <View className={styles.xianshi}>
                            {this.isDiscount(item).callDiscountTxt}
                          </View>
                        )}
                      </>
                    )}
                  </View>

                  {this.updateCouponTxt(item) && (
                    <View className={styles.coupon}>
                      <View className={styles.p1}>券</View>
                      <View className={styles.p2}>{this.updateCouponTxt(item)}</View>
                    </View>
                  )}
                </View>
                {SERVICE_STATUS_MAP.get(item.serviceStatus) === '可服务' && (
                  <View className={styles.cellBtn1} onClick={(e) => this.handleChat(e, item)}>
                    立即咨询
                  </View>
                )}
                {SERVICE_STATUS_MAP.get(item.serviceStatus) !== '可服务' && (
                  <View className={styles.cellBtn2} onClick={(e) => this.handleChat(e, item)}>
                    给Ta留言
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}

export default CounsellingClassify;
