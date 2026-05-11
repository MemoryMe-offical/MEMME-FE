import AsyncStorage from '@react-native-async-storage/async-storage';
import { PendingLink } from '../types';

const BASE_URL = 'https://memme.o-r.kr/v1';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

/**
 * 새 대기 링크 추가
 */
export const addPendingLink = async (link: Omit<PendingLink, 'id'>): Promise<PendingLink> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const payload = {
      url: link.url,
      ...(link.ogData && { ogData: link.ogData }),
    };

    const response = await fetch(`${BASE_URL}/pending-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<{ pendingLink: PendingLink }> = await response.json();

    return {
      ...apiResponse.data.pendingLink,
      id: apiResponse.data.pendingLink.id || apiResponse.data.pendingLink.uid,
    };
  } catch (error) {
    console.error('Failed to add pending link:', error);
    throw error;
  }
};

/**
 * 모든 대기 링크 조회
 */
export const loadPendingLinks = async (): Promise<PendingLink[]> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    if (!token) {
      return [];
    }

    const response = await fetch(`${BASE_URL}/pending-links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<{ pendingLinks: any[] }> = await response.json();
    return (apiResponse.data.pendingLinks || []).map((link: any) => ({
      ...link,
      id: link.uid || link.id,
    }));
  } catch (error) {
    console.error('Failed to load pending links:', error);
    return [];
  }
};

/**
 * 대기 링크 삭제
 */
export const removePendingLink = async (id: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/pending-links/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to remove pending link:', error);
    throw error;
  }
};
