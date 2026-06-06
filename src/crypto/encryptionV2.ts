import CryptoJS from 'crypto-js';
import { generateDEK } from './keyManager';
import { 
  encryptDEKWithPublicKey, 
  decryptDEKWithPrivateKey,
  loadPrivateKey 
} from './rsaKeyManager';
import { PayloadData, PayloadDataV2 } from './payloadFormat';

/**
 * 메시지 암호화 (V2 - RSA + AES)
 */
export const encryptMessageV2 = async (
  plaintext: string,
  publicKey: string
): Promise<PayloadDataV2> => {
  try {
    const dek = generateDEK(); // Hex string (64자)

    const iv = CryptoJS.lib.WordArray.random(16);

    // ⭐ DEK를 WordArray로 변환
    const dekWordArray = CryptoJS.enc.Hex.parse(dek);

    const encrypted = CryptoJS.AES.encrypt(plaintext, dekWordArray, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const ivBase64 = iv.toString(CryptoJS.enc.Base64);

    const encryptedDEKForUser = await encryptDEKWithPublicKey(dek, publicKey);

    const payload: PayloadDataV2 = {
      version: '2.0',
      algorithm: 'AES-256-CBC',
      ciphertext: ciphertext,
      iv: ivBase64,
      encryptedDEK: '',
      encryptedDEKForUser: encryptedDEKForUser,
      timestamp: Date.now(),
    };

    return payload;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('ENCRYPTION_FAILED');
  }
};

/**
 * 메시지 복호화 (V2 - RSA + AES)
 */
export const decryptMessageV2 = async (
  payload: PayloadData | PayloadDataV2,
  userId: string
): Promise<string> => {
  try {
    const privateKey = await loadPrivateKey(userId);
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_NOT_FOUND');
    }

    const encryptedDEK = (payload as PayloadDataV2).encryptedDEKForUser || payload.encryptedDEK;

    const dek = await decryptDEKWithPrivateKey(encryptedDEK, privateKey);

    // ⭐ DEK를 WordArray로 변환
    const dekWordArray = CryptoJS.enc.Hex.parse(dek);

    const iv = CryptoJS.enc.Base64.parse(payload.iv);

    const decrypted = CryptoJS.AES.decrypt(
      payload.ciphertext,
      dekWordArray, // ⭐ 여기!
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      throw new Error('DECRYPTION_FAILED');
    }

    return plaintext;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('DECRYPTION_FAILED');
  }
};