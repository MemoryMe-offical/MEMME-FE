import CryptoJS from 'crypto-js';
import RNFS from 'react-native-fs';
import { generateDEK } from './keyManager';
import { encryptDEKWithPublicKey, decryptDEKWithPrivateKey, loadPrivateKey } from './rsaKeyManager';

export interface FilePayload {
  version: string;
  algorithm: string;
  encryptedData: string;
  iv: string;
  encryptedDEK: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  timestamp: number;
  deviceId?: string;
}

/**
 * 파일 암호화
 */
export const encryptFile = async (
  filePath: string,
  publicKey: string,
  fileName: string,
  fileType: string
): Promise<FilePayload> => {
  try {
    console.log('File encryption started...');
    console.log(`  File: ${fileName}`);
    console.log(`  Type: ${fileType}`);

    const base64Data = await RNFS.readFile(filePath, 'base64');
    const fileSize = base64Data.length;
    console.log(`  Size: ${(fileSize / 1024).toFixed(2)} KB`);

    const dek = generateDEK();
    const iv = CryptoJS.lib.WordArray.random(16);

    // ⭐ DEK를 WordArray로 변환
    const dekWordArray = CryptoJS.enc.Hex.parse(dek);

    const encrypted = CryptoJS.AES.encrypt(base64Data, dekWordArray, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const encryptedData = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const ivBase64 = iv.toString(CryptoJS.enc.Base64);

    const encryptedDEK = await encryptDEKWithPublicKey(dek, publicKey);

    const payload: FilePayload = {
      version: '2.0',
      algorithm: 'AES-256-CBC',
      encryptedData,
      iv: ivBase64,
      encryptedDEK,
      fileName,
      fileType,
      fileSize,
      timestamp: Date.now(),
    };

    console.log('File encryption completed');
    return payload;
  } catch (error) {
    console.error('File encryption failed:', error);
    throw new Error('FILE_ENCRYPTION_FAILED');
  }
};

/**
 * 파일 복호화
 */
export const decryptFile = async (
  payload: FilePayload,
  userId: string,
  savePath: string
): Promise<string> => {
  try {
    console.log('File decryption started...');
    console.log(`  File: ${payload.fileName}`);

    const privateKey = await loadPrivateKey(userId);
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_NOT_FOUND');
    }

    const dek = await decryptDEKWithPrivateKey(payload.encryptedDEK, privateKey);

    // ⭐ DEK를 WordArray로 변환
    const dekWordArray = CryptoJS.enc.Hex.parse(dek);

    const iv = CryptoJS.enc.Base64.parse(payload.iv);

    const decrypted = CryptoJS.AES.decrypt(
      payload.encryptedData,
      dekWordArray, // ⭐ 여기!
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const base64Data = decrypted.toString(CryptoJS.enc.Utf8);

    if (!base64Data) {
      throw new Error('DECRYPTION_FAILED');
    }

    const outputPath = `${savePath}/${payload.fileName}`;
    await RNFS.writeFile(outputPath, base64Data, 'base64');

    console.log('File decryption completed');
    console.log(`  Saved to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('File decryption failed:', error);
    throw new Error('FILE_DECRYPTION_FAILED');
  }
};

/**
 * 이미지 암호화
 */
export const encryptImage = async (
  imagePath: string,
  publicKey: string
): Promise<FilePayload> => {
  const fileName = imagePath.split('/').pop() || 'image.jpg';
  const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
  
  return encryptFile(imagePath, publicKey, fileName, fileType);
};

/**
 * 이미지 복호화
 */
export const decryptImage = async (
  payload: FilePayload,
  userId: string
): Promise<string> => {
  const savePath = RNFS.DocumentDirectoryPath;
  return decryptFile(payload, userId, savePath);
};