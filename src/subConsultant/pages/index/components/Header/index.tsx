import BaseKyComponent from '@/components/BaseKyComponent';
import { inject, observer } from 'mobx-react';
import { View, Image, Text } from '@tarojs/components';
import { navigateTo, replaceTo } from '@/utils/navigate';
import classNames from 'classnames';
import KYNumber from '@/components/KYNumber';
import Taro from '@tarojs/taro';
// import { consultantApi } from '@/services';
// import { ConsultantBaseEnum } from '@ky-client/consultant-type';
import { CounsellingDoctorWorkStatusEnum } from '@ky-client/counselling-type';
import styles from './index.module.less';

type IConsoltantStateState = {
  // zhuangtai: number;
  // tipBarData: TipBarDataType;
  // isHasData: boolean;
};

// type TipBarDataType = {
//   /** 咨询师Id */
//   counselorId: string;
//   /** 咨询状态 */
//   status: ConsultantBaseEnum.ConsultantTipBarStatusEnum;
//   /** 头像 */
//   avatar: string;
//   /** 昵称 */
//   nickName: string;
//   /** 真名 */
//   realName: string;
//   /** 用户当前服务次数 */
//   userOrderCount: number;
//   /** 咨询预约段Id */
//   scheduleId: string;
//   /** 咨询预约时间 */
//   scheduleTime: number;
//   /** 咨询方式 */
//   consultationProcess?: string;
//   workStatus: number;
// } | null;

@inject('store')
@observer
class ConsoltantState extends BaseKyComponent<{}, IConsoltantStateState> {
  state = {
    // zhuangtai: 4,
    // tipBarData: {
    //   counselorId: '',
    //   status: 0,
    //   avatar: '',
    //   nickName: '',
    //   realName: '',
    //   userOrderCount: 0,
    //   scheduleId: '',
    //   scheduleTime: 0,
    //   consultationProcess: '',
    //   workStatus: 1,
    // },
    // isHasData: false,
  };

  async componentDidMount() {
    this.store.consultantIndexStore.getTipBar();
    // const res = await consultantApi.getConsultantTipBar();
    // if (res.data) {
    //   this.setState({
    //     tipBarData: (res as any).data,
    //     zhuangtai: (res as any).data.status,
    //     isHasData: true,
    //   });
    // }
  }

  convertTimestamp = (timestamp: number) => {
    // 创建一个Date对象，参数是时间戳（单位是毫秒）
    const date = new Date(timestamp);
    // 获取月、日、小时、分钟、星期
    // const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份是从0开始的
    const month = (date.getMonth() + 1).toString(); // 月份是从0开始的
    // const day = date.getDate().toString().padStart(2, '0');
    const day = date.getDate().toString().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    const dayOfWeek = date.getDay();
    const daysOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const week = daysOfWeek[dayOfWeek];

    return { month, day, time, week };
  };

  handleToChat = (counselorId: string, workStatus: number) => {
    if (workStatus === CounsellingDoctorWorkStatusEnum.leave) {
      Taro.showToast({
        title: '该咨询师已离职, 如需继续咨询请更换咨询师',
        icon: 'none',
      });
      return;
    }
    this.store.imStore.initChatInfo();
    // Taro.navigateTo({
    //   url: `/subConsultant/pages/chat/index?counselorId=${counselorId}`,
    // });
    navigateTo('/subConsultant/pages/chat/index?counselorId=' + counselorId);
  };

  render() {
    // const { zhuangtai, tipBarData, isHasData } = this.state;
    const { tipBarData, isHasData } = this.store.consultantIndexStore;
    return (
      <>
        {isHasData ? (
          <View className={styles.header}>
            {tipBarData.map((item, index) => {
              return (
                <View
                  className={classNames(styles.ConsoltantState, {
                    [styles.multi]: tipBarData.length > 1,
                  })}
                  key={index}
                >
                  <Image
                    src="https://cdn-public.knowyourself.cc/icon/consultant/20240621_info.png"
                    className={styles.haveInfo}
                    mode="widthFix"
                  />

                  {/* 角标 */}
                  {tipBarData.length > 1 && (
                    <View className={styles.badge}>
                      <KYNumber style={{ color: '#fff' }} type="Bold">
                        {index + 1}
                      </KYNumber>
                      /
                      <KYNumber style={{ color: '#fff' }} type="Bold">
                        {tipBarData.length}
                      </KYNumber>
                    </View>
                  )}
                  {/* 头部 */}
                  {item.status === 6 ? (
                    <View className={styles.text}>
                      <Text className={styles.t}>待预约下次咨询</Text>
                      <View
                        className={styles.b}
                        onClick={() => this.handleToChat(item.counselorId, item.workStatus)}
                      >
                        联系咨询师
                        <Image
                          src="https://cdn-public.knowyourself.cc/icon/wechat/icon_arrow_right@3x.png"
                          className={styles.img}
                        ></Image>
                      </View>
                    </View>
                  ) : (
                    <View className={styles.time}>
                      <Image
                        className={styles.img}
                        src="https://cdn-public.knowyourself.cc/icon/consultant/rili@3x.png"
                      ></Image>
                      <View className={styles.timeview}>
                        <KYNumber className={classNames(styles.p1)} type="Bold">
                          {this.convertTimestamp(item.scheduleTime).month}
                        </KYNumber>
                        <View className={styles.p2}>月</View>
                        <KYNumber className={styles.p1} type="Bold">
                          {this.convertTimestamp(item.scheduleTime).day}
                        </KYNumber>
                        <View className={styles.p2}>日</View>
                        <View className={classNames(styles.p4)}>
                          {this.convertTimestamp(item.scheduleTime).week}
                        </View>
                        <KYNumber className={classNames(styles.p5)} type="Bold">
                          {this.convertTimestamp(item.scheduleTime).time}
                        </KYNumber>
                        <View className={styles.p3}>（北京时间）</View>
                      </View>
                    </View>
                  )}

                  {/* 未预约 */}
                  {![1, 2, 4, 5, 6].includes(item.status) && (
                    <View className={styles.weiyuyue}>
                      {/* <View className={styles.line}></View> */}
                      <View className={styles.zixunshi}>
                        {/* <Image src={getAvatarUrl(tipBarData.avatar)} className={styles.icon} /> */}
                        <View className={styles.p}>
                          <View className={styles.p1}>咨询师:{item.nickName}</View>
                          {item.userOrderCount > 0 && (
                            // <View className={styles.p2}>与你累计咨询{tipBarData.userOrderCount}次</View>
                            <View className={styles.p2}>为你推荐合适的咨询师</View>
                          )}
                        </View>
                        <View
                          className={styles.btn}
                          onClick={() => this.handleToChat(item.counselorId, item.workStatus)}
                        >
                          立即咨询
                        </View>
                      </View>
                    </View>
                  )}

                  {/* 咨询结束后 */}
                  {item.status == 6 && (
                    <View className={styles.weiyuyue}>
                      {/* <View className={styles.line}></View> */}
                      <View className={styles.zixunshi}>
                        {/* <Image
                        // src="https://cdn-public.knowyourself.cc/icon/consultant/consultant_icon.png"
                        src={getAvatarUrl(tipBarData.avatar)}
                        className={styles.icon}
                      /> */}
                        <View className={styles.p}>
                          <View className={styles.p1}>咨询师:{item.nickName}</View>
                          {item.userOrderCount > 0 && (
                            <View className={styles.p2}>与你累计咨询{item.userOrderCount}次</View>
                          )}
                        </View>
                        <View
                          className={styles.btn}
                          onClick={() => {
                            if (item.workStatus === CounsellingDoctorWorkStatusEnum.leave) {
                              Taro.showToast({
                                title: '该咨询师已离职, 如需继续咨询请更换咨询师',
                                icon: 'none',
                              });
                              return;
                            }

                            // Taro.navigateTo({
                            //   url: `/subConsultant/pages/chooseAppointment/index?id=${item.counselorId}`,
                            // });
                            navigateTo(
                              '/subConsultant/pages/chooseAppointment/index?id=' + item.counselorId,
                            );
                            // this.handleToChat(tipBarData.counselorId, tipBarData.workStatus);
                          }}
                        >
                          立即预约
                        </View>
                      </View>
                    </View>
                  )}

                  {/* 已预约 未完成资料 */}
                  {item.status == 1 && (
                    <View className={classNames(styles.weiyuyue, styles.yiyuyue)}>
                      {/* <View className={styles.line}></View> */}
                      {/* <Image
                      src="https://cdn-public.knowyourself.cc/icon/wechat/20240124_zxkp.png"
                      className={styles.righttopimg}
                    /> */}
                      {/* <View className={styles.timeview}>
                      <KYNumber className={classNames(styles.p1, styles.p11)} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).month}
                      </KYNumber>
                      <View className={styles.p2}>月</View>
                      <KYNumber className={styles.p1} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).day}
                      </KYNumber>
                      <View className={styles.p2}>日</View>
                      <View className={classNames(styles.p2, styles.p21)}>
                        {this.convertTimestamp(tipBarData.scheduleTime).week}
                      </View>
                      <KYNumber className={classNames(styles.p1, styles.p21)} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).time}
                      </KYNumber>
                      <View className={styles.p3}>（北京时间）</View>
                    </View> */}
                      <View className={styles.zixunshi}>
                        {/* <Image
                        // src="https://cdn-public.knowyourself.cc/icon/consultant/consultant_icon.png"
                        src={getAvatarUrl(tipBarData.avatar)}
                        className={styles.icon}
                      /> */}
                        <View className={styles.p}>
                          <View className={styles.p1}>
                            <Text>咨询师:{item.nickName}</Text>
                            {item.userOrderCount > 0 && (
                              <Text className={styles.p11}>第{item.userOrderCount}次咨询</Text>
                            )}
                          </View>
                          <View className={styles.p3}>请在30分钟内完善资料</View>
                        </View>
                        <View
                          className={styles.btn1}
                          onClick={() => {
                            // Taro.navigateTo({ url: '/subConsultant/pages/counselInfo/index' });
                            navigateTo('/subConsultant/pages/counselInfo/index');
                          }}
                        >
                          立即完善
                        </View>
                      </View>
                    </View>
                  )}
                  {/* 已预约 已完成资料 咨询师待确认 */}
                  {item.status == 2 && (
                    <View className={classNames(styles.weiyuyue, styles.yiyuyue)}>
                      {/* <View className={styles.line}></View> */}
                      {/* <Image
                      src="https://cdn-public.knowyourself.cc/icon/wechat/20240124_zxkp.png"
                      className={styles.righttopimg}
                    /> */}
                      {/* <View className={styles.timeview}>
                      <KYNumber className={classNames(styles.p1, styles.p11)} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).month}
                      </KYNumber>
                      <View className={styles.p2}>月</View>
                      <KYNumber className={styles.p1} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).day}
                      </KYNumber>
                      <View className={styles.p2}>日</View>
                      <View className={classNames(styles.p2, styles.p21)}>
                        {this.convertTimestamp(tipBarData.scheduleTime).week}
                      </View>
                      <KYNumber className={classNames(styles.p1, styles.p21)} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).time}
                      </KYNumber>
                      <View className={styles.p3}>（北京时间）</View>
                    </View> */}
                      <View className={styles.zixunshi}>
                        {/* <Image src={getAvatarUrl(tipBarData.avatar)} className={styles.icon} /> */}
                        <View className={styles.p}>
                          <View className={styles.p1}>
                            <Text className={styles.p10}>咨询师:{item.nickName}</Text>
                            {item.userOrderCount > 0 && (
                              <Text className={styles.p11}>第{item.userOrderCount}次咨询</Text>
                            )}
                          </View>
                          <View className={styles.p4}>待咨询师确认</View>
                        </View>
                        <View
                          className={styles.btn}
                          onClick={() => this.handleToChat(item.counselorId, item.workStatus)}
                        >
                          联系咨询师
                        </View>
                      </View>
                    </View>
                  )}
                  {/* 已预约 已完成资料 咨询师已确认 */}
                  {[4, 5].includes(item.status) && (
                    <View className={classNames(styles.weiyuyue, styles.yiyuyue)}>
                      {/* <View className={styles.line}></View>
                    <Image
                      src="https://cdn-public.knowyourself.cc/icon/wechat/20240124_zxkp.png"
                      className={styles.righttopimg}
                    /> */}
                      {/* <View className={styles.timeview}>
                      <KYNumber className={classNames(styles.p1, styles.p11)} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).month}
                      </KYNumber>
                      <View className={styles.p2}>月</View>
                      <KYNumber className={styles.p1} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).day}
                      </KYNumber>
                      <View className={styles.p2}>日</View>
                      <View className={classNames(styles.p2, styles.p21)}>
                        {' '}
                        {this.convertTimestamp(tipBarData.scheduleTime).week}
                      </View>
                      <KYNumber className={classNames(styles.p1, styles.p21)} type="Bold">
                        {this.convertTimestamp(tipBarData.scheduleTime).time}
                      </KYNumber>
                      <View className={styles.p3}>（北京时间）</View>
                    </View> */}
                      <View className={styles.zixunshi}>
                        {/* <Image
                        // src="https://cdn-public.knowyourself.cc/icon/consultant/consultant_icon.png"
                        src={getAvatarUrl(tipBarData.avatar)}
                        className={styles.icon}
                      /> */}
                        <View className={styles.p}>
                          <View className={styles.p1}>
                            <Text className={styles.p10}>咨询师:{item.nickName}</Text>
                            {item.userOrderCount > 0 && (
                              <Text className={styles.p11}>第{item.userOrderCount}次咨询</Text>
                            )}
                          </View>
                          <View
                            className={
                              item.consultationProcessV2 === '视频咨询' ? styles.p2 : styles.p5
                            }
                          >
                            咨询方式:{item.consultationProcessV2}
                          </View>
                          <View
                            className={classNames(styles.p5, {
                              [styles.disappear]: item.consultationProcessV2 === '视频咨询',
                            })}
                          >
                            地址:{item.address}
                          </View>
                        </View>
                        <View
                          className={styles.btn}
                          // onClick={() => {
                          //   this.store.imStore.initChatInfo();
                          //   /**
                          //    * 暂时调试使用跳转
                          //    */
                          //   Taro.navigateTo({
                          //     url: `/subConsultant/pages/chat/index?counselorId=1700475229411301`,
                          //   });
                          // }}
                          onClick={() => this.handleToChat(item.counselorId, item.workStatus)}
                        >
                          联系咨询师
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View className={styles.empty}>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/consultant/20240621_noinfo.png"
              mode="widthFix"
              className={styles.img}
              onClick={() => {
                // Taro.redirectTo({ url: '/subWebview/pages/webviewV1/index?qiyuShuntId=1110579' });
                replaceTo('/subWebview/pages/webviewV1/index?qiyuShuntId=1110579');
              }}
            />
          </View>
        )}
      </>
    );
  }
}
export default ConsoltantState;
