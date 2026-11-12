import styles from './index.module.less';
import classnames from 'classnames';
import TencentCloudChat, { Message } from '@tencentcloud/chat';
import { Image, Text, View } from '@tarojs/components';
import AudioMessage from './AudioMessage';
import CustomMessage from './CustomMessage';
import { sTom } from '@/modules/utils/formatting.util';
import { CustomEventIdEnum } from '@/types/im.type';
// import MessageTool from '../MessageTool';
import UserAvatar from '../UserAvatar';
import Taro from '@tarojs/taro';
import storage from '@/modules/utils/storage';
import { USER_INFO } from '@/constants/values';
import { counsellingApi } from '@/services';
import {
  CounsellingDoctorWorkStatusEnum,
  CounsellingServiceCloseEnum,
} from '@ky-client/counselling-type';
import { isFunction } from '@tarojs/shared';

type PropsType = {
  message: Message;
  chatInfo: any;
  initFun: any;
  preViewFun: any;
  freeMessageFun: any;
};

const MsgItem = (props: PropsType) => {
  const { message: msg, chatInfo, initFun, preViewFun, freeMessageFun } = props;
  let cloudCustomData = null as any;
  try {
    if (msg.cloudCustomData) {
      cloudCustomData = JSON.parse(msg.cloudCustomData);
    }
  } catch {
    console.warn('----cloudCustomData----解析失败');
  }

  const isOut = msg.flow === 'out';

  const getMessage = () => {
    switch (msg.type) {
      case TencentCloudChat.TYPES.MSG_TEXT:
        // 文本消息
        return <View className={styles.message}>{msg.payload.text}</View>;
      case TencentCloudChat.TYPES.MSG_IMAGE: {
        // 图片消息
        // 原图
        let originalImage = '';
        let originalImageWidth = '';
        let originalImageHeight = '';
        // 198p压缩图
        let image192 = '';
        // 720p压缩图
        // let image780 = '';
        msg.payload.imageInfoArray.forEach((val: any) => {
          if (val.type === 0) {
            originalImage = val.url;
            originalImageWidth = val.width;
            originalImageHeight = val.height;
          } else if (val.type === 1) {
            image192 = val.url;
          }
        });
        return (
          <Image
            src={image192}
            originalSrc={originalImage}
            onClick={() => {
              preViewFun(originalImage, originalImageWidth, originalImageHeight);
            }}
            fadeIn
            mode="aspectFit"
          />
        );
      }
      case TencentCloudChat.TYPES.MSG_AUDIO:
        // 音频消息
        return <AudioMessage msg={msg} />;
      case TencentCloudChat.TYPES.MSG_CUSTOM:
        // https://cloud.tencent.com/document/product/269/75316#.E5.88.9B.E5.BB.BA.E8.87.AA.E5.AE.9A.E4.B9.89.E6.B6.88.E6.81.AF
        return <CustomMessage msg={msg} />;
      // return <View>自定义消息</View>;
    }
    return null;
  };

  /**
   * 提示消息
   */
  const getTipsMessage = () => {
    let content: React.ReactElement | null = null;
    if (msg.type === TencentCloudChat.TYPES.MSG_CUSTOM) {
      const customData = JSON.parse(msg.payload.data);
      if (customData.eventId === CustomEventIdEnum.callBuySuccess) {
        content = (
          <View className={styles.tipsContent}>
            用户已成功购买即时通话服务
            <Text
              style={{
                color: '#646ED9',
              }}
            >
              {sTom(customData.event.consultSeconds)}
            </Text>
            分钟 ，剩余总通话时长
            <Text
              style={{
                color: '#646ED9',
              }}
            >
              {sTom(customData.event.balance)}
            </Text>
            分钟
          </View>
        );
      } else if (customData.eventId === CustomEventIdEnum.chatServiceStarted) {
        content = <View className={styles.tipsContent}>- 本次服务开始 -</View>;
      } else if (customData.eventId === CustomEventIdEnum.chatServiceEnd) {
        content = <View className={styles.tipsContent}>- 本次服务结束 -</View>;
      } else if (customData.eventId === CustomEventIdEnum.userClosed) {
        content = (
          <View className={styles.tipsContent}>
            用户已主动关闭订单，本次服务结束。剩余未消耗时长的金额，系统将自动退还至对方账户。
          </View>
        );
      } else if (customData.eventId === CustomEventIdEnum.notReplyInService3Minut) {
        content = (
          <View className={styles.tipsContent}>
            {/* 用户已等待超过<Text style={{ color: '#F58B00' }}>3分钟</Text>
            ，你的迟到可能引发用户投诉，请尽快回复用户。 */}
            当前聊愈师可能临时有事无法及时回复，您可以点击
            <Text
              style={{ color: '#F58B00' }}
              onClick={() => {
                const userInfo = storage.getItem(USER_INFO);
                if (
                  chatInfo.doctor.workStatus == CounsellingDoctorWorkStatusEnum.leave ||
                  chatInfo.counsellingService?.serviceUserAliasId !== userInfo.id
                ) {
                  return;
                }
                Taro.showModal({
                  title: '确认关闭服务？',
                  content:
                    '关闭后本次服务结束，未消耗时长金额按实付计算后原路退还（如已使用优惠券不予退回），每天最多可操作关闭服务3次',
                  showCancel: true,
                  cancelText: '取消',
                  confirmText: '确定关闭',
                  success: async (res) => {
                    if (res.confirm) {
                      if (
                        chatInfo &&
                        chatInfo.counsellingService &&
                        chatInfo.counsellingService.serviceId
                      ) {
                        const closeRes = await counsellingApi.CounsellingServiceClose({
                          serviceId: chatInfo.counsellingService.serviceId,
                          closeType: CounsellingServiceCloseEnum.USER_CLOSE,
                          appItemKey: chatInfo.counsellingService.appItemKey,
                        });
                        if (closeRes.code === 0) {
                          Taro.showToast({
                            title: '关闭成功',
                            icon: 'none',
                          });
                          if (isFunction(initFun)) {
                            initFun(chatInfo.doctor.doctorId);
                          }
                        }
                      } else {
                        Taro.showToast({
                          title: '没有在进行中的服务',
                          icon: 'none',
                        });
                      }
                    }
                  },
                  fail: () => {
                    console.log('fail');
                  },
                });
              }}
            >
              关闭服务
            </Text>
            ，系统会自动为您退还本次订单消耗的金额，如您未主动点击关闭服务，系统会持续扣费知道服务时间结束哦~
          </View>
        );
      }
      if (customData.eventId === CustomEventIdEnum.ingLeft3Minute) {
        content = (
          <View className={styles.tipsContent}>
            本次服务还剩3分钟结束，如需继续可点击右上角继续聊愈加时。
          </View>
        );
      } else if (customData.eventId === CustomEventIdEnum.ConsultInstantTextServiceFreeMessage) {
        content = <View className={styles.tipsContent}>聊愈师给您赠送了3条免费消息</View>;
      } else if (customData.eventId === CustomEventIdEnum.doctorClosed) {
        content = (
          <View className={styles.tipsContent}>
            聊愈师已关闭订单，本次服务结束。剩余未消耗时长的金额，系统将自动退还至您的账户。
          </View>
        );
      }
    }
    return content;
  };

  const tipsMessage = getTipsMessage();

  return (
    <View className={classnames(styles.messageWrap, isOut ? styles.flowOut : styles.flowIn)}>
      {
        // 提示消息
        tipsMessage ? (
          <View className={styles.tipsMessage}>{tipsMessage}</View>
        ) : (
          <>
            <UserAvatar msg={msg} chatInfo={chatInfo} />

            <View className={classnames(styles.content, styles[msg.type])} id={msg.ID}>
              <View className={styles.messageBox}>
                {isOut && msg.type !== TencentCloudChat.TYPES.MSG_CUSTOM && (
                  <View className={`${styles.status} ${msg.isPeerRead ? styles.read : ''}`}>
                    {msg.isPeerRead ? '已读' : '未读'}
                  </View>
                )}
                {getMessage()}
              </View>
            </View>
          </>
        )
      }
    </View>
  );
};

export default MsgItem;
