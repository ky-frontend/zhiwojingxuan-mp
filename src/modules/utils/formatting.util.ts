import dayjs from 'dayjs';

/**
 * 价格单位转换（分转成元）
 * @param {number} amount 价格
 * @returns
 */
export const formatAmount = (amount: number) => {
  if (typeof amount !== 'number') return '';
  return (amount / 100).toFixed(2);
};

/**
 * 时间秒转换成分钟
 * @param {number} seconds 秒
 * @returns
 */
export const sTom = (seconds: number) => {
  return Math.round(Number(seconds) / 60);
};

/**
 * 时间毫秒转换成分钟
 * @param {number} seconds 秒
 * @returns
 */
export const msTom = (seconds: number) => {
  return Math.round(Number(seconds) / 60 / 1000);
};

/**
 * 时间秒转分
 * @param {number} seconds 秒
 * @param {string} formatTextStyle 格式化文本样式（传空返回一个对象包含分和秒字段）
 */
export const formatSecondsToMinutes = (seconds: number, formatTextStyle = '分钟:秒') => {
  const formatText = formatTextStyle.split(':');
  const m = parseInt(seconds / 60 + '');
  const s = parseInt((seconds % 60) + '');
  if (formatTextStyle === '') {
    if (!seconds) {
      return {
        m: 0,
        s: 0,
      };
    }
    return {
      m,
      s,
    };
  }
  if (!seconds) return 0 + formatText[0];
  if (s < 1) {
    return m + formatText[0];
  }
  return m + formatText[0] + s + formatText[1];
};

/**
 * 格式化时间
 * @param {number} timestamp 时间戳
 * @param {string} formatTextStyle 格式化文本样式
 */
export const formatDateStr = (
  timestamp: dayjs.ConfigType,
  formatTextStyle = 'YYYY-MM-DD HH:mm:ss',
): string => {
  if (!timestamp) return '';
  return dayjs(timestamp).format(formatTextStyle);
};

/**
 * 返回是否是同一天
 * @param timeStamp 时间戳
 * @returns
 */
export const isToday = (timeStamp: number): boolean => {
  const today = new Date();
  const date = new Date(timeStamp);
  return (
    date.getDate() === today.getDate() && // 比较日
    date.getMonth() === today.getMonth() && // 比较月
    date.getFullYear() === today.getFullYear() // 比较年
  );
};
