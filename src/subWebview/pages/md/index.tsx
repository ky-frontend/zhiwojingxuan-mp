import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
// import { userApi } from '@/services';
import KYMarkdown from '@/components/KYMarkdown';
import { platformApi } from '@/services';
import styles from './index.module.less';

type IMDState = {
  title: string;
  url: string;
};

@inject('store')
@observer
class KYMD extends BaseKyComponent<{}, IMDState> {
  state: Readonly<IMDState> = {
    title: '',
    url: '',
  };

  async onLoad(option) {
    const { protocolId } = option;
    const res = await platformApi.getProtocolByProtocolId(protocolId);
    if (res.code == 0) {
      this.setState({
        title: res.data.title || '',
        url: res.data.file,
      });
    }
  }

  render() {
    return (
      <KYPage className={styles.KYMD}>
        <KYNavigation title={this.state.title} bgColor="#fff" />
        <View className={styles.content}>
          {this.state.url ? <KYMarkdown url={this.state.url}></KYMarkdown> : null}
        </View>
      </KYPage>
    );
  }
}

export default KYMD;
