import { observer, inject } from 'mobx-react';
import Taro from '@tarojs/taro';
import { Input, View, Image } from '@tarojs/components';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';
import KYPage from '../KYPage';
import KYNumber from '../KYNumber';

type Props = { visitable: boolean };
type States = { codeTimer: number };

@inject('store')
@observer
class KYBindPhoneModal extends BaseKyComponent<Props, States> {
  timer: any;
  sendSmsLock = false;
  constructor(props: Props) {
    super(props);
    this.state = {
      codeTimer: -1,
    };
    // this.store.loginStore.getUserAliasList();
  }
  getCode(num: number) {
    this.setState({
      codeTimer: num,
    });
    this.timer = setTimeout(() => {
      if (num === 0) {
        this.timer && clearInterval(this.timer);
        this.timer = null;
        this.setState({
          codeTimer: -1,
        });
        return;
      }
      this.getCode(num - 1);
    }, 1000);
  }
  render() {
    const { codeTimer } = this.state;
    const { smsParams } = this.store.loginStore;
    return (
      <KYPage className={styles.index}>
        <View className={styles.content}>
          <View className={styles.title}>绑定手机号</View>
          <View className={styles.center}>
            <View className={styles.phonenumber}>
              <View
                className={styles.p1}
                onClick={() => {
                  this.store.loginStore.changeShowCountrySelect();
                }}
              >
                <View className={styles.pp1}>
                  <KYNumber>{this.store.loginStore.smsParams.country_code}</KYNumber>
                </View>
                <Image
                  className={styles.img}
                  src="https://cdn-public.knowyourself.cc/icon/user/20230223_icon_low.png"
                />
                <View className={styles.pp2}></View>
              </View>
              <View className={styles.p2}>
                <Input
                  maxlength={11}
                  placeholder="请输入手机号"
                  type="number"
                  value={smsParams.mobile}
                  onInput={(e) => {
                    this.store.loginStore.changeMobile(e.detail.value);
                  }}
                />
              </View>
            </View>
            <View className={styles.vcode}>
              <Input
                placeholder="请输入验证码"
                maxlength={6}
                type="number"
                value={smsParams.code}
                onInput={(e) => {
                  this.store.loginStore.changeSmsCode(e.detail.value);
                }}
              />
              <View
                className={codeTimer === -1 ? styles.codeTimer_tips : styles.codeTimer_time}
                onClick={() => {
                  if (codeTimer < 0 && smsParams.mobile) {
                    this.sendSmsLock = true;
                    this.store.loginStore.sendCodeWeChat();
                    this.getCode(60);
                  } else if (!smsParams.mobile) {
                    Taro.showToast({ icon: 'none', title: '请输入手机号' });
                  }
                }}
              >
                {codeTimer === -1 ? '发送验证码' : '重新发送（' + codeTimer + 's）'}
              </View>
            </View>
          </View>
          <View className={styles.footer}>
            <View className={styles.btn} onClick={() => this.store.loginStore.loginMobileWeChat()}>
              确认
            </View>
          </View>
        </View>
      </KYPage>
    );
  }
}

export default KYBindPhoneModal;
