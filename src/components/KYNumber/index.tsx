import { CSSProperties } from 'react';
import { Text } from '@tarojs/components';
import BaseKyComponent from '../BaseKyComponent';

type IKYNumberProps = {
  type?: 'Regular' | 'Bold';
  color?: string;
  style?: CSSProperties | undefined;
  className?: string;
  children?: React.ReactNode;
};

class KYNumber extends BaseKyComponent<IKYNumberProps, {}> {
  render() {
    const { children, type = 'Regular', color = '#000', style = {}, className = '' } = this.props;

    return (
      <Text style={{ fontFamily: 'Repair-' + type, color: color, ...style }} className={className}>
        {children}
      </Text>
    );
  }
}

export default KYNumber;
