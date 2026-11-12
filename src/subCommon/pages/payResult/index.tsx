import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { KYLoading } from '@/components/KYLoading';
import { coachApi } from '@/services';
import CustomService from './CustomService';

type States = {
  isCustomService: boolean;
  info: any;
};
type Props = {};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isCustomService: false,
      info: {},
    };
  }

  async componentDidMount() {
    console.log('componentDidMount');
  }
  onLoad(opt) {
    // 购买教练服务成功，添加客服
    if (opt.customService && opt.customService === '1' && opt.coachId) {
      this.setState({ isCustomService: true });
      this.getProductInfo(opt.coachId);
    }
  }

  // 获取产品信息
  async getProductInfo(coachId: string) {
    KYLoading.show();
    const res = await coachApi.getCoachInfo(coachId);

    KYLoading.hide();
    if (res.code === 0) {
      this.setState({ info: res.data });
    }
  }

  render() {
    const { isCustomService, info } = this.state;
    return (
      <KYPage className="index">
        <KYNavigation showBack />
        {isCustomService && (
          <CustomService info={{ serviceImg: info.qrCode, serviceText: info.qrCodeDesc }} />
        )}
      </KYPage>
    );
  }
}

export default Index;
