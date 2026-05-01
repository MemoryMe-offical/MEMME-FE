import AsyncStorage from '@react-native-async-storage/async-storage';
import { Memo } from '../types';

const BASE_URL = 'https://memme.o-r.kr/v1';

/**
 * 빠른 메모 생성
 */
export const createMemo = async (text: string): Promise<Memo> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/memos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create memo:', error);
    throw error;
  }
};

/**
 * 메모 삭제
 */
export const deleteMemo = async (memoUid: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/memos/${memoUid}`, {
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
    console.error('Failed to delete memo:', error);
    throw error;
  }
};

/**
 * 메모 북마크 토글
 */
export const toggleMemoBookmark = async (memoUid: string): Promise<Memo> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/memos/${memoUid}/bookmark`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to toggle memo bookmark:', error);
    throw error;
  }
};
