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
  console.log('🔑 [RSA] RSA 키 쌍 생성 중...');
  
  try {
    const keys = await RSA.generateKeys(2048);
    
    console.log('✅ [RSA] RSA 키 쌍 생성 완료');
    return {
      publicKey: keys.public,
      privateKey: keys.private,
    };
  } catch (error) {
    console.error('❌ [RSA] 키 생성 실패:', error);
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
    console.log('💾 [RSA] 개인키 저장 중...');

    await Keychain.setGenericPassword(
      `rsa_private_${userId}`,
      privateKey,
      {
        service: `memme.rsa.private.${userId}`,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );

    console.log('✅ [RSA] 개인키 저장 완료');
  } catch (error) {
    console.error('❌ [RSA] 개인키 저장 실패:', error);
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
    console.log('🔍 [RSA] 개인키 로드 중...');

    const credentials = await Keychain.getGenericPassword({
      service: `memme.rsa.private.${userId}`,
    });

    if (credentials) {
      console.log('✅ [RSA] 개인키 로드 완료');
      return credentials.password;
    }

    console.log('⚠️ [RSA] 개인키 없음');
    return null;
  } catch (error) {
    console.error('❌ [RSA] 개인키 로드 실패:', error);
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
    console.log('✅ [RSA] 개인키 삭제 완료');
  } catch (error) {
    console.error('❌ [RSA] 개인키 삭제 실패:', error);
  }
};

/**
 * 공개키로 DEK 암호화 - async 추가
 */
export const encryptDEKWithPublicKey = async (
  dek: string,
  publicKey: string
): Promise<string> => {
  console.log('🔐 [RSA] 공개키로 DEK 암호화 중...');

  try {
    const encrypted = await RSA.encrypt(dek, publicKey);
    console.log('✅ [RSA] DEK 암호화 완료');
    return encrypted;
  } catch (error) {
    console.error('❌ [RSA] 암호화 실패:', error);
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
  console.log('🔓 [RSA] 개인키로 DEK 복호화 중...');

  try {
    const decrypted = await RSA.decrypt(encryptedDEK, privateKey);
    console.log('✅ [RSA] DEK 복호화 완료');
    return decrypted;
  } catch (error) {
    console.error('❌ [RSA] 복호화 실패:', error);
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
  console.log('🔐 [RSA] 백업용 개인키 암호화 중...');

  const { kek, salt, params } = deriveKEKFromPassword(password);

  const encrypted = CryptoJS.AES.encrypt(privateKey, kek);
  const encryptedPrivateKey = encrypted.toString();

  console.log('✅ [RSA] 개인키 암호화 완료');
  console.log(`  Salt: ${salt.substring(0, 16)}...`);
  console.log(`  반복: ${params.iterations}`);

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
  console.log('🔓 [RSA] 백업에서 개인키 복호화 중...');
  console.log(`  반복: ${backup.kdfParams.iterations}`);

  const kek = deriveKEKWithParams(password, backup.kdfParams);

  const decrypted = CryptoJS.AES.decrypt(backup.encryptedPrivateKey, kek);
  const privateKey = decrypted.toString(CryptoJS.enc.Utf8);

  if (!privateKey) {
    throw new Error('비밀번호 오류');
  }

  console.log('✅ [RSA] 개인키 복호화 완료');
  return privateKey;
};