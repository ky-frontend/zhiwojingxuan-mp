import classNames from 'classnames';
import MessageTool from './MessageTool';
import styles from './index.module.less';
import { Message } from '@tencentcloud/chat';
import { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';

const AudioMessage = (props: { msg: any }) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioText, setAudioText] = useState('');

  const { msg } = props;
  const isOut = msg.flow === 'out';

  /**
   * 播放音频
   */
  const handlePlayAudio = (message: Message) => {
    console.log('handlePlayAudio', message);
    // const url = message.payload.url;
    // if (url.indexOf('.amr') !== -1) {
    //   const amr = new BenzAMRRecorder();
    //   amr.initWithUrl(url).then(() => {
    //     setAudioPlaying(true);
    //     amr.play();
    //   });
    //   amr.onEnded(() => {
    //     console.log('播放完毕');
    //     setAudioPlaying(false);
    //   });
    // } else {
    //   const audio = new Audio(url);
    //   audio.addEventListener('canplaythrough', () => {
    //     audio.play();
    //     setAudioPlaying(true);
    //   });
    //   audio.addEventListener('ended', () => {
    //     setAudioPlaying(false);
    //   });
    //   audio.addEventListener('error', (e) => {
    //     console.log('error', e);
    //   });
    // }
  };

  const handleMessageTool = (key: string, data: any) => {
    if (key === 'audioToText') {
      setAudioText(data.text);
    }
  };

  return (
    <View className={styles.audioWrap}>
      <View className={styles.audioContent}>
        <MessageTool msg={msg} callback={handleMessageTool}>
          <View className={styles.audio} onClick={() => handlePlayAudio(msg)}>
            <Text
              className={classNames(styles.voiceIcon, audioPlaying ? styles.playing : '')}
            ></Text>
            {isOut ? (
              <Image
                className={styles.semicolonIcon}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/icon_semicolon_20231011.png"
              />
            ) : null}
            <Text className={styles.second}>{msg.payload.second}</Text>
            {isOut ? null : (
              <Image
                className={styles.semicolonIcon}
                src="https://cdn-public.knowyourself.cc/icon/liaoyu/icon_semicolon_20230828.png"
              />
            )}
          </View>
        </MessageTool>
        {/* {!msg.isPeerRead ? <View className={styles.redDot}></View> : ''} */}
      </View>
      {audioText ? <View className={styles.audioText}>{audioText}</View> : ''}
    </View>
  );
};

export default AudioMessage;
