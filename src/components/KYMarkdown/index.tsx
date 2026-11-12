import BaseKyComponent from '@/components/BaseKyComponent';
import '@tarojs/taro/html5.css';
import markdownIt from 'markdown-it';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import styles from './index.module.less';

type Props = {
  url: string;
};
type States = {
  text: string;
};

@inject('store')
@observer
class KYMarkdown extends BaseKyComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      text: '',
    };
  }

  async componentDidMount() {
    // 获取md
    Taro.request({
      url: this.props.url,
      header: {
        'content-type': 'application/json', // 默认值
      },
      success: async (res) => {
        const md = markdownIt({
          html: false,
          xhtmlOut: false,
          breaks: true, // 转换段落里的 '\n' 到 <br>。
          langPrefix: 'language-',
          linkify: false,
          typographer: false,
          quotes: '<>',
          highlight: (str, lang) => {
            console.log(str, lang);
            return str;
          },
        });
        this.setState({
          text: md.render(res.data),
        });
      },
    });
  }
  render() {
    return (
      <View className={styles['markdown-body']}>
        <View className="taro_html" dangerouslySetInnerHTML={{ __html: this.state.text }}></View>
        {/* <RichText nodes={this.state.text}></RichText> */}
      </View>
    );
  }
}

export default KYMarkdown;
