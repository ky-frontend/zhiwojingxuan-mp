import { observer, inject } from 'mobx-react';
import { SEARCH_INPUT_KEY, serviceTypeOptions } from '@/constants/values';
import { IdentityTagsEnum } from '@ky-middleground/user-type';
import classNames from 'classnames';
import { CounselorIdentityEnum } from '@/types/common.type';
import { KYTrack } from '@/modules/track';
import {
  T_ConsultantSerarchClick,
  T_ConsultantSerarchResultView,
  T_ConsultantSerarchResultClick,
} from '@/modules/track/events';
import { navigateTo } from '@/utils/navigate';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image, Input, Text, ScrollView } from '@tarojs/components';
import KYPage from '@/components/KYPage';
import KYNavigation from '@/components/KYNavigation';
import Taro from '@tarojs/taro';
// import { userApi } from '@/services';
import styles from './index.module.less';

interface SearchState {
  inputValue: string;
  storageValue: string[];
  searchData: searchDataItem[];
}

type searchDataItem = {
  id: string;
  name: string;
  avatar: string;
  doctorServiceCount: string;
  identityTags: IdentityTagsEnum[];
};

@inject('store')
@observer
class Search extends BaseKyComponent<{}, SearchState> {
  state = {
    inputValue: '',
    storageValue: Taro.getStorageSync(SEARCH_INPUT_KEY) || [],
    searchData: [],
  };

  async componentDidMount() {
    console.log('search componentDidMount');
    // const res = await userApi.getCountryCodeList();
    // console.log(res);
  }

  componentWillUnmount() {
    console.log('search componentWillUnmount');
  }

  componentDidShow() {
    console.log('search componentDidShow');
  }

  componentDidHide() {
    console.log('search componentDidHide');
  }

  onSearch = async () => {
    const { inputValue } = this.state;
    await this.store.consultantIndexStore.toSearchDoctorAndConsultantList({
      // limit: 100,
      offset: 0,
      keyWord: inputValue,
    });
    const { list } = this.store.consultantIndexStore.searchDoctorAndConsultantList;

    this.setState({
      searchData:
        list.length > 0
          ? list.map((item) => {
              const isCoach = item.identityTags.includes(IdentityTagsEnum.coach);
              const info = {
                id: item.id,
                name: item.name,
                avatar: item.avatar,
                doctorServiceCount: item.doctorServiceCount,
                identityTags: item.identityTags,
                constantServiceTime: item.constantServiceTime,
              };
              return isCoach ? { ...info, coachId: item.coachId } : info;
            })
          : [],
    });

    // save to storage
    const search_storage_value = Taro.getStorageSync(SEARCH_INPUT_KEY) || [];
    if (!search_storage_value.includes(inputValue)) {
      search_storage_value.push(inputValue);
      Taro.setStorageSync(SEARCH_INPUT_KEY, search_storage_value);
      // save to state
      this.setState({ storageValue: search_storage_value });
    }

    // 埋点: 聊愈下单页开始聊愈按钮点击
    KYTrack(T_ConsultantSerarchClick());

    if (list.length > 0) {
      // 埋点: 搜索结果页浏览
      KYTrack(T_ConsultantSerarchResultView());
    }
  };

  searchInputChange = (e: any) => {
    this.setState({ inputValue: e.detail.value });
  };

  handleCancel() {
    Taro.navigateBack();
  }

  handleTag = (val: string) => {
    this.setState(
      (preState) => ({ inputValue: val }),
      () => {
        this.onSearch();
      },
    );
  };

  handleClearValue = () => {
    this.setState({ inputValue: '', searchData: [] });
  };

  handleDelete = () => {
    Taro.removeStorageSync(SEARCH_INPUT_KEY);
    this.setState({ storageValue: [] });
  };

  // highlight
  highlightTxt = (txt: string) => {
    const { inputValue } = this.state;
    const start = txt.toLowerCase().indexOf(inputValue.toLowerCase());
    if (start === -1) return txt;
    const end = start + inputValue.length;
    const beforeHighlight = txt.substring(0, start);
    const highlightedText = txt.substring(start, end);
    const afterHighlight = txt.substring(end);
    return (
      <>
        {beforeHighlight}
        <Text style={{ color: '#3B3FBD' }}>{highlightedText}</Text>
        {afterHighlight}
      </>
    );
  };

  handleCounsellingPage(item) {
    // 埋点: 搜索结果页Cell点击
    KYTrack(
      T_ConsultantSerarchResultClick({
        consultant_id: item.id,
        consultant_name: item.name,
      }),
    );
    const identity =
      item.identityTags[0] === IdentityTagsEnum.zixunshi
        ? CounselorIdentityEnum.Consultant
        : item.identityTags[0] === IdentityTagsEnum.liaoyushi
          ? CounselorIdentityEnum.Counselling
          : IdentityTagsEnum.coach;

    navigateTo(
      `/subCommon/pages/userInfo/index?sence=${identity === IdentityTagsEnum.coach ? item.coachId : item.id}&identity=${identity}&userAliasId=${item.id}`,
    );
  }

  getServiceCountText = (count: any) => {
    if (count < 100) {
      return '近100';
    }

    // 大于等于100时，按100区间显示
    const divisor = Math.floor(count / 100) * 100;
    return `${divisor}+`;
  };

  render() {
    const { inputValue, storageValue, searchData } = this.state;
    const { list } = this.store.consultantIndexStore.searchDoctorAndConsultantList;
    return (
      <KYPage className={styles.search}>
        <KYNavigation showBack bgColor="#fff" />

        <View className={styles.search_input}>
          <Image
            src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/wechat/20231116_search.png"
            className={styles.search_input_icon}
          />
          <View className={styles.search_input_form}>
            <Input
              focus
              value={inputValue}
              onConfirm={this.onSearch}
              className={styles.input}
              onInput={this.searchInputChange}
              placeholder="请输入【姓名/关键词】进行查找"
            />
            <Image
              src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/liaoyu/icon_close_20230615.png"
              className={styles.search_input_close}
              onClick={this.handleClearValue}
            />
          </View>
          <Text className={styles.search_input_txt} onClick={this.handleCancel}>
            取消
          </Text>
        </View>

        {/* 搜索内容 */}
        {searchData.length !== 0 && (
          <ScrollView>
            <View className={styles.search_scroll_wrapper}>
              {searchData.map((item: any, index) => (
                <View
                  key={index}
                  className={styles.search_scroll}
                  onClick={() => this.handleCounsellingPage(item)}
                >
                  <Image src={item.avatar} className={styles.icon} />
                  <View className={styles.search_scroll_r}>
                    <View className={styles.search_scroll_r_top}>
                      <Text className={styles.search_scroll_r_top_txt}>
                        {this.highlightTxt(item.name)}
                      </Text>
                      {item.identityTags[0] === IdentityTagsEnum.zixunshi ? (
                        <View
                          className={classNames({
                            [styles.search_scroll_r_top_tag]: true,
                            [styles.search_scroll_r_top_tag_zixunshi]:
                              item.identityTags[0] === IdentityTagsEnum.zixunshi,
                          })}
                        >
                          <Image
                            src={this.store.platformStore.tagLabel[item.identityTags[0]].small.url}
                            className={styles.tag}
                          />
                          {item.identityTags[0] === IdentityTagsEnum.liaoyushi && (
                            <Text>聊愈师</Text>
                          )}
                          {item.identityTags[0] === IdentityTagsEnum.zixunshi && (
                            <Text>咨询师</Text>
                          )}
                        </View>
                      ) : null}
                    </View>
                    <View className={styles.search_scroll_r_bottom}>
                      {item.identityTags[0] === IdentityTagsEnum.liaoyushi
                        ? `服务人次:  ${item.doctorServiceCount ? this.getServiceCountText(item.doctorServiceCount) : '0'}`
                        : item.identityTags[0] === IdentityTagsEnum.zixunshi
                          ? `咨询时长: ${item.constantServiceTime}`
                          : item?.serviceType?.length
                            ? item.serviceType.map((element, i) => {
                                return (
                                  <View key={i}>
                                    {i + 1 === item.serviceType.length
                                      ? serviceTypeOptions.find((e) => element === e.value)?.label
                                      : `${serviceTypeOptions.find((e) => element === e.value)?.label} |`}
                                    &nbsp;
                                  </View>
                                );
                              })
                            : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* 历史搜索 */}
        {storageValue.length !== 0 && searchData.length === 0 && (
          <View className={styles.search_history}>
            <View className={styles.search_history_top}>
              <Text className={styles.search_history_top_txt}>历史搜索</Text>
              <Image
                src="http://kypublic.oss-cn-shanghai.aliyuncs.com/icon/exam/20231018_delete.png"
                className={styles.search_history_top_icon}
                onClick={this.handleDelete}
              />
            </View>
            <View className={styles.search_history_bottom}>
              {storageValue.map((item, index) => (
                <Text
                  key={index}
                  className={styles.search_history_bottom_tag}
                  onClick={() => this.handleTag(item)}
                >
                  {item}
                </Text>
              ))}
            </View>
          </View>
        )}
      </KYPage>
    );
  }
}

export default Search;
