import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { KYLoading } from '@/components/KYLoading';
import { coachApi, courseApi } from '@/services';
import Taro from '@tarojs/taro';
import CustomService from './CustomService';

/**
 * 支付结果页
 * - 教练：customService=1 & coachId → 教练客服码
 * - 课：type=course & Id=productId → 商品客服码
 */

type States = {
  isCustomService: boolean;
  info: {
    serviceImg: string;
    serviceText: string;
  };
};
type Props = {};

@inject('store')
@observer
class Index extends BaseKyComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isCustomService: false,
      info: { serviceImg: '', serviceText: '' },
    };
  }

  onLoad(opt) {
    // 购买教练服务成功，添加客服
    if (opt.customService && opt.customService === '1' && opt.coachId) {
      this.setState({ isCustomService: true });
      this.getCoachServiceInfo(opt.coachId);
      return;
    }

    // 购买 KY 课成功
    if (opt.type === 'course' && opt.Id) {
      this.setState({ isCustomService: true });
      this.getCourseServiceInfo(opt.Id);
      return;
    }

    Taro.showToast({ title: '参数错误', icon: 'none' });
  }

  async getCoachServiceInfo(coachId: string) {
    KYLoading.show();
    const res = await coachApi.getCoachInfo(coachId);
    KYLoading.hide();
    if (res.code === 0) {
      this.setState({
        info: {
          serviceImg: res.data.qrCode || '',
          serviceText: res.data.qrCodeDesc || '',
        },
      });
    }
  }

  async getCourseServiceInfo(productId: string) {
    KYLoading.show();
    const res = await courseApi.getKYProductDetail(productId);
    KYLoading.hide();
    if (res.code === 0) {
      const productInfo = res.data?.productInfo || {};
      this.setState({
        info: {
          serviceImg: productInfo.qrCodeImage || '',
          serviceText: productInfo.qrCodeText || '长按添加客服微信',
        },
      });
    } else {
      Taro.showToast({ title: res.message || '获取客服信息失败', icon: 'none' });
    }
  }

  render() {
    const { isCustomService, info } = this.state;
    return (
      <KYPage className="index">
        <KYNavigation showBack />
        {isCustomService && info.serviceImg ? (
          <CustomService info={{ serviceImg: info.serviceImg, serviceText: info.serviceText }} />
        ) : null}
      </KYPage>
    );
  }
}

export default Index;
