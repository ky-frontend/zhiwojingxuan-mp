import { observer } from 'mobx-react';
import copy from 'copy-to-clipboard';
import TencentCloudChat from '@tencentcloud/chat';
import { useState } from 'react';
import { extraApi } from '@/services';
import Taro from '@tarojs/taro';
import { Image, Text, View } from '@tarojs/components';
import styles from './index.module.less';

const MessageTool = observer(
  (props: {
    children: React.ReactNode;
    msg: any;
    callback?: (key: string, value: any) => void;
  }) => {
    const { children, msg } = props;
    const [open, setOpen] = useState(false);
    const [audioToTextLoading, setAudioToTextLoading] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
    };

    /**
     * 复制文本消息
     * @param text 复制的文本
     */
    const handleCopy = (text: string) => {
      if (copy(text)) {
        Taro.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 2000,
        });
      }
      handleOpenChange(false);
    };

    /**
     * 引用消息
     */
    const handleQuote = () => {
      consultantStore.setQuoteMessage(msg);
      handleOpenChange(false);
    };

    /**
     * 通话转文字
     */
    const handleAudioToText = async () => {
      if (audioToTextLoading) return;
      handleOpenChange(false);
      setAudioToTextLoading(true);
      props.callback &&
        props.callback('audioToText', {
          text: '转换中...',
        });
      const res = await extraApi.SpeechToText(msg.payload.url);
      setAudioToTextLoading(false);
      props.callback &&
        props.callback('audioToText', {
          text: res.data,
        });
    };

    return (
      <View className={styles.msgToolBox}>
        <View className={styles.toolBox} style={{ display: open ? 'block' : 'none' }}>
          {msg.type === TencentCloudChat.TYPES.MSG_TEXT ? (
            <View className={styles.toolItem} onClick={() => handleCopy(msg.payload.text)}>
              复制
            </View>
          ) : null}
          {msg.type === TencentCloudChat.TYPES.MSG_AUDIO ? (
            <View className={styles.toolItem} onClick={() => handleAudioToText()}>
              转对话
            </View>
          ) : null}
          <View className={styles.toolItem} onClick={() => handleQuote()}>
            引用
          </View>
        </View>
        <View
          onClick={() => {
            handleOpenChange(true);
          }}
          className={styles.toolContent}
        >
          {children}
        </View>
      </View>
    );
  },
);

export default MessageTool;
