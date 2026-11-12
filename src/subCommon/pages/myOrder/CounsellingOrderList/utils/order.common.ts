import { navigateToApp } from '@src/modules/utils/navigate';

/**
 * 聊愈用户去立即评价
 */
export const gotoComment = (info: {
  orderId: string;
  appItemKey: string;
  doctorData: {
    userAliasId: string;
    userAliasCounsellingName: string;
  };
}) => {
  const { orderId, appItemKey, doctorData } = info;
  const query = {
    id: orderId,
    type: appItemKey === 'jswzcs' ? 1 : 4, // 1 即时文字 4 即时通话
    doctor_id: doctorData?.userAliasId,
    doctor_name: doctorData?.userAliasCounsellingName,
  };
  navigateToApp('/counselling/order/comment', query);
};
