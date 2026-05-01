import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board } from '../types';

const BASE_URL = 'https://memme.o-r.kr/v1';

/**
 * 새 보드 생성
 */
export const createBoard = async (boardData: {
  title: string;
  description?: string;
  tags?: string[];
}): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(boardData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create board:', error);
    throw error;
  }
};

/**
 * 보드 상세 조회
 */
export const fetchBoard = async (boardUid: string): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/boards/${boardUid}`, {
      method: 'GET',
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
    console.error('Failed to fetch board:', error);
    throw error;
  }
};

/**
 * 보드 정보 수정
 */
export const updateBoard = async (
  boardUid: string,
  updates: {
    title?: string;
    description?: string;
    tags?: string[];
  }
): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/boards/${boardUid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update board:', error);
    throw error;
  }
};

/**
 * 보드 삭제
 */
export const deleteBoard = async (boardUid: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/boards/${boardUid}`, {
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
    console.error('Failed to delete board:', error);
    throw error;
  }
};

/**
 * 보드 북마크 토글
 */
export const toggleBoardBookmark = async (boardUid: string): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/boards/${boardUid}/bookmark`, {
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
    console.error('Failed to toggle board bookmark:', error);
    throw error;
  }
};
