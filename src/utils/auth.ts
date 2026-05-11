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
    console.log('🔐 [Auth] 로그인 시작');

    const prevUserId = await AsyncStorage.getItem('userId');
    if (prevUserId && prevUserId !== userId) {
      console.log('⚠️ [Auth] 다른 사용자 - 기존 데이터 정리 중');
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
      console.log('⚠️ [Auth] RSA 키 없음 - 서버 확인 중...');
      
      try {
        await getPublicKey(userId);
        console.log('✅ [Auth] 서버에 공개키 존재');
        console.log('⚠️ [Auth] 개인키 백업에서 복구 필요');
        
      } catch (error) {
        console.log('🔑 [Auth] RSA 키 쌍 생성 중...');
        
        const keyPair = await generateRSAKeyPair();

        await savePrivateKey(userId, keyPair.privateKey);

        await registerPublicKey(userId, keyPair.publicKey, deviceId);

        if (password) {
          const backup = encryptPrivateKeyForBackup(
            keyPair.privateKey,
            password
          );
          await uploadPrivateKeyBackup(userId, backup, deviceId);
          console.log('✅ [Auth] 개인키 백업 완료 (KDF 포함)');
        }
        
        console.log('✅ [Auth] RSA 키 초기화 완료');
      }
    } else {
      console.log('✅ [Auth] RSA 개인키 존재');
    }

    console.log('✅ [Auth] 로그인 완료');
  } catch (error) {
    console.error('❌ [Auth] 로그인 실패:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const logout = async (): Promise<void> => {
  try {
    console.log('🔓 [Auth] 로그아웃 시작');

    const userId = await AsyncStorage.getItem('userId');

    if (userId) {
      await deleteMasterKey(userId);
      await deletePrivateKey(userId);
    }

    await deleteDeviceId();
    await AsyncStorage.multiRemove(['userId', 'accessToken', 'refreshToken', 'AUTO_LOGIN']);

    console.log('✅ [Auth] 로그아웃 완료');
  } catch (error) {
    console.error('❌ [Auth] 로그아웃 실패:', error);
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
    console.log('🔓 [Auth] 백업에서 개인키 복구 중...');

    const backup = await downloadPrivateKeyBackup(userId);
    
    console.log('📥 [Auth] 백업 다운로드 완료');
    console.log(`  KDF: ${backup.kdfParams.algorithm}`);
    console.log(`  반복: ${backup.kdfParams.iterations}`);
    console.log(`  생성: ${new Date(backup.timestamp).toLocaleString()}`);

    const privateKey = decryptPrivateKeyFromBackup(backup, password);

    await savePrivateKey(userId, privateKey);

    console.log('✅ [Auth] 개인키 복구 완료');
  } catch (error) {
    console.error('❌ [Auth] 개인키 복구 실패:', error);
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