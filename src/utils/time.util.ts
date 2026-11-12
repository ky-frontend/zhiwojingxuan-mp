import { formatDate } from './util';

/**
 * @description: 时间格式化
 * @param {string} fmt
 * 如果时间小于10分钟，显示刚刚
 * 如果时间小于1小时，显示xx分钟前
 * 如果时间小于1天，显示xx小时前
 * 如果时间小于10天，显示xx天前
 * 如果跨月，显示xx月xx日
 * 如果跨年，显示xxxx年xx月xx日
 */
export function formatTime(fmt) {
  const date = new Date(fmt);
  const now = Date.now();
  const diff = (now - date.getTime()) / 1000;
  if (diff < 600) {
    return '刚刚';
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`;
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`;
  } else if (diff < 864000) {
    return `${Math.floor(diff / 86400)}天前`;
  } else if (date.getFullYear() === new Date().getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
}
/**
 * 时间错
 * 时间格式化
 * 如果是今天的显示时间
 * 如果是昨天的显示昨天 时间
 * 如果在之前，但是是在本年的显示 显示xx月xx日
 * 如果跨年，显示xxxx年xx月xx日
 */
export function formatTIME(date) {
  const begin = new Date().setHours(0, 0, 0);
  if (date > begin) {
    return formatDate(date, 'HH:MM');
  } else {
    const diff = (begin - date) / 1000;
    if (diff < 86400) {
      return `昨天 ${formatDate(date, 'HH:MM')}`;
    } else if (diff > 86400 && new Date(date).getFullYear() === new Date(date).getFullYear()) {
      return `${new Date(date).getMonth() + 1}月${new Date(date).getDate()}日`;
    } else {
      return `${new Date(date).getFullYear()}年${new Date(date).getMonth() + 1}月${new Date(
        date,
      ).getDate()}日`;
    }
  }
}
