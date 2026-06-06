import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMasterKey, deleteMasterKey } from '../crypto/keyManager';
import { getOrCreateDeviceId, deleteDeviceId } from '../crypto/deviceManager';
import { 
  generateRSAKeyPair, 
  savePrivateKey, 
  loadPrivateKey,
  deletePrivateKey,
  encryptPrivateKeyForBackup,
  decryptPrivateKeyFromBackup,
} from '../crypto/rsaKeyManager';
import { 
  registerPublicKey, 
  uploadPrivateKeyBackup,
  downloadPrivateKeyBackup,
  getPublicKey 
} from './rsaApi';

/**
 * 로그인
 */
export const login = async (
  userId: string,
  accessToken: string,
  refreshToken?: string,
  password?: string
): Promise<void> => {
  try {
    const prevUserId = await AsyncStorage.getItem('userId');
    if (prevUserId && prevUserId !== userId) {
      await deleteMasterKey(prevUserId);
      await deletePrivateKey(prevUserId);
      await deleteDeviceId();
    }

    const deviceId = await getOrCreateDeviceId();

    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }

    await createMasterKey(userId);

    let privateKey = await loadPrivateKey(userId);

    if (!privateKey) {
      try {
        await getPublicKey(userId);
      } catch (error) {
        const keyPair = await generateRSAKeyPair();

        await savePrivateKey(userId, keyPair.privateKey);

        await registerPublicKey(userId, keyPair.publicKey, deviceId);

        if (password) {
          const backup = encryptPrivateKeyForBackup(
            keyPair.privateKey,
            password
          );
          await uploadPrivateKeyBackup(userId, backup, deviceId);
        }
      }
    }
  } catch (error) {
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    const userId = await AsyncStorage.getItem('userId');

    if (userId) {
      await deleteMasterKey(userId);
      await deletePrivateKey(userId);
    }

    await deleteDeviceId();
    await AsyncStorage.multiRemove(['userId', 'accessToken', 'refreshToken', 'AUTO_LOGIN']);
  } catch (error) {
    throw error;
  }
};

/**
 * 백업에서 개인키 복구
 */
export const restorePrivateKeyFromBackup = async (
  userId: string,
  password: string
): Promise<void> => {
  try {
    const backup = await downloadPrivateKeyBackup(userId);

    const privateKey = decryptPrivateKeyFromBackup(backup, password);

    await savePrivateKey(userId, privateKey);
  } catch (error) {
    throw error;
  }
};

/**
 * 현재 사용자 ID 조회
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  return AsyncStorage.getItem('userId');
};

/**
 * 현재 디바이스 ID 조회
 */
export const getCurrentDeviceId = async (): Promise<string | null> => {
  return getOrCreateDeviceId();
};