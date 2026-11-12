import { observer, inject } from 'mobx-react';
import KYNumber from '@/components/KYNumber';
import Taro from '@tarojs/taro';
import { replaceTo } from '@/utils/navigate';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image } from '@tarojs/components';
import { CounsellingItemKeyEnum, CounsellingUserType } from '@ky-client/counselling-type';
import { SERVICE_STATUS_MAP } from '@/constants/index';
import { formatPriceNoZero } from '@/utils/util';
import { CounselorIdentityEnum } from '@/types/common.type';
import { KYTrack } from '@/modules/track';
import { T_ConsultantClick, T_ConsultantAvatarClick } from '@/modules/track/events';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import classNames from 'classnames';
import styles from './index.module.less';

type ClassifyJingGangProps = {};

interface ClassifyJingGangState {
  offset: number;
}

// @inject('store')
// @observer
class ClassifyJingGang extends BaseKyComponent<ClassifyJingGangProps, ClassifyJingGangState> {
  $instance = Taro.getCurrentInstance();

  // state = {
  //   offset: 0,
  // };

  // get cistore() {
  //   return this.store.counsellingIndexStore;
  // }

  tabFixedRender = false;
  async onLoad() {
    // this.cistore.counsellingDoctorClassifyList = [];
    // // 调用疗愈师傅分类的列表
    // await this.cistore.getCounsellingDoctorClassifyList({
    //   classifyId: this.$instance.router?.params.classifyId || '',
    //   offset: this.state.offset,
    //   limit: 10,
    // });
    // this.setState({
    //   offset: this.cistore.counsellingDoctorClassifyList.length,
    // });
    // 重定向新的路由
    console.log('重定向');
    // const { classifyId, title } = this.$instance.router?.params as any;
    // Taro.redirectTo({
    //   url: `/subCounselling/pages/classify/index?classifyId=${
    //     this.$instance.router?.params.classifyId || ''
    //   }&title=${this.$instance.router?.params.title}`,
    // });

    // 专门提供聊愈页面的金刚位的跳转
    // type： Coach | Counselling
    // classifyId、title 聊愈业务值
    replaceTo(`/subCounselling/pages/classify/index`, {
      classifyId: this.$instance.router?.params.classifyId || '',
      title: this.$instance.router?.params.title,
      type: 'Counselling',
    });
  }

  // async onReachBottom() {
  //   await this.cistore.getCounsellingDoctorClassifyList({
  //     classifyId: this.$instance.router?.params.classifyId || '',
  //     offset: this.state.offset,
  //     limit: 10,
  //   });

  //   console.log(
  //     'this.cistore.counsellingDoctorClassifyList++++++++',
  //     this.cistore.counsellingDoctorClassifyList,
  //   );
  //   this.setState({
  //     offset: this.cistore.counsellingDoctorClassifyList.length,
  //   });
  // }

  // // 找到最大优惠
  // maxCoupon = (item: CounsellingUserType.DoctorListResponseType) => {
  //   const hasChat = item.powers.includes(CounsellingItemKeyEnum.JSWZCS);
  //   const hasCall = item.powers.includes(CounsellingItemKeyEnum.JSTH);
  //   const chatCoup = item.coupon?.jswzcs;
  //   const callCoup = item.coupon?.jsth;
  //   if (hasChat && !hasCall) {
  //     // 有文字权限
  //     return chatCoup;
  //   }

  //   if (hasCall && !hasChat) {
  //     // 有通话权限
  //     return callCoup;
  //   }

  //   // 如果两个都有，则返回最大的
  //   if (chatCoup && callCoup) {
  //     return chatCoup.amount > callCoup.amount ? chatCoup : callCoup;
  //   }

  //   // 返回不为空的那个
  //   return chatCoup || callCoup || null;
  // };

  // updateCouponTxt = (item: CounsellingUserType.DoctorListResponseType) => {
  //   const discount = this.maxCoupon(item);
  //   if (discount) {
  //     const thresholdText =
  //       discount.threshold > 0 ? `满${formatPriceNoZero(discount.threshold)}` : '无门槛';
  //     return `${thresholdText}减${formatPriceNoZero(discount.amount)}`;
  //   }
  //   return null;
  // };

  // handleChat = (e, item: CounsellingUserType.DoctorListResponseType, index: number) => {
  //   // 埋点: 点击聊愈师卡片
  //   KYTrack(
  //     T_ConsultantClick({
  //       consultant_id: item.doctorId,
  //       consultant_name: item.userAliasCounsellingData.nickName,
  //       consultant_state: (item.serviceStatus as any) || '',
  //       index,
  //       consultant_list_tag: this.$instance.router?.params.title || '',
  //       consultant_list_tagid: this.$instance.router?.params.id || '',
  //       consultant_list_filter_subject_tag: (this.cistore.params.subjectIds as any) || [],
  //       consultant_list_filter_serve_tag: (this.cistore.params.serviceType as any) || '',
  //       consultant_list_filter_rank_tag: (this.cistore.params.sort as any) || '',
  //       consultant_list_filter_more_tag: (this.cistore.params.status as any) || '',
  //     }),
  //   );
  //   this.store.imStore.initChatInfo();
  //   e.stopPropagation();
  //   Taro.navigateTo({
  //     url: `/subCounselling/pages/chat/index?doctorId=${item.doctorId}`,
  //   });
  // };

  // isDiscount = (item: CounsellingUserType.DoctorListResponseType) => {
  //   // 文字
  //   let chatDiscountPrice = 0;
  //   let chatDiscountTxt = '';
  //   // 通话
  //   let callDiscountPrice = 0;
  //   let callDiscountTxt = '';

  //   const isChatDiscount =
  //     item?.chatActivity?.type === 'CounsellingDiscountActivity' &&
  //     item?.chatActivity?.minPayPrice < item.chatMinDot;
  //   const isCallDiscount =
  //     item?.callActivity?.type === 'CounsellingDiscountActivity' &&
  //     item?.callActivity?.minPayPrice < item.callMinDot;

  //   if (isChatDiscount) {
  //     chatDiscountPrice = item.chatActivity?.minPayPrice ?? item.chatMinDot;
  //     const discountNum = item.chatActivity?.discountActivity?.discount || 0;
  //     chatDiscountTxt = `${discountNum * 0.1}折`;
  //   }
  //   if (isCallDiscount) {
  //     callDiscountPrice = item.callActivity?.minPayPrice ?? item.callMinDot;
  //     const discountNum = item.callActivity?.discountActivity?.discount || 0;
  //     callDiscountTxt = `${discountNum * 0.1}折`;
  //   }

  //   return {
  //     isChatDiscount,
  //     isCallDiscount,
  //     chatDiscountPrice,
  //     chatDiscountTxt,
  //     callDiscountPrice,
  //     callDiscountTxt,
  //   };
  // };

  render() {
    // const { title } = this.$instance.router?.params as { id: string; title: string };
    return (
      <></>
      // <KYPage className={styles.classifyJingGang}>
      //   <KYNavigation bgColor="#fff" showBack title={title} />
      //   {/* 金刚 - 分类 */}
      //   <View className={styles.doctorList}>
      //     {this.cistore.counsellingDoctorClassifyList.map((item, index) => {
      //       return (
      //         <View
      //           className={styles.lysCell}
      //           key={index + '_liaoyu'}
      //           onClick={(e) => this.handleChat(e, item, index)}
      //         >
      //           <View className={styles.lysCellLeft}>
      //             <Image
      //               src={item.userAliasCounsellingData.avatar}
      //               className={styles.avatar}
      //               onClick={(e) => {
      //                 // 埋点: 聊愈师卡片头像点击
      //                 KYTrack(
      //                   T_ConsultantAvatarClick({
      //                     consultant_id: item.doctorId,
      //                     consultant_name: item.userAliasCounsellingData.nickName,
      //                     consultant_state: (item.serviceStatus as any) || '',
      //                     index,
      //                     consultant_list_tag: this.$instance.router?.params.title || '',
      //                     consultant_list_tagid: this.$instance.router?.params.id || '',
      //                     consultant_list_filter_subject_tag:
      //                       (this.cistore.params.subjectIds as any) || [],
      //                     consultant_list_filter_serve_tag:
      //                       (this.cistore.params.serviceType as any) || '',
      //                     consultant_list_filter_rank_tag: (this.cistore.params.sort as any) || '',
      //                     consultant_list_filter_more_tag:
      //                       (this.cistore.params.status as any) || '',
      //                   }),
      //                 );
      //                 e.stopPropagation();
      //                 Taro.navigateTo({
      //                   url: `/subCommon/pages/userInfo/index?sence=${item.doctorId}&identity=${CounselorIdentityEnum.Counselling}`,
      //                 });
      //               }}
      //             />
      //             <View
      //               className={classNames(styles.state1, {
      //                 [styles.state2]: item.serviceStatus === 3,
      //                 [styles.state3]: item.serviceStatus === 1,
      //               })}
      //             >
      //               {SERVICE_STATUS_MAP.get(item.serviceStatus)}
      //             </View>
      //           </View>
      //           <View className={styles.lysCellRight}>
      //             <View className={styles.nickview}>
      //               <View className={styles.nick}>{item.userAliasCounsellingData.nickName}</View>
      //               <Image
      //                 src={this.store.platformStore.tagLabel.liaoyushi.small.url}
      //                 className={styles.tag}
      //               />
      //               <View className={styles.num}>
      //                 服务人次:{' '}
      //                 {item.serviceCount < 100
      //                   ? '近100'
      //                   : item.serviceCount <= 500
      //                   ? item.serviceCount
      //                   : '500+'}
      //               </View>
      //             </View>
      //             {/* 服务特色 */}
      //             <View className={styles.tagsview}>
      //               {item.characteristic.map((item2, i) => (
      //                 <View className={styles.tag} key={i}>
      //                   {item2}
      //                 </View>
      //               ))}
      //             </View>
      //             <View className={styles.desc}>{item.sign}</View>

      //             {/* 即时活动  */}
      //             <View className={styles.priceview}>
      //               {item.powers.includes(CounsellingItemKeyEnum.JSWZCS) && (
      //                 <>
      //                   <View className={styles.p1}>文字</View>
      //                   <KYNumber
      //                     className={styles.price}
      //                     color={this.isDiscount(item).isChatDiscount ? '#F85D48' : '#000'}
      //                   >
      //                     ¥
      //                     {formatPriceNoZero(
      //                       this.isDiscount(item).isChatDiscount
      //                         ? this.isDiscount(item).chatDiscountPrice
      //                         : item.chatMinDot,
      //                     )}
      //                   </KYNumber>
      //                   <View className={styles.btn}>起</View>
      //                   {this.isDiscount(item).isChatDiscount && (
      //                     <View className={styles.xianshi}>
      //                       {this.isDiscount(item).chatDiscountTxt}
      //                     </View>
      //                   )}
      //                 </>
      //               )}

      //               {item.powers.includes(CounsellingItemKeyEnum.JSTH) && (
      //                 <>
      //                   <View
      //                     className={classNames({
      //                       [styles.p1]: true,
      //                       [styles.padd]: item.powers.includes(CounsellingItemKeyEnum.JSWZCS),
      //                     })}
      //                   >
      //                     通话
      //                   </View>
      //                   <KYNumber
      //                     className={styles.price}
      //                     color={this.isDiscount(item).isCallDiscount ? '#F85D48' : '#000'}
      //                   >
      //                     ¥
      //                     {formatPriceNoZero(
      //                       this.isDiscount(item).isCallDiscount
      //                         ? this.isDiscount(item).callDiscountPrice
      //                         : item.callMinDot,
      //                     )}
      //                   </KYNumber>
      //                   <View className={styles.btn}>起</View>
      //                   {this.isDiscount(item).isCallDiscount && (
      //                     <View className={styles.xianshi}>
      //                       {this.isDiscount(item).callDiscountTxt}
      //                     </View>
      //                   )}
      //                 </>
      //               )}
      //             </View>

      //             {this.updateCouponTxt(item) && (
      //               <View className={styles.coupon}>
      //                 <View className={styles.p1}>券</View>
      //                 <View className={styles.p2}>{this.updateCouponTxt(item)}</View>
      //               </View>
      //             )}
      //           </View>
      //           {SERVICE_STATUS_MAP.get(item.serviceStatus) === '可服务' && (
      //             <View
      //               className={styles.cellBtn1}
      //               onClick={(e) => this.handleChat(e, item, index)}
      //             >
      //               立即咨询
      //             </View>
      //           )}
      //           {SERVICE_STATUS_MAP.get(item.serviceStatus) !== '可服务' && (
      //             <View
      //               className={styles.cellBtn2}
      //               onClick={(e) => this.handleChat(e, item, index)}
      //             >
      //               给Ta留言
      //             </View>
      //           )}
      //         </View>
      //       );
      //     })}
      //   </View>
      // </KYPage>
    );
  }
}

export default ClassifyJingGang;
