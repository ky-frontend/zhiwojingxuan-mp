import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

/**
 * 格式化时间
 * @param {dayjs.ConfigType} date 时间戳
 * @param {number} formatTextStyle 格式化文本样式
 */
export const formatDate = (date: dayjs.ConfigType, formatTextStyle = 'YYYY年MM月DD日 HH:mm') => {
  if (!date) return '';
  return dayjs(date).format(formatTextStyle);
};

/**
 * 格式化北京时间
 * @param {dayjs.ConfigType} date 时间戳
 * @param {number} formatTextStyle 格式化文本样式
 * @returns
 */
export const formatBeijingDate = (
  date: dayjs.ConfigType,
  formatTextStyle = 'YYYY年MM月DD日 HH:mm'
) => {
  if (!date) return '';
  return dayjs(date).utcOffset(8).format(formatTextStyle);
};
