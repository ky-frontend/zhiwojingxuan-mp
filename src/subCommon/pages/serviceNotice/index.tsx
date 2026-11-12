import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { MessageTypeEnum } from '@ky-middleground/notification-type';
import { KYLoading } from '@/components/KYLoading';
import { notificationApi } from '@/services';
import Taro from '@tarojs/taro';
import { View, Image, RichText } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import { isHtmlContent } from '@/utils/util';
import styles from './index.module.less';

const HTML_CONTENT_STYLE =
  'font-size:13px;color:rgba(0,0,0,0.4);letter-spacing:1px;line-height:1.8;';

type IStates = {
  dataList: any;
};

@inject('store')
@observer
class ServiceNotice extends BaseKyComponent<{}, IStates> {
  constructor() {
    super({});
    this.state = {
      dataList: [],
    };
  }
  limit = 20;
  async onLoad() {
    this.getList();
  }

  get imStore() {
    return this.store.imStore;
  }

  componentWillUnmount() {
    console.log('Message componentWillUnmount');
  }

  componentDidShow() {
    console.log('Message componentDidShow');
  }

  onReachBottom() {
    this.getList();
  }
  async getList() {
    KYLoading.show();
    const res = await notificationApi.getMessageList(
      {
        offset: this.state.dataList.length,
        limit: this.limit,
      },
      [MessageTypeEnum.Zxs as any, MessageTypeEnum.System],
    );
    await notificationApi.readMessage([MessageTypeEnum.Zxs as any, MessageTypeEnum.System]);
    KYLoading.hide();
    if (res.code == 0) {
      this.setState({ dataList: [...this.state.dataList, ...res.data.list] });
    }
  }

  render() {
    const { dataList } = this.state;

    return (
      <KYPage className={styles.serviceNotice}>
        <KYNavigation className={styles.back} showBack title="服务通知" />
        {dataList.length ? (
          <View className={styles.content}>
            {dataList.map((item, index) => {
              console.log(this.imStore.calculateTimestamp(new Date(item.createdAt).getTime()));

              return (
                <View className={styles.item} key={index}>
                  <View className={styles.time}>
                    {
                      this.imStore
                        .calculateTimestamp(new Date(item.createdAt).getTime())
                        .split(' ')[0]
                    }
                  </View>
                  <View className={styles.center}>
                    <View className={styles.title}>{item.title}</View>
                    {isHtmlContent(item.content) ? (
                      <View className={styles.Content}>
                        <RichText nodes={item.content} style={HTML_CONTENT_STYLE} />
                      </View>
                    ) : (
                      <View className={styles.Content}>{item.content}</View>
                    )}
                    <View
                      className={styles.footer}
                      onClick={() => {
                        Taro.showToast({
                          title: '请前往知我心理APP进行操作',
                          icon: 'none',
                          duration: 1000,
                        });
                      }}
                    >
                      查看详情
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className={styles.noData}>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/wechat/2024_2_23_empty_Illustration_nothing@3x.png"
            />
            暂无聊愈服务通知
          </View>
        )}
      </KYPage>
    );
  }
}

export default ServiceNotice;
