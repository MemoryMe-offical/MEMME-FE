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

    const response = await fetch(`${BASE_URL}/og?url=${encodeURIComponent(url)}`, {
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
    return apiResponse.data || { title: url };
  } catch (error) {
    console.error('Failed to fetch OG data:', error);
    return { title: url };
  }
};
