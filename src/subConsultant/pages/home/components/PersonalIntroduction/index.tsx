import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';
import classnames from 'classnames';
import KYNumber from '@/components/KYNumber';
import { formatDate } from '@/utils/util';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

type Props = {};
type States = {};

@inject('store')
@observer
class CounselorPersonalIntroduction extends BaseKyComponent<Props, States> {
  componentDidMount() {
    // 获取id是jisuandedom的dom元素的高度
    const query = Taro.createSelectorQuery();
    query.select('#jisuandedom').boundingClientRect();
    query.exec((res) => {
      const height = res[0] ? res[0].height : 0;
      if (height > 85) {
        this.store.consultantIndexStore.setProfileSummary(
          this.store.consultantIndexStore.consultantInfo.profileSummary,
          1,
        );
      } else {
        this.store.consultantIndexStore.setProfileSummary(
          this.store.consultantIndexStore.consultantInfo.profileSummary,
          2,
        );
      }
    });
  }
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
    // if (!consultantInfo.profileSummary1 && !consultantInfo.profileSummary2) {
    //   return (
    //     <View className={styles.CounselorInfo} style={{ position: 'fixed', top: '-1000px' }}>
    //       <View className={styles.t_p}>
    //         <View className={styles.t}>个人简介</View>
    //         <View className={styles.w}>
    //           <View className={styles.p} id={'jisuandedom'}>
    //             {consultantInfo.profileSummary}
    //           </View>
    //         </View>
    //       </View>
    //     </View>
    //   );
    // }
    // return (
    //   <KYPage className={styles.CounselorInfo}>
    //     {consultantInfo.profileSummary2 ? (
    //       <View className={styles.t_p}>
    //         <View className={styles.t}>个人简介</View>
    //         <View className={styles.w}>
    //           <View className={styles.p}>{consultantInfo.profileSummary2}</View>
    //         </View>
    //       </View>
    //     ) : null}
    //     {consultantInfo.profileSummary1 ? (
    //       <View className={styles.t_p}>
    //         <View className={styles.t}>个人简介</View>
    //         <View className={styles.w}>
    //           <input type="checkbox" id="exp" className={styles.exp} style={{ width: 0 }} />
    //           <View className={styles.p}>
    //             <label className={styles.b} htmlFor="exp"></label>
    //             {consultantInfo.profileSummary1}
    //           </View>
    //         </View>
    //       </View>
    //     ) : null}
    //     <View className={styles.t_p}>
    //       <View className={styles.t}>擅长领域</View>

    //       {this.renderDomainList()}
    //     </View>
    //     {consultantInfo.specialList.length ? (
    //       <View className={styles.t_p}>
    //         <View className={styles.t}>咨询流派</View>
    //         <View className={styles.liupai}>
    //           {consultantInfo.specialList.map((item: any) => {
    //             return (
    //               <View className={styles.ll} key={item.id}>
    //                 {item.name}
    //               </View>
    //             );
    //           })}
    //         </View>
    //       </View>
    //     ) : null}
    //     <View className={styles.t_p}>
    //       <View className={styles.t}>资质与受训</View>
    //       <View className={styles.zizhi}>
    //         <View className={styles.tag}>资质</View>
    //         <View>
    //           {consultantInfo.certificationList.map((item: any) => {
    //             return (
    //               <View className={styles.zz} key={item}>
    //                 {item}
    //               </View>
    //             );
    //           })}
    //         </View>
    //       </View>
    //       {consultantInfo.longTermTrainingList.length ? (
    //         <View className={styles.changqiView}>
    //           <View className={styles.changqi}>
    //             <View className={styles.tag}>培训</View>
    //             <View>
    //               <View className={styles.zz}>长程系统培训</View>
    //             </View>
    //           </View>
    //           <View>
    //             <View className={styles.list}>
    //               <View className={styles.left}></View>
    //               <View
    //                 className={`${styles.right} ${
    //                   consultantInfo.longTermTrainingList.length > 1 ? styles.rightMore : ''
    //                 }`}
    //               >
    //                 {consultantInfo.longTermTrainingList.map((item: any, index: number) => {
    //                   return (
    //                     <View key={item.title + '_t'} className={styles.item}>
    //                       <View className={styles.point}></View>
    //                       <View className={styles.time}>
    //                         {formatDate(item.startTime, 'YYYY.MM')}-
    //                         {formatDate(item.endTime, 'YYYY.MM')}
    //                       </View>
    //                       <View
    //                         className={
    //                           index == consultantInfo.longTermTrainingList.length - 1
    //                             ? styles.ptt
    //                             : styles.pt
    //                         }
    //                       >
    //                         {item.title}
    //                       </View>
    //                     </View>
    //                   );
    //                 })}
    //               </View>
    //             </View>
    //           </View>
    //         </View>
    //       ) : null}
    //       {consultantInfo.shortTermTraininglist && consultantInfo.shortTermTraininglist.length ? (
    //         <View className={styles.duanqiView}>
    //           <View className={styles.changqi}>
    //             <View className={styles.tag}>培训</View>
    //             <View>
    //               <View className={styles.zz}>短期培训</View>
    //             </View>
    //           </View>
    //           <View>
    //             <View className={styles.list}>
    //               <View className={styles.left}></View>
    //               <View className={styles.right}>
    //                 {consultantInfo.shortTermTraininglist.map((item: any, index: number) => {
    //                   return (
    //                     <View key={item.title + '_t'} className={styles.item}>
    //                       <View className={styles.point}></View>
    //                       <View className={styles.time}>{item.time}</View>
    //                       <View
    //                         className={
    //                           index == consultantInfo.shortTermTraininglist.length - 1
    //                             ? styles.ptt
    //                             : styles.pt
    //                         }
    //                       >
    //                         {item.title}
    //                       </View>
    //                     </View>
    //                   );
    //                 })}
    //               </View>
    //             </View>
    //           </View>
    //         </View>
    //       ) : null}
    //     </View>
    //     {consultantInfo.educationHistory.length ? (
    //       <View className={styles.t_p}>
    //         <View className={styles.t}>教育经历</View>
    //         <View className={styles.jiaoyujingli}>
    //           <View className={styles.list}>
    //             <View className={styles.left}></View>
    //             <View className={styles.right}>
    //               {consultantInfo.educationHistory.map((item: any, index: number) => {
    //                 return (
    //                   <View key={item.title + '_t'} className={styles.item}>
    //                     <View className={styles.point}></View>
    //                     <View className={styles.time}>
    //                       {formatDate(item.startTime, 'YYYY.MM')}-
    //                       {formatDate(item.endTime, 'YYYY.MM')}
    //                     </View>
    //                     <View
    //                       className={
    //                         index == consultantInfo.educationHistory.length - 1
    //                           ? styles.ptt
    //                           : styles.pt
    //                       }
    //                     >
    //                       {item.schoolName} | {item.major} | {item.degree}
    //                     </View>
    //                   </View>
    //                 );
    //               })}
    //             </View>
    //           </View>
    //         </View>
    //       </View>
    //     ) : null}
    //     <View className={styles.t_p}>
    //       <View className={styles.t}>咨询过程及方式</View>
    //       <View className={styles.pp}>{consultantInfo.consultationProcess}</View>
    //     </View>
    //     <View className={styles.t_p}>
    //       <View className={styles.t}>费用说明</View>
    //       <View className={styles.pp}>{consultantInfo.feeDescription}</View>
    //     </View>
    //     <View className={styles.t_p}>
    //       <View className={styles.t}>
    //         可约时间<Text>（北京时间）</Text>
    //       </View>
    //       <View
    //         className={styles.kysj}
    //         onClick={() => {
    //           // if (app.inApp()) {
    //           //   navigateTo('/consultant/chooseAppointment', { id: this.counselorId }, true);
    //           // } else {
    //           //   navigateTo('/consultant/chooseAppointment?id=' + this.counselorId);
    //           // }
    //         }}
    //       >
    //         {consultantInfo.scheduleList.map((item: any) => {
    //           return (
    //             <View className={styles.kyyysj} key={item.date}>
    //               <View className={classnames(item.status == '0' ? styles.bg0 : styles.bg1)}>
    //                 <View className={styles.week}>{item.week}</View>
    //                 <KYNumber className={styles.d}>
    //                   {item.month}.{item.day < 9 ? '0' + item.day : item.day}
    //                 </KYNumber>
    //               </View>
    //               {item.status == '0' ? (
    //                 <View className={styles.ky0}>
    //                   余<Text>{item.availableNum}</Text>
    //                 </View>
    //               ) : null}
    //               {item.status == '1' ? <View className={styles.ky1}>已满</View> : null}
    //               {item.status == '2' ? <View className={styles.ky2}>休息</View> : null}
    //             </View>
    //           );
    //         })}
    //       </View>
    //     </View>
    //     <View className={styles.zzsm}>
    //       <View className={styles.line}></View>
    //       <View className={styles.title}>郑重说明</View>
    //       <View className={styles.p}>
    //         咨询师本人承诺以上资料真实准确，接受公众监督并为此承担相应法律责任。如你发现有虚假信息，请联系平台客服进行投诉。
    //       </View>
    //     </View>
    //   </KYPage>
    // );
    console.log(
      'consultantInfo.profileSummary1',
      consultantInfo.profileSummary1,
      consultantInfo.profileSummary2,
      consultantInfo.profileSummary,
    );
    return (
      <View>
        {!consultantInfo.profileSummary1 && !consultantInfo.profileSummary2 ? (
          <View className={styles.CounselorInfo} style={{ position: 'fixed', top: '-1000px' }}>
            <View className={styles.t_p}>
              <View className={styles.t}>个人简介</View>
              <View className={styles.w}>
                <View className={styles.p} id="jisuandedom">
                  {consultantInfo.profileSummary}
                </View>
              </View>
            </View>
          </View>
        ) : (
          <KYPage className={styles.CounselorInfo}>
            {consultantInfo.profileSummary2 ? (
              <View className={styles.t_p}>
                <View className={styles.t}>个人简介</View>
                <View className={styles.w}>
                  <View className={styles.p}>{consultantInfo.profileSummary2}</View>
                </View>
              </View>
            ) : null}
            {consultantInfo.profileSummary1 ? (
              <View className={styles.t_p}>
                <View className={styles.t}>个人简介</View>
                <View className={styles.w}>
                  <input type="checkbox" id="exp" className={styles.exp} style={{ width: 0 }} />
                  <View className={styles.p}>
                    <label className={styles.b} htmlFor="exp"></label>
                    {consultantInfo.profileSummary1}
                  </View>
                </View>
              </View>
            ) : null}
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
              {consultantInfo.shortTermTraininglist &&
              consultantInfo.shortTermTraininglist.length ? (
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
                      <View className={styles.right}>
                        {consultantInfo.shortTermTraininglist.map((item: any, index: number) => {
                          return (
                            <View key={item.title + '_t'} className={styles.item}>
                              <View className={styles.point}></View>
                              <View className={styles.time}>{item.time}</View>
                              <View
                                className={
                                  index == consultantInfo.shortTermTraininglist.length - 1
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
            </View>
            {consultantInfo.educationHistory.length ? (
              <View className={styles.t_p}>
                <View className={styles.t}>教育经历</View>
                <View className={styles.jiaoyujingli}>
                  <View className={styles.list}>
                    <View className={styles.left}></View>
                    <View className={styles.right}>
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
            <View className={styles.t_p}>
              <View className={styles.t}>费用说明</View>
              <View className={styles.pp}>{consultantInfo.feeDescription}</View>
            </View>
            <View className={styles.t_p}>
              <View className={styles.t}>
                可约时间<Text>（北京时间）</Text>
              </View>
              <View
                className={styles.kysj}
                onClick={() => {
                  // if (app.inApp()) {
                  //   navigateTo('/consultant/chooseAppointment', { id: this.counselorId }, true);
                  // } else {
                  //   navigateTo('/consultant/chooseAppointment?id=' + this.counselorId);
                  // }
                }}
              >
                {consultantInfo.scheduleList.map((item: any) => {
                  return (
                    <View className={styles.kyyysj} key={item.date}>
                      <View className={classnames(item.status == '0' ? styles.bg0 : styles.bg1)}>
                        <View className={styles.week}>{item.week}</View>
                        <KYNumber className={styles.d}>
                          {item.month}.{item.day < 9 ? '0' + item.day : item.day}
                        </KYNumber>
                      </View>
                      {item.status == '0' ? (
                        <View className={styles.ky0}>
                          余<Text>{item.availableNum}</Text>
                        </View>
                      ) : null}
                      {item.status == '1' ? <View className={styles.ky1}>已满</View> : null}
                      {item.status == '2' ? <View className={styles.ky2}>休息</View> : null}
                    </View>
                  );
                })}
              </View>
            </View>
            <View className={styles.zzsm}>
              <View className={styles.line}></View>
              <View className={styles.title}>郑重说明</View>
              <View className={styles.p}>
                咨询师本人承诺以上资料真实准确，接受公众监督并为此承担相应法律责任。如你发现有虚假信息，请联系平台客服进行投诉。
              </View>
            </View>
          </KYPage>
        )}
      </View>
    );
  }
}

export default CounselorPersonalIntroduction;
