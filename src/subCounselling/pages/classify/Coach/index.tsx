import { observer, inject } from 'mobx-react';
import BaseKyComponent from '@/components/BaseKyComponent';
import { View, Image } from '@tarojs/components';
import { navigateTo } from '@/utils/navigate';
import { ImgUrlFormat } from '@/modules/utils/format';
import classNames from 'classnames';
import styles from './index.module.less';

const serviceTypeOptions = [
  { label: '个体服务', value: 'Single' },
  { label: '伴侣服务', value: 'Partner' },
  { label: '家庭服务', value: 'Family' },
];
type ClassifyProps = {
  list: any[];
};

// 金刚位list
const troubleJinGang = [
  {
    id: 'Intimate',
    title: '亲密关系',
    image: 'https://cdn-public.knowyourself.cc/icon/coach/20250609_icon1.png',
    tag: 'https://cdn-public.knowyourself.cc/icon/coach/20250617_qinmi.png',
  },
  {
    id: 'Career',
    title: '职业生涯',
    image: 'https://cdn-public.knowyourself.cc/icon/coach/20250609_icon2.png',
    tag: 'https://cdn-public.knowyourself.cc/icon/coach/20250617_career.png',
  },
  {
    id: 'Family',
    title: '家庭亲子',
    image: 'https://cdn-public.knowyourself.cc/icon/coach/20250609_icon3.png',
    tag: 'https://cdn-public.knowyourself.cc/icon/coach/20250617_family.png',
  },
];

interface ClassifyState {
  offset: number;
}

@inject('store')
@observer
class CoachClassify extends BaseKyComponent<ClassifyProps, ClassifyState> {
  state = {
    offset: 0,
  };

  getTag = (trouble) => {
    const data = troubleJinGang.find((item) => item.id === trouble);

    return data && data.image ? <Image className={styles.tag} src={data.tag} /> : null;
  };

  render() {
    const { list } = this.props;

    return (
      <View className={styles.classifyJingGang}>
        {list.length > 0 ? (
          <View className={styles.doctorList}>
            {list.map((item, index) => {
              return (
                <View
                  key={index}
                  className={classNames({
                    [styles.item]: true,
                  })}
                  onClick={() => {
                    navigateTo(
                      `/subCommon/pages/userInfo/index?sence=${item.coachId}&identity=${'coach'}`,
                    );
                  }}
                >
                  <View className={styles.left}>
                    <Image
                      src={ImgUrlFormat.imagesLimFunc(item.avatar)}
                      className={styles.avatar}
                      mode="aspectFill"
                    />
                    {this.getTag(item.trouble[0])}
                  </View>
                  <View className={styles.right}>
                    <View className={styles.info}>
                      <View className={styles.name}>{item.realName}</View>
                    </View>
                    <View style={{ display: 'flex' }}>
                      {item.serviceType.map((element, i) => {
                        return (
                          <View className={styles.p2} key={i}>
                            {i + 1 === item.serviceType.length
                              ? serviceTypeOptions.find((e) => element === e.value)?.label
                              : `${serviceTypeOptions.find((e) => element === e.value)?.label} |`}
                            &nbsp;
                          </View>
                        );
                      })}
                    </View>

                    {item.goodAtTags.length > 0 ? (
                      <View className={styles.pp}>
                        <Image
                          src="https://cdn-public.knowyourself.cc/icon/coach/20250617_goodAt.png"
                          className={styles.tImg}
                        />
                        {item.goodAtTags.map((element) => (
                          <View className={styles.c} key={element}>
                            {element}
                          </View>
                        ))}
                      </View>
                    ) : null}

                    <View className={styles.desc}>{item.introduction}</View>

                    <View className={styles.p1}>{item.briefIntroduction}</View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className={styles.empty}>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/liaoyu/empty_img_20230321.png"
            ></Image>
            暂无更多数据
          </View>
        )}
      </View>
    );
  }
}

export default CoachClassify;
