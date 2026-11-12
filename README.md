# 知我心理教练小程序（mini-program2）

基于 `mini-program` 精简复刻：仅保留 **心理教练 / 我的** 及心理教练相关支付。

- AppID: `wx722d5fe3d9f5f963`
- 底部 Tab：心理教练、我的
- 已去掉「困境破局」业务线及顶部双 Tab（困境破局 / 情绪下头），首页仅展示原「情绪下头」（即时咨询）数据

## 开发

```bash
pnpm install
pnpm run dev:weapp
```

用微信开发者工具打开本目录，勾选 `dist` 为小程序根目录。

## webview

```
subWebview/pages/webviewV1/index?url=encodeURIComponent('')
```

## markdown

```
subWebview/pages/md/index?protocolId='yueshiyinsibaohuzhengce'
```
