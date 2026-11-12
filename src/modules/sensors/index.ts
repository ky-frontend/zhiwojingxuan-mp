/**
 * 神策埋点已下线（服务到期），保留空实现避免历史引用报错
 */
const track = {
  setup() {},
  async login() {},
  async track(_type: string, _params?: any) {},
};

export default track;
