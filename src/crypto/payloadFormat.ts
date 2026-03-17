/**
 * 암호화 Payload 포맷 정의
 */

// 기본 Payload (V1 - 구버전)
export interface PayloadData {
  version: string;
  algorithm: string;
  ciphertext: string;
  iv: string;
  encryptedDEK: string;
  keyId?: string;
  timestamp: number;
  deviceId?: string;
}

// V2 Payload (RSA 하이브리드)
export interface PayloadDataV2 {
  version: string;
  algorithm: string;
  ciphertext: string;
  iv: string;
  encryptedDEK: string;
  encryptedDEKForUser: string;  // RSA로 암호화된 DEK
  timestamp: number;
  deviceId?: string;
}

/**
 * Payload 직렬화 (객체 → JSON 문자열)
 */
export const serializePayload = (payload: PayloadData | PayloadDataV2): string => {
  return JSON.stringify(payload);
};

/**
 * Payload 역직렬화 (JSON 문자열 → 객체)
 */
export const deserializePayload = (jsonString: string): PayloadData | PayloadDataV2 => {
  try {
    const payload = JSON.parse(jsonString);
    
    if (!payload.version || !payload.algorithm || !payload.timestamp) {
      throw new Error('잘못된 Payload 형식');
    }
    
    return payload;
  } catch (error) {
    console.error('❌ [Payload] 파싱 실패:', error);
    throw new Error('Payload 파싱 실패');
  }
};

/**
 * Payload 유효성 검증
 */
export const validatePayload = (payload: PayloadData | PayloadDataV2): boolean => {
  const requiredFields = ['version', 'algorithm', 'timestamp'];

  for (const field of requiredFields) {
    if (!(field in payload)) {
      console.error(`❌ [Payload] 필수 필드 없음: ${field}`);
      return false;
    }
  }

  const supportedAlgorithms = ['AES-256-CBC', 'AES-256-GCM'];
  if (!supportedAlgorithms.includes(payload.algorithm)) {
    console.error(`❌ [Payload] 지원하지 않는 알고리즘: ${payload.algorithm}`);
    return false;
  }

  return true;
};