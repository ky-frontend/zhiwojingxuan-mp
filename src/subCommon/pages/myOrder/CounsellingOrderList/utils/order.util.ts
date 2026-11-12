import { CounsellingItemKeyEnum } from '@ky-client/counselling-type';
import { AppItemKeyTypeEnum } from '@ky-frontend/common';

/**
 * 聊愈分数转换
 */
export const getChatScoreText = (score: number) => {
  if (score === 5) {
    return '非常满意';
  } else if (score < 5 && score >= 4) {
    return '满意';
  } else if (score < 4 && score >= 2.5) {
    return '一般';
  } else {
    return '不满意';
  }
};

/**
 * 获取评论tag对应文案
 */
export const getCommentTagTexts = (tags: number[] = []) => {
  const list: string[] = [];
  tags.forEach((num: number) => {
    switch (num) {
      case 0: //0
        list.push('很专业');
        break;
      case 1: // 1
        list.push('回应及时');
        break;
      case 2: // 2
        list.push('被理解');
        break;
      case 3: // 3
        list.push('情绪被纾解');
        break;
      case 4: // 4
        list.push('很有启发');
        break;
      case 5: // 5
        list.push('专业性一般');
        break;
      case 6: // 6
        list.push('回应不及时');
        break;
      case 7: // 7
        list.push('没有被完全理解');
        break;
      case 8: // 8
        list.push('情绪未缓解');
        break;
      case 9: // 9
        list.push('启发性一般');
        break;
      case 10: // 10
        list.push('不专业');
        break;
      case 11: // 11
        list.push('长时间无回应');
        break;
      case 12: // 12
        list.push('没有被理解');
        break;

      case 13: // 13
        list.push('感到被冒犯');
        break;
      case 14: // 14
        list.push('没有启发');
        break;

      /// 书信
      case 15: // 15
        list.push('很专业');
        break;
      case 16: // 16
        list.push('被理解');
        break;
      case 17: // 17
        list.push('很有启发');
        break;
      case 18: // 18
        list.push('专业性一般');
        break;
      case 19: // 19
        list.push('没有被完全理解');
        break;
      case 20: // 20
        list.push('启发性一般');
        break;
      case 21: // 21
        list.push('不专业');
        break;
      case 22: // 22
        list.push('没有被理解');
        break;
      case 23: // 23
        list.push('没有启发');
        break;
      default:
        break;
    }
  });
  return list;
};

/**
 * 获取订单关闭原因
 */
export const getUserOrderCloseReason = (type: number) => {
  switch (type) {
    case 1:
      return '服务中用户主动关闭';
    case 2:
      return '订单存在风险自动关闭';
    case 3:
      return '聊愈师回复超时自动关闭';
    case 4:
      return '聊愈师未回复关闭';
    default:
      return '未知';
  }
};

/**
 * 获取评论分数
 */
export const getCommentScore = (orderInfo: {
  appItemKey: CounsellingItemKeyEnum;
  comment: any;
}) => {
  const { appItemKey, comment } = orderInfo;
  switch (appItemKey) {
    case CounsellingItemKeyEnum.JSWZCS:
    case CounsellingItemKeyEnum.JSTH:
      return [
        { text: '产品功能体验评价', value: comment?.productScore / 2 },
        { text: '整体感受', value: comment?.score / 2 },
      ];
    default:
      return [{ text: '整体感受', value: comment?.score }];
  }
};

/**
 * 聊愈订单appItemKey转换显示的名称
 */
export const getAppItemKeyText = (appItemKey: AppItemKeyTypeEnum) => {
  switch (appItemKey) {
    case AppItemKeyTypeEnum.Jswzcs:
      return '即时对话咨询订单';
    case AppItemKeyTypeEnum.Jsth:
      return '即时通话聊愈订单';
    case AppItemKeyTypeEnum.LyCard:
      return '聊愈卡充值';
    default:
      return '未知';
  }
};

/**
 * 聊愈订单退款状态转换显示的名称
 * @param refundStatus 退款状态
 * @returns
 */
export const refundStatusToName = (refundStatus: number) => {
  /** 最后退款状态 默认 0 1 审核中 2 审核不通过 3部分退款 4全部退款 */
  switch (refundStatus) {
    case 1:
      return '退款审核中';
    case 2:
      return '退款未通过';
    case 3:
      return '已部分退款';
    case 4:
      return '已全额退款';
    default:
      return '';
  }
};

/**
 * 退款tag对应文案
 */
export const getRefundTag = (tags: number[] = []) => {
  const list: string[] = [];
  tags.forEach((num: number) => {
    switch (num) {
      case 0:
        list.push('聊愈师态度差');
        break;
      case 1:
        list.push('服务没有帮助');
        break;
      case 2:
        list.push('无故被关闭服务');
        break;
      case 3:
        list.push('产品体验不佳');
        break;
      case 4:
        list.push('其他');
        break;
      default:
        break;
    }
  });
  return list;
};
