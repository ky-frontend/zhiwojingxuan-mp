import { observer, inject } from 'mobx-react';
import { View } from '@tarojs/components';
import BaseKyComponent from '../BaseKyComponent';
import styles from './index.module.less';

type Props = {
  title: string;
  onchange: (i: number) => void;
  default: any;
  sureText?: string;
  denyText?: string;
  disabled?: boolean;
};

type States = {
  choose: number;
};

@inject('store')
@observer
class KYChoose extends BaseKyComponent<Props, States> {
  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.state = {
      choose: this.props.default,
    };
  }


  componentDidUpdate(prevProps: Readonly<Props>) {
    if (this.props.default != prevProps.default) {
      this.setState({ choose: this.props.default });
    }
  }

  render() {
    const { title, onchange, denyText = '没有', sureText = '有', disabled = false } = this.props;

    return (
      <View className={styles.question}>
        <View className={styles.title}>
          <View className={styles.star}>*</View>
          <View className={styles.name}>{title}</View>
        </View>

        <View
          className={styles.label}
          onClick={() => {
            if (!disabled) {
              if (this.state.choose == 0) {
                this.setState({ choose: -1 });
                onchange(-1);
              } else {
                this.setState({ choose: 0 });
                onchange(0);
              }
            }
          }}
        >
          <View
            className={this.state.choose == 0 ? styles.choosesquare : styles.square}
            style={disabled ? { opacity: '0.2' } : {}}
          ></View>
          <View className={styles.word}>{denyText}</View>
        </View>
        <View
          className={styles.label}
          onClick={() => {
            if (!disabled) {
              if (this.state.choose == 1) {
                this.setState({ choose: -1 });
                onchange(-1);
              } else {
                this.setState({ choose: 1 });
                onchange(1);
              }
            }
          }}
        >
          <View
            className={this.state.choose == 1 ? styles.choosesquare : styles.square}
            style={disabled ? { opacity: '0.2' } : {}}
          ></View>
          <View className={styles.word}>{sureText}</View>
        </View>
      </View>
    );
  }
}

export default KYChoose;
