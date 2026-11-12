import { formatAmount, formatSecondsToMinutes, sTom } from '@/modules/utils/formatting.util';
import { store } from '@/store';
import styles from './index.module.less';
import { Image, Text, View } from '@tarojs/components';
import { CallInfoType, CustomEventIdEnum } from '@/types/im.type';

const CustomMessage = (props: { msg: any }) => {
  const { msg } = props;

  const customData = JSON.parse(msg.payload?.data || '{}');
  const type = customData.event?.type;
  const isInitiator =
    customData.event?.sendInfo?.aliasId === store.imStore.currentConversation?.userProfile?.userID;

  const renderContent = () => {
    console.log(customData);

    switch (customData.eventId) {
      case CustomEventIdEnum.callInfoStatus:
        return (
          <View className={styles.callMessage}>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/im/keyboard_ic_audio.png"
              className={styles.callIcon}
            />
            <Text className={styles.callText}>
              {type === CallInfoType.noAnswer
                ? '无应答'
                : type === CallInfoType.cancel
                  ? '对方已取消'
                  : type === CallInfoType.refuse
                    ? '已拒绝'
                    : type === CallInfoType.finish
                      ? `通话时长 ${timeText(customData.event.time)}`
                      : '未知'}
            </Text>
          </View>
        );
      case CustomEventIdEnum.callAnsweringSource:
        return (
          <View className={styles.callMessage}>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/im/keyboard_ic_audio.png"
              className={styles.callIcon}
            />
            <Text className={styles.callText}>已在其他设备接听</Text>
          </View>
        );
      case CustomEventIdEnum.consultAddTime:
        return (
          <View className={styles.timeMessage}>
            <View className={styles.timeTop}>
              <Image
                src="https://cdn-public.knowyourself.cc/icon/im/keyboard_ic_audio.png"
                className={styles.callIcon}
              />
              <Text className={styles.timeTitle}>用户已加时</Text>
            </View>
            <View className={styles.timeContent}>
              <View className={styles.timeItem}>
                <Text>聊愈时长</Text>
                <Text>{sTom(customData.event.seconds)}分钟</Text>
              </View>
              <View className={styles.timeItem}>
                <Text>已支付</Text>
                <Text>¥{formatAmount(customData.event.payment)}</Text>
              </View>
            </View>
          </View>
        );
      // case CustomEventIdEnum.consultantCall3000:
      // case CustomEventIdEnum.consultantCall3001:
      case CustomEventIdEnum.consultantCall3002:
      case CustomEventIdEnum.consultantCall3003: {
        const text = {
          1: isInitiator ? '未应答' : '对方无应答',
          2: isInitiator ? '对方已拒绝' : '已拒绝',
          3: `通话时长 ${timeText(customData.event?.callTime)}`,
          4: isInitiator ? '对方已取消' : '已取消',
        }[customData.event?.callEndType as number];
        return (
          <View className={styles.callMessage}>
            <Image
              src="https://cdn-public.knowyourself.cc/icon/im/keyboard_ic_video.png"
              className={styles.callIcon}
            />
            <Text className={styles.callText}>{text}</Text>
          </View>
        );
      }
    }
  };

  return <View className={styles.customMessage}>{renderContent()}</View>;
};

const timeText = (time: number) => {
  const { m, s }: any = formatSecondsToMinutes(time, '');
  return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
};

export default CustomMessage;
