import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { observer, inject } from 'mobx-react';
import Taro from '@tarojs/taro';
import { navigateTo, replaceTo } from '@/utils/navigate';
import classNames from 'classnames';
import KYChoose from '@/components/KYChoose';
import KYNavigation from '@/components/KYNavigation';
import { Picker, Textarea, View, Image, Input } from '@tarojs/components';
import styles from './index.module.less';
import {
  challenges,
  problem,
  careers,
  educations,
  earns,
  matrimony,
  relationship,
  children,
  knowWay,
} from './position';

type Props = {};
type States = {
  phoneValidate: string;
  phoneTwoValidate: string;
  idCardValidate: string;
  isNeedBack: boolean;
  hasInfo: boolean;
  sign: boolean;
  hasReceivedCounseling: -1 | 0 | 1;
  hasReceivedPsychialTreatment: -1 | 0 | 1;
  hasSuicide: -1 | 0 | 1;
  multichoose: number[];
  description: string;
  realName: string;
  idCardNumber: string;
  tel: string;
  gender: -1 | 0 | 1 | 2;
  birth: string;
  relationName: string;
  relationTel: string;
  relationShip: string;
  maritalStatus: string;
  hasChildren: string;
  position: string;
  education: string;
  career: string;
  earn: string;
  anythingElse: string;
  choosePicker: number;
  aggrementVisiable: string;
  challenge: string[];
  plague: string[];
  channelZhiwoPsychologicalServices: string;
  othertext: boolean;
};

@inject('store')
@observer
class CounsellInfo extends BaseKyComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      phoneValidate: '',
      phoneTwoValidate: '',
      idCardValidate: '',
      isNeedBack: false,
      hasInfo: true,
      aggrementVisiable: '1',
      sign: false,
      hasReceivedCounseling: -1,
      hasReceivedPsychialTreatment: -1,
      hasSuicide: -1,
      multichoose: [],
      description: '',

      realName: '',
      idCardNumber: '',
      tel: '',
      gender: -1,
      birth: '',
      relationName: '',
      relationTel: '',
      relationShip: '',
      maritalStatus: '',
      hasChildren: '',
      position: '',
      education: '',
      career: '',
      earn: '',
      anythingElse: '',
      choosePicker: -1,
      challenge: [],
      plague: [],
      channelZhiwoPsychologicalServices: '',
      othertext: false,
    };
    this.inputLine = this.inputLine.bind(this);
  }

  async onLoad(options) {
    const flag = options && options.isAggre == null ? '0' : '1';
    const fresh = options && options.isNeedRefresh == 'true' ? true : false;

    const res = await this.store.counsellInfoStore.getConsultationPersonal();
    if (res) {
      this.setState({
        hasInfo: true,
        sign: false,
        hasReceivedCounseling: res.hasReceivedCounseling,
        hasReceivedPsychialTreatment: res.hasReceivedPsychialTreatment,
        hasSuicide: res.hasSuicide,
        askanswerAndDescription: res.askanswerAndDescription,
        challenge: res.challenge || [],
        plague: res.plague || [],
        description: res.askanswerAndDescription.description,
        realName: res.realName,
        idCardNumber: res.idCardNumber,
        tel: res.tel,
        gender: res.gender == '女' ? 0 : res.gender == '男' ? 1 : res.gender == '其他' ? 2 : -1,
        birth: res.birth,
        relationName: res.relationName,
        relationTel: res.relationTel,
        relationShip: res.relationShip,
        maritalStatus: res.maritalStatus,
        hasChildren: res.hasChildren,
        position: res.position ? res.position : '',
        education: res.education ? res.education : '',
        career: res.career ? res.career : '',
        earn: res.earn ? res.earn : '',
        anythingElse: res.anythingElse ? res.anythingElse : '',
        choosePicker: -1,
        aggrementVisiable: '1',
        isNeedBack: fresh,
        channelZhiwoPsychologicalServices: res.channelZhiwoPsychologicalServices || '',
        othertext: res.channelZhiwoPsychologicalServices != '',
      });
    } else {
      this.setState({ aggrementVisiable: flag, hasInfo: false, isNeedBack: fresh });
    }
  }
  onTab = () => {
    this.setState({ aggrementVisiable: '1' });
    // Taro.redirectTo({ url: '/subConsultant/pages/counselInfo/index?isAggre=1' });
    replaceTo('/subConsultant/pages/counselInfo/index?isAggre=1');
  };

  get years() {
    const year: string[] = [];
    const currentYear = new Date().getFullYear();
    const startYear = 1960;

    for (let i = startYear; i <= currentYear; i++) {
      year.push(i + '');
    }
    year.reverse();
    return year;
  }

  inputLine(
    title: string,
    placeholder: string,
    required: boolean,
    value: string,
    changefunc: any,
    disabled?: boolean,
    hasValidate = false,
    validateContent?: string,
    validateFunc?: any,
  ) {
    return (
      <View className={styles.input}>
        <View className={`${required ? styles.star : styles.hidden}`}>*</View>
        <View className={styles.require}>{title}</View>
        <View className={styles.value}>
          <Input
            type="text"
            className={styles.alert}
            placeholder={placeholder}
            value={value}
            onInput={(e) => changefunc(e.detail.value)}
            onBlur={validateFunc}
            disabled={disabled}
            style={disabled ? { opacity: '0.2' } : {}}
          ></Input>
          <View
            className={
              hasValidate ? classNames(styles.validate, styles.validateAc) : styles.validate
            }
          >
            {validateContent != '' ? validateContent : ''}
          </View>
        </View>
      </View>
    );
  }

  handleSubmit = async () => {
    if (this.state.phoneTwoValidate || this.state.phoneValidate) {
      return;
    }
    const validations = [
      { condition: this.state.hasReceivedCounseling + 1 },
      {
        condition: this.state.hasReceivedPsychialTreatment + 1,
      },
      { condition: this.state.hasSuicide + 1 },
      { condition: this.state.plague.length > 0 },
      {
        condition: this.state.challenge.length > 0,
      },
      {
        condition: this.state.channelZhiwoPsychologicalServices,
      },
      { condition: this.state.realName },
      // { condition: this.state.idCardNumber },
      { condition: this.state.tel },
      { condition: this.state.gender + 1 },
      { condition: this.state.birth },
      { condition: this.state.relationName },
      { condition: this.state.relationTel },
      { condition: this.state.relationShip },
      { condition: this.state.maritalStatus },
      { condition: this.state.hasChildren },
    ];

    for (const { condition } of validations) {
      if (!condition) {
        Taro.showToast({ icon: 'none', duration: 1000, title: '* 号为必填项，请完成填写' });
        return;
      }
    }

    if (!this.state.sign) {
      Taro.showToast({ icon: 'none', duration: 1000, title: '请同意签署下方协议' });
      return;
    }

    const result1: 0 | 1 = this.state.hasReceivedCounseling === 0 ? 0 : 1;
    const result2: 0 | 1 = this.state.hasReceivedPsychialTreatment == 0 ? 0 : 1;
    const result3: 0 | 1 = this.state.hasSuicide == 0 ? 0 : 1;
    const genderMap = ['女', '男', '其他'];

    const info = {
      hasReceivedCounseling: result1,
      hasReceivedPsychialTreatment: result2,
      hasSuicide: result3,
      askanswerAndDescription: {
        answer: [''],
        description: '',
      },
      realName: this.state.realName,
      idCardNumber: '123',
      tel: this.state.tel,
      gender: genderMap[this.state.gender],
      birth: this.state.birth,
      relationName: this.state.relationName,
      relationTel: this.state.relationTel,
      relationShip: this.state.relationShip,
      maritalStatus: this.state.maritalStatus,
      hasChildren: this.state.hasChildren,
      position: this.state.position,
      education: this.state.education,
      career: this.state.career,
      earn: this.state.earn,
      anythingElse: this.state.anythingElse,
      channelZhiwoPsychologicalServices: this.state.channelZhiwoPsychologicalServices,
      challenge: this.state.challenge,
      plague: this.state.plague,
    };
    const res = await this.store.counsellInfoStore.editConsultationPersonal(info);
    if (res.code == 0) {
      Taro.showToast({ title: '提交成功', duration: 1000, icon: 'none' });
      setTimeout(() => {
        // Taro.redirectTo({ url: '/subConsultant/pages/serviceData/index' });
        Taro.navigateBack();
      }, 2000);
    } else {
      Taro.showToast({ title: res.message, duration: 1000, icon: 'none' });
    }
  };
  chooseLine(
    title: string,
    placeholder: string,
    required: boolean,
    value: string,
    disabled: boolean,
    ranges: string[],
    mode: 'time' | 'multiSelector' | 'date' | 'region' | 'selector' | undefined,
  ) {
    return (
      <View className={styles.input}>
        <View className={`${required ? styles.star : styles.hidden}`}>*</View>
        <View className={styles.require}>{title}</View>
        <Picker
          disabled={disabled}
          mode={mode}
          range={ranges}
          onChange={(i) => {
            console.log(i);
            if (value == 'position') {
              const item = i.detail.value.join('');
              this.setState({ position: item });
            } else {
              this.setState({ [value]: ranges[i.detail.value] }, () => {
                console.log(value);

                console.log(22222, this.state[value]);
              });
            }
          }}
        >
          <View className={styles.box} style={disabled ? { opacity: '0.2' } : {}}>
            <View className={styles.select}>
              {this.state[value]}
              <View
                className={styles.span}
                style={
                  this.state[value]
                    ? { display: 'none' }
                    : { display: 'block', color: 'rgb(0 0 0 / 0.2)' }
                }
              >
                {disabled ? '' : placeholder}
              </View>
            </View>
            <Image
              className={styles.img}
              style={disabled ? { display: 'none' } : { display: 'block' }}
              src="https://cdn-public.knowyourself.cc/icon/liaoyu/编组 6@2x.png"
            ></Image>
          </View>
        </Picker>
      </View>
    );
  }

  render() {
    const {
      hasInfo,
      aggrementVisiable,
      sign,
      hasReceivedCounseling,
      hasReceivedPsychialTreatment,
      hasSuicide,
      multichoose,
      description,
      realName,
      idCardNumber,
      tel,
      gender,
      birth,
      relationName,
      relationTel,
      relationShip,
      maritalStatus,
      hasChildren,
      position,
      education,
      career,
      earn,
      anythingElse,
      choosePicker,
      phoneValidate,
      phoneTwoValidate,
      idCardValidate,
      challenge,
      plague,
      channelZhiwoPsychologicalServices,
      othertext,
    } = this.state;
    if (aggrementVisiable == '0' && !hasInfo) {
      return (
        <View className={styles.pages}>
          <View className={styles.modal}>
            <View className={styles.title}>注意事项</View>
            <View className={styles.content}>
              <View>1、填写需要约3分钟，提交信息后咨询师会在24小时内确认预约。</View>
              <View>2、请详实填写，如若重要信息缺失，咨询师可能因无法判断而拒绝预约。</View>
              <View>3、请准确填写，资料提交后无法修改。</View>
              <View>4、信息仅对您下单的咨询师可见，且严格保密，请放心填写。</View>
              <View>
                5、预约成功后，如需更改或取消预约，需在咨询开始前至少24小时操作，否则咨询将如约开始，并照常收取咨询费用。
              </View>
              <View> 6、若您迟到或缺席，咨询仍会在原定时间结束并照常收取咨询费用。</View>
            </View>
            <View className={styles.btn}>
              <View className={styles.btntext} onClick={this.onTab}>
                我知道了
              </View>
            </View>
          </View>
        </View>
      );
    }
    return (
      <KYPage className={styles.ConsellInfo}>
        <KYNavigation showBack className={styles.back} />
        <View className={styles.header}>
          <View className={styles.div}>
            基于咨询伦理及设置，请如实填写以下信息，资料提交后仅对您选定的心理咨询师可见。
          </View>
        </View>

        <View className={styles.ask}>
          <View className={styles.input}>
            <View className={styles.star}>*</View>
            <View className={styles.requiresex}>你目前面临的困扰（可多选）</View>
          </View>
          <View className={styles.grids}>
            {problem.map((item, index) => {
              return (
                <View
                  className={styles.label}
                  key={index}
                  onClick={() => {
                    if (!hasInfo) {
                      if (plague.includes(item)) {
                        this.setState({ plague: plague.filter((i) => i != item) });
                      } else {
                        this.setState({ plague: [...plague, item] });
                      }
                    }
                  }}
                >
                  <View
                    className={plague.includes(item) ? styles.choosesquare : styles.square}
                    style={hasInfo ? { opacity: '0.2' } : {}}
                  ></View>
                  <View className={styles.word}>{item}</View>
                </View>
              );
            })}
          </View>
        </View>

        <View className={styles.ask}>
          <View className={styles.input}>
            <View className={styles.star}>*</View>
            <View className={styles.requiresex}>当前生活阶段的挑战（可多选）</View>
          </View>
          <View className={styles.grids}>
            {challenges.map((item, index) => (
              <View
                className={styles.label}
                key={index}
                onClick={() => {
                  if (!hasInfo) {
                    if (challenge.includes(item)) {
                      this.setState({ challenge: challenge.filter((i) => i != item) });
                    } else {
                      this.setState({ challenge: [...challenge, item] });
                    }
                  }
                }}
              >
                <View
                  className={challenge.includes(item) ? styles.choosesquare : styles.square}
                  style={hasInfo ? { opacity: '0.2' } : {}}
                ></View>
                <View className={styles.word}>{item}</View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.ask}>
          <KYChoose
            title="是否寻求过心理咨询的帮助？"
            onchange={(i: any) => this.setState({ hasReceivedCounseling: i })}
            default={hasReceivedCounseling}
            disabled={hasInfo}
          />
        </View>
        <View className={styles.ask}>
          <KYChoose
            title="是否寻求过精神科医生的帮助？"
            onchange={(i: any) => this.setState({ hasReceivedPsychialTreatment: i })}
            default={hasReceivedPsychialTreatment}
            disabled={hasInfo}
          />
        </View>
        <View className={styles.ask}>
          <KYChoose
            title="是否有确诊的慢性躯体疾病？"
            onchange={(i: any) => this.setState({ hasSuicide: i })}
            default={hasSuicide}
            disabled={hasInfo}
          />
        </View>
        <View className={styles.ask}>
          <View className={styles.input}>
            <View className={styles.star}>*</View>
            <View className={styles.requiresex}>从何种渠道了解到知我心理咨询服务</View>
          </View>
          <View className={styles.lineChoose}>
            {knowWay.map((item, index) => (
              <View
                className={styles.label}
                key={index}
                onClick={() => {
                  if (!hasInfo) {
                    if (item == '其他') {
                      this.setState({ othertext: true, channelZhiwoPsychologicalServices: '' });
                      return;
                    }

                    this.setState({ othertext: false, channelZhiwoPsychologicalServices: item });
                  }
                }}
              >
                <View
                  className={
                    channelZhiwoPsychologicalServices == item ||
                    (this.state.othertext && item == '其他')
                      ? styles.choosesquare
                      : styles.square
                  }
                  style={hasInfo ? { opacity: '0.2' } : {}}
                ></View>
                <View className={styles.word}>{item}</View>
              </View>
            ))}
            <Textarea
              className={classNames({
                [styles.other]: this.state.othertext,
              })}
              style={!this.state.othertext ? { display: 'none' } : {}}
              placeholder="请输入"
              value={channelZhiwoPsychologicalServices}
              maxlength={500}
              onInput={(e) => {
                this.setState({ channelZhiwoPsychologicalServices: e.detail.value });
              }}
              disabled={hasInfo}
            ></Textarea>
          </View>
        </View>

        <View className={styles.ask}>
          <View className={styles.p1}>基本信息</View>
          <View className={styles.notice}>
            <View className={styles.p}>请填写真实信息，有助于保障你的合法权益</View>
          </View>
          {this.inputLine(
            '真实姓名',
            '请填写真实姓名',
            true,
            realName,
            (i: string) => this.setState({ realName: i }),
            hasInfo,
          )}
          <View className={styles.line}></View>
          {this.inputLine(
            '联系电话',
            '请填写联系电话',
            true,
            tel,
            (i: string) => {
              this.setState({ tel: i });
            },
            hasInfo,
            true,
            phoneValidate,
            () => {
              if (!/^1[3456789]\d{9}$/.test(this.state.tel)) {
                this.setState({ phoneValidate: '请填写正确格式的手机号' });
              } else {
                this.setState({ phoneValidate: '' });
              }
            },
          )}
          <View className={styles.line}></View>
          <View className={styles.input}>
            <View className={styles.star}>*</View>
            <View className={styles.require}>性别</View>
            <View className={styles.label}>
              <View
                className={gender == 0 ? styles.choosesquare : styles.square}
                style={hasInfo ? { opacity: '0.2' } : {}}
                onClick={() => {
                  if (!hasInfo) {
                    if (gender == 0) {
                      this.setState({ gender: -1 });
                    } else {
                      this.setState({ gender: 0 });
                    }
                  }
                }}
              ></View>
              <View className={styles.word}>女</View>
            </View>
            <View className={styles.label}>
              <View
                className={gender == 1 ? styles.choosesquare : styles.square}
                style={hasInfo ? { opacity: '0.2' } : {}}
                onClick={() => {
                  if (!hasInfo) {
                    if (gender == 1) {
                      this.setState({ gender: -1 });
                    } else {
                      this.setState({ gender: 1 });
                    }
                  }
                }}
              ></View>
              <View className={styles.word}>男</View>
            </View>
            <View className={styles.label}>
              <View
                className={gender == 2 ? styles.choosesquare : styles.square}
                style={hasInfo ? { opacity: '0.2' } : {}}
                onClick={() => {
                  if (!hasInfo) {
                    if (gender == 2) {
                      this.setState({ gender: -1 });
                    } else {
                      this.setState({ gender: 2 });
                    }
                  }
                }}
              ></View>
              <View className={styles.word}>其他</View>
            </View>
          </View>
          <View className={styles.line}></View>
          {/* {this.chooseLine(
            '出生年份',
            '请选择',
            false,
            'education',
            hasInfo,
            educations.reverse(),
            'selector',
          )} */}
          {this.chooseLine('出生年份', '请选择', true, 'birth', hasInfo, this.years, 'selector')}
        </View>

        <View className={styles.ask}>
          <View className={styles.p1}>紧急联系人</View>
          <View className={styles.notice}>
            <View>请填写真实信息，仅用于危机等紧急情况下联系</View>
          </View>
          {this.inputLine(
            '真实姓名',
            '请填写真实姓名',
            true,
            relationName,
            (i: string) => this.setState({ relationName: i }),
            hasInfo,
          )}
          <View className={styles.line}></View>
          {this.inputLine(
            '联系电话',
            '请填写联系电话',
            true,
            relationTel,
            (i: string) => {
              this.setState({ relationTel: i });
            },
            hasInfo,
            true,
            phoneTwoValidate,
            () => {
              if (!/^1[3456789]\d{9}$/.test(this.state.relationTel)) {
                this.setState({ phoneTwoValidate: '请填写正确格式的紧急联系人手机号' });
              } else {
                this.setState({ phoneTwoValidate: '' });
              }
            },
          )}

          <View className={styles.line}></View>
          {this.chooseLine(
            '关系',
            '请选择',
            true,
            'relationShip',
            hasInfo,
            relationship,
            'selector',
          )}
        </View>

        <View className={styles.ask}>
          <View className={styles.p1}>其他信息</View>
          <View className={styles.notice}>
            <View>以下信息会帮助咨询师了解你并评估你们是否匹配</View>
          </View>

          {this.chooseLine('现居住地', '请选择', false, 'position', hasInfo, [], 'region')}
          <View className={styles.line}></View>
          {this.chooseLine('学历', '请选择', false, 'education', hasInfo, educations, 'selector')}
          <View className={styles.line}></View>
          {this.chooseLine('从事行业', '请选择', false, 'career', hasInfo, careers, 'selector')}
          <View className={styles.line}></View>
          {this.chooseLine('月收入', '请选择', false, 'earn', hasInfo, earns, 'selector')}
          <View className={styles.line}></View>
          {this.chooseLine(
            '婚姻状态',
            '请选择',
            true,
            'maritalStatus',
            hasInfo,
            matrimony,
            'selector',
          )}
          <View className={styles.line}></View>
          {this.chooseLine(
            '有无子女',
            '请选择',
            true,
            'hasChildren',
            hasInfo,
            children,
            'selector',
          )}
          <View className={styles.line}></View>
          <View className={styles.else}>其他想说的？</View>
          <Textarea
            className={styles.spacetwo}
            placeholder={!hasInfo ? '其他想对咨询师说的话？' : ''}
            value={anythingElse}
            maxlength={100}
            onInput={(e) => {
              this.setState({ anythingElse: e.detail.value });
            }}
            disabled={hasInfo}
          ></Textarea>
        </View>

        <View
          className={styles.bottom}
          style={!hasInfo ? { display: 'block' } : { display: 'none' }}
        >
          <View className={styles.sign}>
            <View
              className={sign ? styles.choosesquareblack : styles.squareblack}
              onClick={() => this.setState({ sign: !sign })}
            ></View>
            我同意并签署
            <View
              className={styles.span}
              onClick={() => {
                // Taro.navigateTo({
                //   url: '/subWebview/pages/md/index?protocolId=zhiwozixunfuwuxieyi',
                // });
                navigateTo('/subWebview/pages/md/index?protocolId=zixunfuwuxieyi');
              }}
            >
              《咨询协议》
            </View>
            <View
              className={styles.span}
              onClick={() => {
                // Taro.navigateTo({
                //   url: '/subWebview/pages/md/index?protocolId=zhiwoxinlixinlizhiqing',
                // });
                navigateTo('/subWebview/pages/md/index?protocolId=zixunfuwuzhiqingtongyishu');
              }}
            >
              《知情协议》
            </View>
          </View>
          <View className={styles.xieyi}>
            本协议仅为参考条款。如有任何困惑，可在首次咨询中与咨询师讨论，如有修订需要，可在咨询中随时讨论和补充新的规则，并另外签订协议。若未另外签订，则以本协议为准。
          </View>
          <View className={styles.btn} onClick={this.handleSubmit}>
            提交
          </View>
        </View>
      </KYPage>
    );
  }
}

export default CounsellInfo;
