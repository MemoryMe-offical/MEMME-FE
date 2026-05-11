import AsyncStorage from '@react-native-async-storage/async-storage';
import { OgData } from '../types';

const BASE_URL = 'https://memme.o-r.kr/v1';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

/**
 * URL의 Open Graph 메타데이터 조회
 */
export const fetchOgData = async (url: string): Promise<OgData> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const endpoint = `${BASE_URL}/og?url=${encodeURIComponent(url)}`;
    console.log('🔥 OG 데이터 요청:', endpoint);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<OgData> = await response.json();
    console.log('🔥 OG 응답:', apiResponse);

    const ogData = apiResponse.data || { title: url };
    console.log('🔥 반환된 OG 데이터:', ogData);
    return ogData;
  } catch (error) {
    console.error('🔥 OG 데이터 요청 실패:', error);
    return { title: url };
  }
};
