import device from './device';

/**
 * 监听浏览器后退不刷新页面
 * @returns
 */
export default function refreshPage() {
  if (device.isIOS()) {
    window.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        window.location.reload();
      }
    });
  } else {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
    });
  }
}
