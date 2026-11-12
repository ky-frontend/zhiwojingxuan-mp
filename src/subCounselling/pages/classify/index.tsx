import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import Taro from '@tarojs/taro';
import { KYLoading } from '@/components/KYLoading';
import styles from './index.module.less';
import CounsellingClassify from './Councelling';
import CoachClassify from './Coach';

type Props = {};
type States = {
  offset: number;
  type: string;
};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  $instance = Taro.getCurrentInstance();
  state = {
    offset: 0,
    type: '', // 区分聊愈和教练金刚位的跳转
  };

  get counsellingIndexStore() {
    return this.store.counsellingIndexStore;
  }

  get coachIndexStore() {
    return this.store.coachInfoStore;
  }

  async onLoad() {
    const type = this.$instance.router?.params?.type || '';
    if (!type) {
      Taro.showToast({
        title: '参数错误',
        icon: 'none',
      });
      Taro.navigateBack();
      return;
    }
    this.counsellingIndexStore.counsellingDoctorClassifyList = [];
    this.coachIndexStore.coachDoctorClassifyList = [];

    // 聊愈金刚位
    if (type === 'Counselling') {
      // 调用疗愈师傅分类的列表
      KYLoading.show();
      await this.counsellingIndexStore.getCounsellingDoctorClassifyList({
        classifyId: this.$instance.router?.params.classifyId || '',
        offset: this.state.offset,
        limit: 10,
      });
      KYLoading.hide();

      this.setState({
        offset: this.counsellingIndexStore.counsellingDoctorClassifyList.length,
        type,
      });
    } else if (type === 'Coach') {
      // 教练金刚位

      // 调用疗愈师傅分类的列表
      KYLoading.show();
      await this.coachIndexStore.getCoachClassifyList({
        offset: this.state.offset,
        limit: 10,
        trouble: [this.$instance.router?.params.trouble || ''],
        appItemKey: '',
        serviceType: '',
      });
      KYLoading.hide();

      this.setState({
        offset: this.coachIndexStore.coachDoctorClassifyList.length,
        type,
      });
    }
  }

  async onReachBottom() {
    if (this.state.type === 'Counselling') {
      KYLoading.show();
      await this.counsellingIndexStore.getCounsellingDoctorClassifyList({
        classifyId: this.$instance.router?.params.classifyId || '',
        offset: this.state.offset,
        limit: 10,
      });
      KYLoading.hide();

      this.setState({
        offset: this.counsellingIndexStore.counsellingDoctorClassifyList.length,
      });
    } else if (this.state.type === 'Coach') {
      // 调用疗愈师傅分类的列表
      KYLoading.show();
      await this.coachIndexStore.getCoachClassifyList({
        offset: this.state.offset,
        limit: 10,
        trouble: [this.$instance.router?.params.trouble || ''],
        appItemKey: '',
        serviceType: '',
      });
      KYLoading.hide();
      // 调用疗愈师傅分类的列表
      this.setState({
        offset: this.coachIndexStore.coachDoctorClassifyList.length,
      });
    }
  }

  render() {
    const { title } = this.$instance.router?.params as { id: string; title: string };
    const { type } = this.state;
    return (
      <KYPage className={styles.index}>
        <KYNavigation bgColor="#fff" showBack title={title} />
        {type === 'Counselling' ? (
          <CounsellingClassify list={this.counsellingIndexStore.counsellingDoctorClassifyList} />
        ) : (
          <CoachClassify list={this.coachIndexStore.coachDoctorClassifyList} />
        )}
      </KYPage>
    );
  }
}

export default Index;
