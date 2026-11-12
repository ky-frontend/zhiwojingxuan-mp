// 获取埋点配置的链接 http://192.168.3.170:3361

import { getUserInfo } from '@/utils/identity';
import { VERSION } from '@/constants/values';
import { AppId } from '@ky-frontend/common';
import md5 from 'md5';
import Taro from '@tarojs/taro';
import { ITrackEventData } from './events';
import device from '../utils/device';
// import { updataPoint } from '../api/track';

/**
 * 初始化用户的设备id
 */
export const initDeviceId = () => {
  const deviceId = Taro.getStorageSync('device_id');
  if (!deviceId) {
    localStorage.setItem('device_id', md5(navigator.userAgent + new Date().valueOf()));
  }
};
/**
 * 统一上报埋点
 * @param data ITrackEventData
 * gateway 2 曾为神策，已下线；仅保留自建埋点
 */
export const KYTrack = (data: ITrackEventData) => {
  try {
    if (data.gateway == 1 || data.gateway == 3) {
      _kyTrack(data);
    }
  } catch (err) {
    console.log(err);
  }
};
/**
 * 进来开启上报
 */
export const updataKYTrack = () => {
  const lt = Taro.getStorageSync('ky_track');
  let logId = Taro.getStorageSync('ky_track_log');
  if (!logId) {
    logId = '0';
    Taro.setStorageSync('ky_track_log', '0');
  } else {
    logId = parseInt(logId) + 1 + '';
    Taro.setStorageSync('ky_track_log', logId);
  }
  if (lt) {
    Taro.removeStorageSync('ky_track');
    try {
      const tracks = JSON.parse(lt);
      tracks.forEach((v: any) => {
        v.log_id = logId;
      });
      const kyTrackparams = {
        device_id: Taro.getStorageSync('device_id') || '',
        os: device.isIOS() ? 'ios' : 'other',
        system: device.isIOS() ? 1 : 2,
        platform: 3, // 3 h5
        records: tracks,
      };
      console.log('【ky埋点】', kyTrackparams);
      // updataPoint(kyTrackparams);
    } catch (error) {
      console.log('埋点错误', JSON.stringify(error));
    }
  }
};

const _kyTrack = async (data: ITrackEventData) => {
  const userInfo: any = await getUserInfo();

  let tracks: {}[] = [];
  const lt = Taro.getStorageSync('ky_track');
  if (lt) {
    tracks = JSON.parse(lt);
  }
  tracks.push({
    event_id: data.event_id,
    base_uri: Taro.getCurrentInstance().router?.path,
    event_data: data.event_more,
    created_at: new Date().valueOf(),
    version: VERSION,
    user_id: userInfo?.id || '',
    os_version: 'xcx',
    alias_id: userInfo.id || '',
    ky_user_id: userInfo.userId || '',
    ky_app_id: AppId.FUDAN_XCX,
  });
  Taro.setStorageSync('ky_track', JSON.stringify(tracks));
};
