import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';

/**
 * Master Key 생성
 */
export const createMasterKey = async (userId: string): Promise<string> => {
  try {
    const existing = await getMasterKey(userId);
    if (existing) {
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

    return mk;
  } catch (error) {
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
      return credentials.password;
    }

    return null;
  } catch (error) {
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
  } catch (error) {
    throw error;
  }
};

/**
 * DEK 생성 - string으로 반환
 */
export const generateDEK = (): string => {
  // WordArray를 바로 string으로 변환
  const dek = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
  return dek;
};

/**
 * DEK를 MK로 암호화
 */
export const encryptDEKWithMK = async (
  dek: string,
  mk: string
): Promise<string> => {
  const encrypted = CryptoJS.AES.encrypt(dek, mk).toString();
  return encrypted;
};

/**
 * MK로 DEK 복호화
 */
export const decryptDEKWithMK = async (
  encryptedDEK: string,
  mk: string
): Promise<string> => {
  const decrypted = CryptoJS.AES.decrypt(encryptedDEK, mk);
  const dek = decrypted.toString(CryptoJS.enc.Utf8);

  if (!dek) {
    throw new Error('DEK 복호화 실패');
  }

  return dek;
};