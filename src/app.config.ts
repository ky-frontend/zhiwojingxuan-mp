export default defineAppConfig({
  pages: ['pages/index/index', 'pages/login/index', 'pages/webview/index'],
  subpackages: [
    {
      root: 'subConsultant',
      pages: [
        // 心理教练协议等仍会跳转 serviceData；其余咨询师页保留以防深链
        'pages/index/index',
        'pages/home/index',
        'pages/chat/index',
        'pages/counselInfo/index',
        'pages/serviceData/index',
        'pages/chooseAppointment/index',
        'pages/internConsultant/index',
      ],
    },
    {
      root: 'subCounselling',
      pages: [
        'pages/index/index',
        'pages/index/classifyJingGang/index',
        'pages/classify/index',
        'pages/payPages/index',
        'pages/chat/index',
        'pages/storageCard/index',
        'pages/storageCardRecord/index',
      ],
    },
    {
      root: 'subCommon',
      pages: [
        'pages/me/index',
        'pages/setting/index',
        'pages/message/index',
        'pages/nickNameDetail/index',
        'pages/search/index',
        'pages/myOrder/index',
        'pages/help/index',
        'pages/userInfo/index',
        'pages/confirmOrder/index',
        'pages/serviceNotice/index',
        'pages/qiYuIm/index',
        'pages/retirement/index',
        'pages/payResult/index',
        'pages/middlePage/index',
      ],
    },
    {
      root: 'subWallet',
      pages: [
        'pages/coupon/index',
        'pages/receviceCoupon/index',
        'pages/myWallet/index',
        'pages/myBill/index',
        'pages/exchangeCode/index',
      ],
    },
    {
      root: 'subWebview',
      pages: ['pages/webviewV1/index', 'pages/md/index'],
    },
    {
      root: 'subPay',
      pages: ['pages/appPay/index'],
    },
    {
      // 二期：短链落地卖课（默认隐藏支付，open=1 才展示）
      root: 'subMarketings',
      pages: ['pages/kyProduct/index'],
    },
  ],
  window: {
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom',
  },
});
