import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';
import { RSA } from 'react-native-rsa-native';
import { deriveKEKFromPassword, deriveKEKWithParams, KDFParams } from './keyDerivation';

export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface PrivateKeyBackup {
  encryptedPrivateKey: string;
  kdfParams: KDFParams;
  timestamp: number;
  version: string;
}

/**
 * RSA 키 쌍 생성 (2048bit) - async로 변경
 */
export const generateRSAKeyPair = async (): Promise<RSAKeyPair> => {
  try {
    const keys = await RSA.generateKeys(2048);

    return {
      publicKey: keys.public,
      privateKey: keys.private,
    };
  } catch (error) {
    throw new Error('RSA 키 생성 실패');
  }
};

/**
 * 개인키 저장 (Keychain)
 */
export const savePrivateKey = async (
  userId: string,
  privateKey: string
): Promise<void> => {
  try {
    await Keychain.setGenericPassword(
      `rsa_private_${userId}`,
      privateKey,
      {
        service: `memme.rsa.private.${userId}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );
  } catch (error) {
    throw new Error('개인키 저장 실패');
  }
};

/**
 * 개인키 로드 (Keychain)
 */
export const loadPrivateKey = async (
  userId: string
): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: `memme.rsa.private.${userId}`,
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
 * 개인키 삭제
 */
export const deletePrivateKey = async (userId: string): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: `memme.rsa.private.${userId}`,
    });
  } catch (error) {
    // Silently fail
  }
};

/**
 * 공개키로 DEK 암호화 - async 추가
 */
export const encryptDEKWithPublicKey = async (
  dek: string,
  publicKey: string
): Promise<string> => {
  try {
    const encrypted = await RSA.encrypt(dek, publicKey);
    return encrypted;
  } catch (error) {
    throw new Error('RSA 암호화 실패');
  }
};

/**
 * 개인키로 DEK 복호화 - async 추가
 */
export const decryptDEKWithPrivateKey = async (
  encryptedDEK: string,
  privateKey: string
): Promise<string> => {
  try {
    const decrypted = await RSA.decrypt(encryptedDEK, privateKey);
    return decrypted;
  } catch (error) {
    throw new Error('RSA 복호화 실패');
  }
};

/**
 * 백업용 개인키 암호화
 */
export const encryptPrivateKeyForBackup = (
  privateKey: string,
  password: string
): PrivateKeyBackup => {
  const { kek, salt, params } = deriveKEKFromPassword(password);

  const encrypted = CryptoJS.AES.encrypt(privateKey, kek);
  const encryptedPrivateKey = encrypted.toString();

  return {
    encryptedPrivateKey,
    kdfParams: params,
    timestamp: Date.now(),
    version: '1.0',
  };
};

/**
 * 백업에서 개인키 복호화
 */
export const decryptPrivateKeyFromBackup = (
  backup: PrivateKeyBackup,
  password: string
): string => {
  const kek = deriveKEKWithParams(password, backup.kdfParams);

  const decrypted = CryptoJS.AES.decrypt(backup.encryptedPrivateKey, kek);
  const privateKey = decrypted.toString(CryptoJS.enc.Utf8);

  if (!privateKey) {
    throw new Error('비밀번호 오류');
  }

  return privateKey;
};