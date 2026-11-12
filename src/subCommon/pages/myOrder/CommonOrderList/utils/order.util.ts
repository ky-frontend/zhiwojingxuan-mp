import { OrderStatusEnum } from '@ky-middleground/order-type';

/**
 * 订单退款状态转换显示的名称
 * @param refundStatus 退款状态
 * @returns
 */
export const refundStatusToName = (refundStatus: number) => {
  switch (refundStatus) {
    case OrderStatusEnum.PartRefund:
      return '已部分退款';
    case OrderStatusEnum.Refund:
      return '已全额退款';
    default:
      return '';
  }
};

/**
 * (咨询师)订单退款状态转换显示的名称
 * @param refundType 退款状态 0 默认 1 全部退款 2 部分退款
 * @returns
 */
export const consultantRefundStatusToName = (refundType: number) => {
  switch (refundType) {
    case 1:
      return '已部分退款';
    case 2:
      return '已全额退款';
    default:
      return '';
  }
};
