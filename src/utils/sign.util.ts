import md5 from 'md5';

export class SignUtil {
  /**
   * c端用户验证签名
   * 只有是接口请求的时候才会进行验签，headers中添加x-no-sig=true就会跳过验签
   * 验签规则：
   * 将body或者query中的参数拿出来
   * 与header中的X-AppId、X-Version、X-TimeStamp
   * 还有固定的盐sigKey
   * 组成key=value的字符串数组
   * 按照字母排序并用&链接成一个字符串进行md5加密，然后和传递过来的X-Sig对比
   * @description 生成签名，盐在代码中，嘘！！！
   * @param headers 请求头的数据
   * @param params query
   * @returns string
   */
  static createSign(headers: any, params = {}): string {
    const dataList: string[] = [
      `appid=${headers['x-appid']}`,
      `version=${headers['x-version']}`,
      `timeStamp=${headers['x-timestamp']}`,
      `sigKey=${'cc.knowyourself'}`,
    ];
    const data: any = {};
    Object.assign(data, params);
    for (const key in data) {
      dataList.push(`${key}=${data[key]}`);
    }
    // console.dir(dataList);
    return md5(dataList.sort().join('&'));
  }
}
