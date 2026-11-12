import BaseKyComponent from '@/components/BaseKyComponent';
import classNames from 'classnames';
import { View, Image } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';
import KYPopup from '../KYPopup';

export type ListType = { label: string; value: string };

type Props = {
  title?: string;
  data: ListType[];
  choosedStyle?: object; // 选中后的item样式
  isVisible: boolean;
  btnStyle?: object;
  maskClick?: boolean;
  changeVisiable: () => void;
  changeChoose: (value: ListType) => void;
  current?: ListType;
};

type States = {
  choosedItem: ListType;
  isChoosed: boolean;
};

@inject('store')
@observer
class KYPicker extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      choosedItem: this.props.current || { label: '', value: '' },
      isChoosed: false,
    };
  }

  async componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<States>) {
    if (!this.state.isChoosed) {
      if (this.props.current && this.props.current != prevState.choosedItem) {
        this.setState({ choosedItem: this.props.current });
      }
    }
  }

  render() {
    const {
      title,
      isVisible,
      data,
      choosedStyle,
      btnStyle,
      changeChoose,
      changeVisiable,
      maskClick = false,
    } = this.props;
    const { choosedItem } = this.state;

    return (
      <KYPopup visiable={isVisible}>
        <View className={styles.content}>
          <View className={styles.contain}>
            <View className={styles.title}>{title}</View>
            <Image
              className={styles.img}
              src="https://cdn-public.knowyourself.cc/icon/chat/closeWindow@x2.png"
              onClick={() => {
                this.setState({ isChoosed: false });
                this.setState(changeVisiable);
              }}
            />
          </View>

          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              maxHeight: '425px', //原为498px
            }}
          >
            <View className={styles.slide}>
              {data.map((item: any) => {
                return (
                  <View
                    onClick={() => {
                      if (!item.disabled) {
                        this.setState({ choosedItem: item, isChoosed: true });
                      }
                    }}
                    className={classNames(styles.item, {
                      [styles.itemAC]: choosedItem.label == item.label,
                      [styles.itemDisabled]: item.disabled === true,
                    })}
                    style={choosedItem.label == item.label ? choosedStyle : {}}
                    key={item.label}
                  >
                    {item.value}
                  </View>
                );
              })}
            </View>

            <View className={styles.btnview} style={btnStyle}>
              <View
                className={styles.b}
                onClick={() => {
                  this.setState({ isChoosed: false });
                  changeChoose(choosedItem);
                  changeVisiable();
                }}
              >
                确认
              </View>
            </View>
          </View>
        </View>
      </KYPopup>
    );
  }
}

export default KYPicker;
