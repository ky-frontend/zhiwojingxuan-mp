import BaseKyComponent from '@/components/BaseKyComponent';
import classNames from 'classnames';
import { View } from '@tarojs/components';
import styles from './index.module.less';

interface Info {
  text: string;
}

type Props = {
  className?: string;
  info: Info;
};
type States = {};

class RichText extends BaseKyComponent<Props, States> {
  /** 文案未变时跳过更新，避免父组件 setState 导致富文本闪烁 */
  shouldComponentUpdate(nextProps: Props) {
    return (
      nextProps.className !== this.props.className ||
      nextProps.info?.text !== this.props.info?.text
    );
  }

  handleHtml = (html: string) => {
    return html
      .replace(/style=""/g, '')
      .replace(/<img/g, '<Image mode="widthFix" style="width:100%"')
      .replace(/(（长按图片可以保存）)/g, '<text></text>')
      .replace(/<br>/g, '<text>\n</text>')
      .replace(/&nbsp;/g, '<text space="nbsp"> </text>');
  };

  render() {
    const { className, info } = this.props;
    return (
      <View
        className={classNames(styles.rich_text_content, className)}
        dangerouslySetInnerHTML={{ __html: this.handleHtml(info.text || '') }}
      />
    );
  }
}

export default RichText;
