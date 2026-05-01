import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board } from '../types';

const BASE_URL = 'https://memme.o-r.kr/v1';

/**
 * 메모를 새로운 보드로 변환
 */
export const convertMemoToNewBoard = async (
  memoUid: string,
  boardData?: {
    title?: string;
    description?: string;
    tags?: string[];
  }
): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${BASE_URL}/memos/${memoUid}/convert/new-board`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(boardData || {}),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to convert memo to new board:', error);
    throw error;
  }
};

/**
 * 메모를 기존 보드의 노트로 변환
 */
export const convertMemoToExistingBoard = async (
  memoUid: string,
  targetBoardUid: string
): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(
      `${BASE_URL}/memos/${memoUid}/convert/boards/${targetBoardUid}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to convert memo to existing board:', error);
    throw error;
  }
};
