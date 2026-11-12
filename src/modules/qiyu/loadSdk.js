// 加载七鱼sdk
export const loadSdk = () => {
  return new Promise((resolve) => {
    // 网易七鱼im接入
    (function (w, d, n, a, j) {
      w[n] =
        w[n] ||
        function () {
          (w[n].a = w[n].a || []).push(arguments);
        };
      j = d.createElement('script');
      j.async = true;
      j.src = 'https://qiyukf.com/script/b17b7837c7d1fbed61fe2e10d4394d17.js?hidden=1';
      d.body.appendChild(j);
    })(window, document, 'ysf');
    window.isSdkReady = false;
    window.ysf('onready', function () {
      window.isSdkReady = true;
      resolve();
    });
  });
};
