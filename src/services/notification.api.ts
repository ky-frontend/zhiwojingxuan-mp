import type { GateWayType } from '@ky-frontend/common';

import { MessageList, MessageRead, SendQywxBotMessage } from '@ky-middleground/notification-api';

import { MessageTypeType, QywxBotChannelEnum } from '@ky-middleground/notification-type';

class NotificationApi {
  #getway: GateWayType;

  constructor(gateway: GateWayType) {
    this.#getway = gateway;
  }

  /**
   * 获取通知列表
   * @param params
   * @returns
   */

  public getMessageList = async (
    pagination: { offset: number; limit: number },
    type?: MessageTypeType[],
  ) => {
    return await this.#getway<MessageList>({
      path: '/notification/message/list',
      params: {
        type,
        pagination,
      },
      method: 'post',
      apiLevel: 'User',
    });
  };

  public readMessage = async (type: MessageTypeType[]) => {
    return await this.#getway<MessageRead>({
      path: '/notification/message/read',
      params: {
        type,
      },
      method: 'post',
      apiLevel: 'User',
    });
  };

  /**
   * 发送企业微信机器人信息
   */
  sendQywxBotMessage = async (params: { channel: QywxBotChannelEnum; message: string }) => {
    return await this.#getway<SendQywxBotMessage>({
      path: '/notification/wechat/qywxBot',
      params,
      method: 'post',
      apiLevel: 'None',
    });
  };
}

export default NotificationApi;
