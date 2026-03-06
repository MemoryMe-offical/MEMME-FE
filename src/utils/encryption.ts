import CryptoJS from 'crypto-js';
import { getMasterKey, createMasterKey } from './keychain';

/**
 * E2EE 암호화/복호화 유틸
 * AES-256 암호화 사용
 */

// 메시지 암호화
export const encryptMessage = async (
  plaintext: string,
  userId: string
): Promise<string> => {
  try {
    // 1. 키체인에서 마스터 키 가져오기 (없으면 생성)
    let masterKey = await getMasterKey(userId);
    
    if (!masterKey) {
      console.log('⚠️ [Encryption] 키 없음 - 새로 생성');
      masterKey = await createMasterKey(userId);
    }

    // 2. AES-256 암호화
    const encrypted = CryptoJS.AES.encrypt(plaintext, masterKey).toString();

    console.log('🔐 [Encryption] 암호화 완료');
    return encrypted;
  } catch (error) {
    console.error('❌ [Encryption] 암호화 실패:', error);
    throw new Error('암호화 실패');
  }
};

// 메시지 복호화
export const decryptMessage = async (
  ciphertext: string,
  userId: string
): Promise<string> => {
  try {
    // 1. 키체인에서 마스터 키 가져오기
    const masterKey = await getMasterKey(userId);

    if (!masterKey) {
      throw new Error('암호화 키를 찾을 수 없습니다');
    }

    // 2. AES-256 복호화
    const decrypted = CryptoJS.AES.decrypt(ciphertext, masterKey);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      throw new Error('복호화 실패');
    }

    console.log('🔓 [Encryption] 복호화 완료');
    return plaintext;
  } catch (error) {
    console.error('❌ [Encryption] 복호화 실패:', error);
    throw new Error('복호화 실패');
  }
};

// 파일 암호화 (이미지, 동영상 등)
export const encryptFile = async (
  fileBase64: string,
  userId: string
): Promise<string> => {
  console.log('🔐 [Encryption] 파일 암호화 시작');
  return await encryptMessage(fileBase64, userId);
};

// 파일 복호화
export const decryptFile = async (
  encryptedFile: string,
  userId: string
): Promise<string> => {
  console.log('🔓 [Encryption] 파일 복호화 시작');
  return await decryptMessage(encryptedFile, userId);
};