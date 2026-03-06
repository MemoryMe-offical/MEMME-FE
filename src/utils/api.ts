import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ 서버 주소 설정
// iOS 시뮬레이터: http://localhost:8080
// Android 에뮬레이터: http://10.0.2.2:8080
// 실제 기기 (같은 WiFi): http://192.168.x.x:8080
const API_BASE_URL = 'http://localhost:8080';

/**
 * API 요청 헬퍼
 */
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('❌ [API] 요청 실패:', error);
    throw error;
  }
};

/**
 * 서버 상태 확인
 */
export const pingServer = async (): Promise<boolean> => {
  try {
    console.log('🔍 [API] 서버 연결 테스트...');
    const response = await apiRequest('/api/messages/ping');
    console.log('✅ [API] 서버 연결 성공:', response);
    return true;
  } catch (error) {
    console.error('❌ [API] 서버 연결 실패:', error);
    return false;
  }
};

/**
 * 암호화된 메시지 전송
 */
export const sendEncryptedMessage = async (
  userId: string,
  encryptedContent: string
): Promise<{ id: number; success: boolean }> => {
  console.log('📤 [API] 암호화된 메시지 전송');
  console.log('  User ID:', userId);
  console.log('  암호화된 내용 (앞 50자):', encryptedContent.substring(0, 50) + '...');

  const response = await apiRequest('/api/messages/test', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      encryptedContent,
    }),
  });

  console.log('✅ [API] 전송 완료:', response);
  return response;
};

/**
 * 암호화된 메시지 조회
 */
export const getEncryptedMessages = async (
  userId: string
): Promise<{ messages: Array<{ id: number; encryptedContent: string; timestamp: string }> }> => {
  console.log('📥 [API] 암호화된 메시지 조회');
  console.log('  User ID:', userId);

  const response = await apiRequest(`/api/messages/test/${userId}`);

  console.log(`✅ [API] 조회 완료: ${response.messages?.length || 0}개 메시지`);
  return response;
};

/**
 * 모든 메시지 삭제 (테스트 초기화용)
 */
export const clearAllMessages = async (): Promise<void> => {
  console.log('🗑️ [API] 모든 메시지 삭제');
  await apiRequest('/api/messages/clear', { method: 'DELETE' });
  console.log('✅ [API] 삭제 완료');
};