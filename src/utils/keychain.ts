import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';

/**
 * 디바이스 키체인에 암호화 키 저장
 * iOS: Keychain
 * Android: Keystore
 */

// 사용자별 암호화 마스터 키 생성 및 저장
export const createMasterKey = async (userId: string): Promise<string> => {
  try {
    // 1. 기존 키 확인
    const existingKey = await getMasterKey(userId);
    if (existingKey) {
      console.log('✅ [Keychain] 기존 키 사용');
      return existingKey;
    }

    // 2. 새 마스터 키 생성 (256비트)
    const masterKey = CryptoJS.lib.WordArray.random(32).toString();

    // 3. 디바이스 키체인에 안전하게 저장
    await Keychain.setGenericPassword(userId, masterKey, {
      service: `memme.encryption.${userId}`,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });

    console.log('✅ [Keychain] 마스터 키 생성 및 저장 완료');
    return masterKey;
  } catch (error) {
    console.error('❌ [Keychain] 마스터 키 생성 실패:', error);
    throw new Error('키 생성 실패');
  }
};

// 키체인에서 마스터 키 가져오기
export const getMasterKey = async (userId: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `memme.encryption.${userId}`,
    });

    if (credentials) {
      console.log('✅ [Keychain] 마스터 키 로드 완료');
      return credentials.password;
    }

    console.log('⚠️ [Keychain] 키 없음');
    return null;
  } catch (error) {
    console.error('❌ [Keychain] 마스터 키 로드 실패:', error);
    return null;
  }
};

// 키체인에서 마스터 키 삭제 (로그아웃 시)
export const deleteMasterKey = async (userId: string): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({
      service: `memme.encryption.${userId}`,
    });
    console.log('✅ [Keychain] 마스터 키 삭제 완료');
    return true;
  } catch (error) {
    console.error('❌ [Keychain] 마스터 키 삭제 실패:', error);
    return false;
  }
};