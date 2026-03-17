import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const DEVICE_ID_KEY = 'memme.deviceId';
const DEVICE_INFO_KEY = 'memme.deviceInfo';

export interface DeviceInfoType {
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  createdAt: number;
  lastActive: number;
}

/**
 * 디바이스 ID 조회 또는 생성
 */
export const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existingId) {
      console.log('✅ [Device] 기존 디바이스 ID 사용');
      await updateLastActive();
      return existingId;
    }

    console.log('🔑 [Device] 새 디바이스 ID 생성 중...');
    
    const uniqueId = await DeviceInfo.getUniqueId();
    const timestamp = Date.now().toString();
    const random = CryptoJS.lib.WordArray.random(16).toString();
    
    const deviceId = CryptoJS.SHA256(uniqueId + timestamp + random)
      .toString()
      .substring(0, 32);

    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    await saveDeviceInfo(deviceId);

    console.log('✅ [Device] 디바이스 ID 생성 완료');
    return deviceId;
  } catch (error) {
    console.error('❌ [Device] 디바이스 ID 생성 실패:', error);
    throw new Error('디바이스 ID 생성 실패');
  }
};

/**
 * 디바이스 정보 저장
 */
export const saveDeviceInfo = async (deviceId: string): Promise<void> => {
  try {
    const deviceInfo: DeviceInfoType = {
      deviceId,
      deviceName: await DeviceInfo.getDeviceName(),
      deviceModel: DeviceInfo.getModel(),
      osVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
    console.log('✅ [Device] 디바이스 정보 저장 완료');
  } catch (error) {
    console.error('❌ [Device] 디바이스 정보 저장 실패:', error);
  }
};

/**
 * 디바이스 정보 조회
 */
export const getDeviceInfo = async (): Promise<DeviceInfoType | null> => {
  try {
    const json = await AsyncStorage.getItem(DEVICE_INFO_KEY);
    if (!json) return null;
    return JSON.parse(json) as DeviceInfoType;
  } catch (error) {
    console.error('❌ [Device] 디바이스 정보 조회 실패:', error);
    return null;
  }
};

/**
 * 마지막 활동 시간 업데이트
 */
export const updateLastActive = async (): Promise<void> => {
  try {
    const info = await getDeviceInfo();
    if (info) {
      info.lastActive = Date.now();
      await AsyncStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(info));
    }
  } catch (error) {
    console.error('❌ [Device] 마지막 활동 시간 업데이트 실패:', error);
  }
};

/**
 * 디바이스 ID 삭제
 */
export const deleteDeviceId = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([DEVICE_ID_KEY, DEVICE_INFO_KEY]);
    console.log('✅ [Device] 디바이스 ID 삭제 완료');
  } catch (error) {
    console.error('❌ [Device] 디바이스 ID 삭제 실패:', error);
  }
};