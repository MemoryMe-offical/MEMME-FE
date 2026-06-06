import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://memme.o-r.kr/v1';

export interface FilePayloadForServer {
  encryptedData: string;
  version: string;
  algorithm: string;
  iv: string;
  encryptedDEK: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  deviceId?: string;
}

export interface ServerMessage {
  id: number;
  userId: string;
  encryptedContent: string;
  version: string;
  algorithm: string;
  iv: string;
  encryptedDEK: string;
  deviceId?: string;
  messageType?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  timestamp: string;
}

/**
 * 서버 연결 테스트
 */
export const pingServer = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/messages/ping`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 텍스트 메시지 전송
 */
export const sendMessage = async (
  userId: string,
  payload: {
    encryptedContent: string;
    version: string;
    algorithm: string;
    iv: string;
    encryptedDEK: string;
    deviceId?: string;
  }
): Promise<{ id: number; success: boolean }> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/messages/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      userId,
      encryptedContent: payload.encryptedContent,
      version: payload.version,
      algorithm: payload.algorithm,
      iv: payload.iv,
      encryptedDEK: payload.encryptedDEK,
      deviceId: payload.deviceId,
      messageType: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 파일 전송
 */
export const sendFile = async (
  userId: string,
  filePayload: FilePayloadForServer
): Promise<{ id: number; success: boolean }> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/messages/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      userId,
      encryptedContent: filePayload.encryptedData,
      version: filePayload.version,
      algorithm: filePayload.algorithm,
      iv: filePayload.iv,
      encryptedDEK: filePayload.encryptedDEK,
      deviceId: filePayload.deviceId,
      messageType: filePayload.fileType.startsWith('image/') ? 'image' : 'file',
      fileName: filePayload.fileName,
      fileType: filePayload.fileType,
      fileSize: filePayload.fileSize,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 메시지 조회
 */
export const getMessages = async (
  userId: string
): Promise<{
  messages: ServerMessage[];
  count: number;
}> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/messages/test/${userId}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

/**
 * 모든 메시지 삭제
 */
export const clearAllMessages = async (): Promise<void> => {
  const token = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch(`${BASE_URL}/messages/clear`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
};