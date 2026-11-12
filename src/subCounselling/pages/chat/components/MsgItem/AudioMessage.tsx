import classNames from 'classnames';
// import MessageTool from '../MessageTool';
import styles from './index.module.less';
import { Message } from '@tencentcloud/chat';
import { observer, inject } from 'mobx-react';
import { View, Text, Image } from '@tarojs/components';
import BaseKyComponent from '@/components/BaseKyComponent';
import Taro from '@tarojs/taro';

type IStates = {
  audioPlaying: boolean;
  audioText: string;
  audioRead: boolean;
  // audioPlaybackStatuses: any;
};

type IProps = {
  msg: any;
};
@inject('store')
@observer
class AudioMessage extends BaseKyComponent<IProps, IStates> {
  constructor(props) {
    super(props);
    this.state = {
      audioPlaying: false,
      audioText: '',
      audioRead: false,
      // audioPlaybackStatuses: Taro.getStorageSync('audioPlaybackStatuses') || {},
    };
  }
  audioContext = this.store.globalDataStore.globalAudioContext;

  componentWillUnmount(): void {
    const { setGlobalAudioID } = this.store.globalDataStore;
    this.audioContext.stop();
    this.audioContext.destroy();
    setGlobalAudioID('');
  }

  onUnload() {
    const { setGlobalAudioID } = this.store.globalDataStore;
    this.audioContext.stop();
    this.audioContext.destroy();
    setGlobalAudioID('');
  }

  handlePlayAudio(message) {
    console.log('message+++++', message);
    const { setGlobalAudioID, setGlobalAudioUrl } = this.store.globalDataStore;
    // 先重置音频状态
    if (this.store.globalDataStore.globalAudioID === message.ID) {
      this.audioContext.stop();
      setGlobalAudioID('');
    } else {
      setGlobalAudioUrl(message.payload.url);
      this.audioContext.play();
      setGlobalAudioID(message.ID);
    }

    this.audioContext.onPlay(() => {
      console.log('音频开始播放');
      // 存到本地
      // const newStatus = {
      //   [message.ID]: true, // 表示这条音频已播放
      // };
      // 更新state
      // this.setState({
      //   audioPlaying: true,
      //   audioPlaybackStatuses: { ...this.state.audioPlaybackStatuses, ...newStatus },
      // });
      // 更新本地存储中的音频播放状态集合
      // Taro.setStorageSync('audioPlaybackStatuses', {
      //   ...this.state.audioPlaybackStatuses,
      //   ...newStatus,
      // });

      // this.audioContext.src === message.payload.url &&
      //   this.setState({
      //     audioPlaying: true,
      //   });
    });

    this.audioContext.onEnded(() => {
      console.log('音频播放完毕');
      // this.setState({ audioPlaying: false });
      setGlobalAudioID('');
    });
    this.audioContext.onPause(() => {
      console.log('音频暂停播放');
      // this.setState({ audioPlaying: false });
      setGlobalAudioID('');
    });
    this.audioContext.onError((res) => {
      console.error('音频播放出错', res.errMsg);
      // this.setState({ audioPlaying: false });
      setGlobalAudioID('');
      Taro.showToast({
        title: '该音频无法播放，请去知我心理APP使用',
        icon: 'none',
      });
    });
  }

  // 在需要检查某条音频是否播放过的地方读取本地存储
  // isAudioPlayed(messageId) {
  //   const audioPlaybackStatuses = Taro.getStorageSync('audioPlaybackStatuses') || {};
  //   return !!audioPlaybackStatuses[messageId];
  // }

  handleMessageTool(key, data) {
    if (key === 'audioToText') {
      this.setState({ audioText: data.text });
    }
  }

  render() {
    const { msg } = this.props;
    const { audioText, audioPlaying } = this.state;
    const { globalDataStore } = this.store;
    const isOut = msg.flow === 'out';

    return (
      <View className={styles.audioWrap}>
        <View className={styles.audioContent}>
          {/* <MessageTool msg={msg} callback={handleMessageTool}> */}
          <View className={styles.audio} onClick={() => this.handlePlayAudio(msg)}>
            <Text
              className={classNames(
                styles.voiceIcon,
                globalDataStore.globalAudioID === msg.ID ? styles.playing : '',
              )}
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
          {/* </MessageTool> */}
          {/* {!this.isAudioPlayed(msg.ID) ? <View className={styles.redDot}></View> : ''} */}
        </View>
        {audioText ? <View className={styles.audioText}>{audioText}</View> : ''}
      </View>
    );
  }
}

export default AudioMessage;
