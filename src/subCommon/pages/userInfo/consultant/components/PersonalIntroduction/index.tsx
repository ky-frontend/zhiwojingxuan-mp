import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { formatDate } from '@/utils/util';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';

type Props = {
  sty?: {};
};
type States = {
  isShowSpreadZiZhi: boolean;
  personIntroSpread: boolean;
  dealFlag: boolean;
  personalIntro: boolean;
};

@inject('store')
@observer
class CounselorPersonalIntroduction extends BaseKyComponent<Props, States> {
  state = {
    isShowSpreadZiZhi: false,
    personIntroSpread: false,
    dealFlag: false,
    personalIntro: false,
  };
  dict = ['single', 'personalIntro'];
  // 单行文本高度
  singleHeight = 0;

  componentDidMount() {
    if (this.store.consultantIndexStore.consultantInfo.certificationList.length > 8) {
      this.setState({ isShowSpreadZiZhi: true });
    }
    if (!this.state.dealFlag) {
      setTimeout(() => {
        this.dict.map((item, index) => {
          this.getHeight(item as any);
        });
      }, 50);
    }
  }

  getHeight = async (item: string) => {
    const query = Taro.createSelectorQuery();
    query.select(`#${item}`).boundingClientRect();
    query.exec((res) => {
      if (res && res[0]) {
        if (item == 'single') {
          this.singleHeight = res[0].height;
        }
        if (res[0].height > 132) {
          // 6行
          this.setState(
            (prevState) =>
              ({
                ...prevState,
                [item]: true,
              }) as Pick<States, keyof States>,
          );
        }
      }
      if (item == 'personalIntro') {
        this.setState({ dealFlag: true });
      }
    });
  };
  /**
   * 擅长领域数据整合并渲染
   * @returns reactNode
   */
  renderDomainList() {
    const { domainList } = this.store.consultantIndexStore.consultantInfo;
    if (!domainList) {
      return null;
    }
    return (
      <View>
        {domainList.map((item: any) => {
          return item.child && item.child.length ? (
            <View className={styles.bb} key={item.title}>
              <View className={styles.p1}>{item.title}</View>
              <View className={styles.p2}>
                {item.child.map((val: any) => val.title).join('、')}
              </View>
            </View>
          ) : (
            ''
          );
        })}
      </View>
    );
  }
  render() {
    const { consultantInfo } = this.store.consultantIndexStore;
    const { isShowSpreadZiZhi, personIntroSpread, dealFlag } = this.state;

    if (consultantInfo && !dealFlag) {
      return (
        <View className={styles.demo} style={{ position: 'fixed', top: '0' }}>
          <View id="single" className={styles.text}>
            单行文本的高度
          </View>
          <View id="personalIntro" className={styles.text}>
            {consultantInfo.profileSummary + '展开'}
          </View>
        </View>
      );
    }

    return (
      <View>
        <KYPage className={styles.CounselorInfo}>
          <View className={styles.t_p} style={this.props.sty}>
            <View className={styles.t}>个人简介</View>
            <View className={styles.w}>
              <View
                className={classNames(styles.p, {
                  [styles.notAllText]: this.state['personalIntro'],
                  // [styles.sixHeight]: this.state['personalIntro'] && !personIntroSpread,
                })}
                style={
                  this.state['personalIntro'] && !personIntroSpread
                    ? { height: this.singleHeight * 6 + 'px' }
                    : {}
                }
              >
                {this.state['personalIntro'] && (
                  <View
                    className={styles.spread}
                    onClick={() => {
                      this.setState({ personIntroSpread: !personIntroSpread });
                    }}
                  >
                    {personIntroSpread ? '收起' : '展开'}
                  </View>
                )}
                {consultantInfo.profileSummary}
              </View>
            </View>
          </View>

          <View className={styles.t_p}>
            <View className={styles.t}>擅长领域</View>

            {this.renderDomainList()}
          </View>
          {consultantInfo.specialList.length ? (
            <View className={styles.t_p}>
              <View className={styles.t}>咨询流派</View>
              <View className={styles.liupai}>
                {consultantInfo.specialList.map((item: any) => {
                  return (
                    <View className={styles.ll} key={item.id}>
                      {item.name}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
          <View className={styles.t_p}>
            <View className={styles.t}>资质与受训</View>
            <View className={styles.zizhi}>
              <View className={styles.tag}>资质</View>
              <View>
                {consultantInfo.certificationList.map((item: any) => {
                  return (
                    <View className={styles.zz} key={item}>
                      {item}
                    </View>
                  );
                })}
              </View>
            </View>
            {!isShowSpreadZiZhi && (
              <>
                {consultantInfo.longTermTrainingList.length ? (
                  <View className={styles.changqiView}>
                    <View className={styles.changqi}>
                      <View className={styles.tag}>培训</View>
                      <View>
                        <View className={styles.zz}>长程系统培训</View>
                      </View>
                    </View>
                    <View>
                      <View className={styles.list}>
                        <View className={styles.left}></View>
                        <View
                          className={`${styles.right} ${
                            consultantInfo.longTermTrainingList.length > 1 ? styles.rightMore : ''
                          }`}
                        >
                          {consultantInfo.longTermTrainingList.map((item: any, index: number) => {
                            return (
                              <View key={item.title + '_t'} className={styles.item}>
                                <View className={styles.point}></View>
                                <View className={styles.time}>
                                  {formatDate(item.startTime, 'YYYY.MM')}-
                                  {formatDate(item.endTime, 'YYYY.MM')}
                                </View>
                                <View
                                  className={
                                    index == consultantInfo.longTermTrainingList.length - 1
                                      ? styles.ptt
                                      : styles.pt
                                  }
                                >
                                  {item.title}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}
                {consultantInfo.shortTermTrainingList &&
                consultantInfo.shortTermTrainingList.length ? (
                  <View className={styles.duanqiView}>
                    <View className={styles.changqi}>
                      <View className={styles.tag}>培训</View>
                      <View>
                        <View className={styles.zz}>短期培训</View>
                      </View>
                    </View>

                    <View>
                      <View className={styles.list}>
                        <View className={styles.left}></View>
                        <View
                          className={classNames(styles.right, {
                            [styles.rightMore]: consultantInfo.shortTermTrainingList.length > 1,
                          })}
                        >
                          {consultantInfo.shortTermTrainingList.map((item: any, index: number) => {
                            return (
                              <View key={item.title + '_t'} className={styles.item}>
                                <View className={styles.point}></View>
                                <View className={styles.time}>
                                  {formatDate(item.startTime, 'YYYY.MM')}-
                                  {formatDate(item.endTime, 'YYYY.MM')}
                                </View>
                                <View
                                  className={
                                    index == consultantInfo.shortTermTrainingList.length - 1
                                      ? styles.ptt
                                      : styles.pt
                                  }
                                >
                                  {item.title}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}
              </>
            )}

            {/* 展开全部 */}
            <View
              className={styles.zizhi_spread}
              onClick={() => {
                this.setState({ isShowSpreadZiZhi: !this.state.isShowSpreadZiZhi });
              }}
            >
              <Text className={styles.txt}>{`${isShowSpreadZiZhi ? '展开' : '收起'}全部`}</Text>
              <Image
                className={classNames({
                  [styles.img]: true,
                  [styles.img_up]: !isShowSpreadZiZhi,
                })}
                src="https://cdn-public.knowyourself.cc/icon/consultant/arrow_down_16.png"
              />
            </View>
          </View>
          {consultantInfo.educationHistory.length ? (
            <View className={styles.t_p}>
              <View className={styles.t}>教育经历</View>
              <View className={styles.jiaoyujingli}>
                <View className={styles.list}>
                  <View className={styles.left}></View>
                  <View
                    className={classNames(styles.right, {
                      [styles.rightMore]: consultantInfo.educationHistory.length > 1,
                    })}
                  >
                    {consultantInfo.educationHistory.map((item: any, index: number) => {
                      return (
                        <View key={item.title + '_t'} className={styles.item}>
                          <View className={styles.point}></View>
                          <View className={styles.time}>
                            {formatDate(item.startTime, 'YYYY.MM')}-
                            {formatDate(item.endTime, 'YYYY.MM')}
                          </View>
                          <View
                            className={
                              index == consultantInfo.educationHistory.length - 1
                                ? styles.ptt
                                : styles.pt
                            }
                          >
                            {item.schoolName} | {item.major} | {item.degree}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          ) : null}
          <View className={styles.t_p}>
            <View className={styles.t}>咨询过程及方式</View>
            <View className={styles.pp}>{consultantInfo.consultationProcess}</View>
          </View>
          <View className={styles.t_p} style={{ marginBottom: '0px' }}>
            <View className={styles.t}>费用说明</View>
            <View className={styles.pp}>{consultantInfo.feeDescription}</View>
          </View>
        </KYPage>
        {/* )} */}
      </View>
    );
  }
}

export default CounselorPersonalIntroduction;
