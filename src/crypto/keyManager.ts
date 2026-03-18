import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';

/**
 * Master Key 생성
 */
export const createMasterKey = async (userId: string): Promise<string> => {
  try {
    console.log('🔑 [MK] Master Key 생성 중...');

    const existing = await getMasterKey(userId);
    if (existing) {
      console.log('✅ [MK] 기존 Master Key 사용');
      return existing;
    }

    // WordArray를 바로 string으로 변환
    const mk = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);

    await Keychain.setGenericPassword(
      `mk_${userId}`,
      mk,
      {
        service: `memme.mk.${userId}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );

    console.log('✅ [MK] Master Key 생성 완료');
    return mk;
  } catch (error) {
    console.error('❌ [MK] Master Key 생성 실패:', error);
    throw new Error('Master Key 생성 실패');
  }
};

/**
 * Master Key 조회
 */
export const getMasterKey = async (userId: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `memme.mk.${userId}`,
    });

    if (credentials) {
      console.log('✅ [MK] Master Key 로드 완료');
      return credentials.password;
    }

    console.log('⚠️ [MK] Master Key 없음');
    return null;
  } catch (error) {
    console.error('❌ [MK] Master Key 로드 실패:', error);
    return null;
  }
};

/**
 * Master Key 삭제
 */
export const deleteMasterKey = async (userId: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: `memme.mk.${userId}`,
    });
    console.log('✅ [MK] Master Key 삭제 완료');
  } catch (error) {
    console.error('❌ [MK] Master Key 삭제 실패:', error);
    throw error;
  }
};

/**
 * DEK 생성 - string으로 반환
 */
export const generateDEK = (): string => {
  console.log('🔑 [DEK] DEK 생성 중...');
  // WordArray를 바로 string으로 변환
  const dek = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
  console.log('✅ [DEK] DEK 생성 완료');
  return dek;
};

/**
 * DEK를 MK로 암호화
 */
export const encryptDEKWithMK = async (
  dek: string,
  mk: string
): Promise<string> => {
  console.log('🔐 [DEK] MK로 DEK 암호화 중...');
  const encrypted = CryptoJS.AES.encrypt(dek, mk).toString();
  console.log('✅ [DEK] DEK 암호화 완료');
  return encrypted;
};

/**
 * MK로 DEK 복호화
 */
export const decryptDEKWithMK = async (
  encryptedDEK: string,
  mk: string
): Promise<string> => {
  console.log('🔓 [DEK] MK로 DEK 복호화 중...');
  const decrypted = CryptoJS.AES.decrypt(encryptedDEK, mk);
  const dek = decrypted.toString(CryptoJS.enc.Utf8);

  if (!dek) {
    throw new Error('DEK 복호화 실패');
  }

  console.log('✅ [DEK] DEK 복호화 완료');
  return dek;
};