import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ID: 'userId',
  AUTO_LOGIN: 'AUTO_LOGIN',
};

interface JWTPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * JWT 토큰 디코딩
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload);
    const json = JSON.parse(decoded);
    return json;
  } catch (error) {
    return null;
  }
};

/**
 * JWT 토큰이 만료되었는지 확인
 * exp 필드가 현재 시간보다 작으면 만료됨
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp < currentTime;

  return isExpired;
};

/**
 * JWT에서 userId 추출
 */
export const extractUserIdFromJWT = (token: string): string | null => {
  const payload = decodeJWT(token);
  if (!payload) return null;
  return payload.sub || null;
};

/**
 * 자동로그인 상태가 활성화되어 있는지 확인
 */
export const isAutoLoginEnabled = async (): Promise<boolean> => {
  const autoLogin = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOGIN);
  return autoLogin === 'true';
};

/**
 * 저장된 accessToken 조회
 */
export const getStoredToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * 저장된 refreshToken 조회
 */
export const getStoredRefreshToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * 저장된 userId 조회
 */
export const getStoredUserId = async (): Promise<string | null> => {
  return AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
};

/**
 * RefreshToken으로 새 AccessToken 발급받기
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await getStoredRefreshToken();

    if (!refreshToken) {
      return false;
    }

    const response = await fetch('https://memme.o-r.kr/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await clearAutoLoginData();
      return false;
    }

    const data = await response.json();
    const newAccessToken = data?.data?.accessToken;

    if (!newAccessToken) {
      await clearAutoLoginData();
      return false;
    }

    // 새 토큰 저장
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 자동로그인 데이터가 유효한지 확인
 * - AUTO_LOGIN이 true
 * - accessToken 존재
 * - userId 존재
 * - 토큰 만료되지 않음 (만료되면 RefreshToken으로 갱신 시도)
 */
export const isAutoLoginDataValid = async (): Promise<boolean> => {
  try {
    const autoLoginEnabled = await isAutoLoginEnabled();
    if (!autoLoginEnabled) {
      return false;
    }

    const token = await getStoredToken();
    if (!token) {
      return false;
    }

    const userId = await getStoredUserId();
    if (!userId) {
      return false;
    }

    const expired = isTokenExpired(token);

    if (expired) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 자동로그인 데이터 초기화 (로그아웃 시)
 */
export const clearAutoLoginData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTO_LOGIN);
  } catch (error) {
    throw error;
  }
};

/**
 * 401/403 에러 처리를 포함한 fetch 래퍼
 * - 401/403 응답 시 자동로그인 데이터 초기화
 * - FormData 자동 감지 (Content-Type 자동 설정)
 * - 에러 로그 출력
 */
export const fetchWithAutoLogoutHandler = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    const token = await getStoredToken();

    // FormData 여부 확인 (자동으로 Content-Type 설정)
    const isFormData = options?.body instanceof FormData;

    const headers: HeadersInit = {
      ...(options?.headers || {}),
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    // FormData가 아니면 JSON 타입 설정
    if (!isFormData && !headers['Content-Type']) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 401/403 응답 시 자동로그인 데이터 초기화
    if (response.status === 401 || response.status === 403) {
      await clearAutoLoginData();
      // 에러를 throw하면 호출한 곳에서 처리 (보통 Login 화면으로 이동)
      throw new Error(`Unauthorized (${response.status})`);
    }

    return response;
  } catch (error) {
    throw error;
  }
};
