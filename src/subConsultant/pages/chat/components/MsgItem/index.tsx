import classnames from 'classnames';
import TencentCloudChat, { Message } from '@tencentcloud/chat';
import { Image, Text, View } from '@tarojs/components';
// import AudioMessage from '../AudioMessage';
import { sTom } from '@/modules/utils/formatting.util';
import { CustomEventIdEnum } from '@/types/im.type';
// import MessageTool from '../MessageTool';
import UserAvatar from '../UserAvatar';
// import Taro from '@tarojs/taro';
// import { counsellingApi } from '@/services';
import CustomMessage from './CustomMessage';
import styles from './index.module.less';

type PropsType = {
  message: Message;
  preViewFun: any;
  chatInfo: any;
};

const MsgItem = (props: PropsType) => {
  const { message: msg, preViewFun, chatInfo } = props;
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
        // return <AudioMessage msg={msg} />;
        return <View>{msg.payload.text}</View>;
      case TencentCloudChat.TYPES.MSG_CUSTOM:
        // 自定义消息 - https://web.sdk.qcloud.com/im/doc/v3/zh-cn/Message.html#.CustomPayload
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
      console.log(
        'customData.eventI',
        customData.eventId,
        typeof customData.eventId,
        customData.eventId === CustomEventIdEnum.consultantSensitiveWordTip,
      );
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
            用户已等待超过<Text style={{ color: '#F58B00' }}>3分钟</Text>
            ，你的迟到可能引发用户投诉，请尽快回复用户。
          </View>
        );
      } else if (customData.eventId === CustomEventIdEnum.consultantSensitiveWordTip) {
        content = (
          <View className={styles.tipsContent}>
            请避免涉及转账/添加私人账号等高风险行为，脱离平台发生的咨询服务如若产生纠纷，平台概不负责，请注意保护私人隐私和财产安全。
          </View>
        );
      } else if (
        customData.eventId === CustomEventIdEnum.consultantCall3010 ||
        customData.eventId === CustomEventIdEnum.consultantCall3011 ||
        customData.eventId === CustomEventIdEnum.consultantCall3012
      ) {
        content = <View className={styles.tipsContent}>{customData.event.text}</View>;
      } else if (customData.eventId === CustomEventIdEnum.consultantCall3005) {
        content = (
          <View className={styles.tipsContent}>
            咨询预约成功，时间为{customData.event.psyDateStr}，请准时参加
          </View>
        );
      } else if (customData.eventId === CustomEventIdEnum.consultantCall3004) {
        content = (
          <View className={styles.tipsContent}>
            本次咨询即将开始，请及时去知我心理APP给咨询师发起视频
          </View>
        );
      }
    }
    return content;
  };

  const tipsMessage = getTipsMessage();
  console.log('----tipsMessage----', tipsMessage);

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
