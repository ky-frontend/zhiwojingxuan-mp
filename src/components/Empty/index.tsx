import BaseKyComponent from '@/components/BaseKyComponent';
import styles from './index.module.less';

type IEmptyProps = {
  text?: string;
};

class Empty extends BaseKyComponent<IEmptyProps> {
  render() {
    const { text } = this.props;
    return (
      <div className={styles.emptyView}>
        <img
          className={styles.icon}
          src="https://cdn-public.knowyourself.cc/icon/user/20230316_empty_Illustration_nothing.png"
        />
        <p>{text || '暂无相关内容'}</p>
      </div>
    );
  }
}

export default Empty;
