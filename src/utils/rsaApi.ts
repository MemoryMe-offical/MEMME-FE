import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PrivateKeyBackup } from '../crypto/rsaKeyManager';

const BASE_URL = Platform.OS === 'ios' 
  ? 'http://localhost:8080/api'
  : 'http://10.0.2.2:8080/api';

/**
 * 공개키 등록
 */
export const registerPublicKey = async (
  userId: string,
  publicKey: string,
  deviceId: string
): Promise<void> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/keys/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      userId,
      publicKey,
      deviceId,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
};

/**
 * 공개키 조회
 */
export const getPublicKey = async (userId: string): Promise<string> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/keys/${userId}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.publicKey;
};

/**
 * 개인키 백업 업로드
 */
export const uploadPrivateKeyBackup = async (
  userId: string,
  backup: PrivateKeyBackup,
  deviceId: string
): Promise<void> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/keys/backup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      userId,
      backupData: JSON.stringify(backup),
      deviceId,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
};

/**
 * 개인키 백업 다운로드
 */
export const downloadPrivateKeyBackup = async (
  userId: string
): Promise<PrivateKeyBackup> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/keys/backup/${userId}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  const backup: PrivateKeyBackup = JSON.parse(data.backupData);

  return backup;
};