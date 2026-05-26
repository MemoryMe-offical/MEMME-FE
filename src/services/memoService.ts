import { Memo } from '../types';
import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

/**
 * 빠른 메모 생성
 */
export const createMemo = async (text: string, urls?: string[], ogDatas?: any[]): Promise<Memo> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/memos`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    const memo = apiResponse.data;
    return {
      id: memo.uid,
      userId: memo.userId || '',
      type: 'memo',
      text: memo.text,
      urls: memo.urls || urls,
      ogDatas: memo.ogDatas || ogDatas,
      bookmarked: memo.bookmarked ?? false,
      createdAt: memo.createdAt,
    };
  } catch (error) {
    console.error('Failed to create memo:', error);
    throw error;
  }
};

/**
 * 메모 삭제 (404는 이미 삭제됨으로 간주)
 */
export const deleteMemo = async (memoUid: string): Promise<void> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/memos/${memoUid}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
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
export const toggleMemoBookmark = async (memoUid: string, bookmarked?: boolean): Promise<Memo> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/memos/${memoUid}/bookmark`, {
      method: 'PATCH',
      body: JSON.stringify({ bookmarked: bookmarked ?? true }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    const memo = apiResponse.data;
    return {
      id: memo.uid,
      userId: memo.userId || '',
      type: 'memo',
      text: memo.text,
      urls: memo.urls,
      ogDatas: memo.ogDatas,
      bookmarked: memo.bookmarked ?? false,
      createdAt: memo.createdAt,
    };
  } catch (error) {
    console.error('Failed to toggle memo bookmark:', error);
    throw error;
  }
};
