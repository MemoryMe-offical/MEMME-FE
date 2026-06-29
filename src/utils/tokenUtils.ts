import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_ID: 'userId',
  AUTO_LOGIN: 'AUTO_LOGIN',
};

const REFRESH_URL = 'https://memme.o-r.kr/v1/auth/refresh';

let refreshPromise: Promise<boolean> | null = null;

type FetchHeaders = NonNullable<RequestInit['headers']>;

interface JWTPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

const decodeBase64 = (value: string): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const globalAtob = (globalThis as unknown as {
    atob?: (encoded: string) => string;
  }).atob;

  if (globalAtob) {
    return globalAtob(value);
  }

  let output = '';
  let index = 0;

  while (index < value.length) {
    const encoded1 = chars.indexOf(value.charAt(index++));
    const encoded2 = chars.indexOf(value.charAt(index++));
    const encoded3 = chars.indexOf(value.charAt(index++));
    const encoded4 = chars.indexOf(value.charAt(index++));

    const byte1 = encoded1 * 4 + Math.floor(encoded2 / 16);
    const byte2 = (encoded2 % 16) * 16 + Math.floor(encoded3 / 4);
    const byte3 = (encoded3 % 4) * 64 + encoded4;

    output += String.fromCharCode(byte1);

    if (encoded3 !== 64) {
      output += String.fromCharCode(byte2);
    }

    if (encoded4 !== 64) {
      output += String.fromCharCode(byte3);
    }
  }

  return output;
};

const decodeJWTPart = (value: string): string => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  const binary = decodeBase64(paddedBase64);

  try {
    return decodeURIComponent(
      binary
        .split('')
        .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
  } catch {
    return binary;
  }
};

/**
 * JWT 토큰 디코딩
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = decodeJWTPart(parts[1]);
    const json = JSON.parse(decoded);
    return json;
  } catch {
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

const parseHeaders = (headers?: FetchHeaders): Record<string, string> => {
  if (!headers) {
    return {};
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  const maybeHeaders = headers as {
    forEach?: (callback: (value: string, key: string) => void) => void;
  };

  if (typeof maybeHeaders.forEach === 'function') {
    const parsedHeaders: Record<string, string> = {};
    maybeHeaders.forEach((value, key) => {
      parsedHeaders[key] = value;
    });
    return parsedHeaders;
  }

  return { ...(headers as Record<string, string>) };
};

const hasContentTypeHeader = (headers: Record<string, string>): boolean => {
  return Object.keys(headers).some(key => key.toLowerCase() === 'content-type');
};

const saveTokens = async (
  accessToken: string,
  refreshToken?: string,
): Promise<void> => {
  const entries: [string, string][] = [[STORAGE_KEYS.ACCESS_TOKEN, accessToken]];

  if (refreshToken) {
    entries.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
  }

  await AsyncStorage.multiSet(entries);
};

const shouldClearAuthForRefreshFailure = (status: number): boolean => {
  return status === 400 || status === 401 || status === 403;
};

/**
 * RefreshToken으로 새 AccessToken 발급받기
 */
const refreshAccessTokenInternal = async (): Promise<boolean> => {
  try {
    const accessToken = await getStoredToken();
    const refreshToken = await getStoredRefreshToken();

    if (!refreshToken) {
      return false;
    }

    const response = await fetch(REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      if (shouldClearAuthForRefreshFailure(response.status)) {
        await clearAutoLoginData();
      }
      return false;
    }

    const data = await response.json();
    const newAccessToken = data?.data?.accessToken;
    const newRefreshToken = data?.data?.refreshToken;

    if (!newAccessToken) {
      await clearAutoLoginData();
      return false;
    }

    // Refresh token rotation 대응: 서버가 새 refreshToken을 내려주면 반드시 같이 저장한다.
    await saveTokens(newAccessToken, newRefreshToken);
    return true;
  } catch {
    return false;
  }
};

export const refreshAccessToken = async (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessTokenInternal().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
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
  } catch {
    return false;
  }
};

/**
 * 자동로그인 데이터 초기화 (로그아웃 시)
 */
export const clearAutoLoginData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.AUTO_LOGIN,
    ]);
  } catch (error) {
    throw error;
  }
};

/**
 * 401 에러 처리를 포함한 fetch 래퍼
 * - 401 응답 시 토큰 갱신 시도
 * - 토큰 갱신 실패 또는 재시도 후에도 401이면 자동로그인 데이터 초기화
 * - 403은 권한 문제일 수 있으므로 세션을 지우지 않고 호출부가 처리한다.
 * - FormData 자동 감지 (Content-Type 자동 설정)
 * - 에러 로그 출력
 */
export const fetchWithAutoLogoutHandler = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    let token = await getStoredToken();

    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        token = await getStoredToken();
      }
    }

    // FormData 여부 확인 (자동으로 Content-Type 설정)
    const isFormData = options?.body instanceof FormData;

    const headers: Record<string, string> = {
      ...parseHeaders(options?.headers),
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    // FormData가 아니면 JSON 타입 설정
    if (!isFormData && !hasContentTypeHeader(headers)) {
      headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && url !== REFRESH_URL) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        const refreshedToken = await getStoredToken();
        const retryHeaders: Record<string, string> = {
          ...headers,
          ...(refreshedToken && { 'Authorization': `Bearer ${refreshedToken}` }),
        };

        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    }

    // Refresh 실패 또는 재시도 후에도 401 응답 시 자동로그인 데이터 초기화
    if (response.status === 401) {
      await clearAutoLoginData();
      // 에러를 throw하면 호출한 곳에서 처리 (보통 Login 화면으로 이동)
      throw new Error(`Unauthorized (${response.status})`);
    }

    return response;
  } catch (error) {
    throw error;
  }
};
