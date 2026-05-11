import { Board } from '../types';
import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

const extractKeyFromUrl = (uriOrKey: string): string => {
  if (!uriOrKey) return uriOrKey;

  // 이미 key인 경우 (쿼리 파라미터 없음)
  if (!uriOrKey.includes('?') && !uriOrKey.includes('/v1/upload')) {
    return uriOrKey;
  }

  // URL에서 key 파라미터 추출
  try {
    const match = uriOrKey.match(/[?&]key=([^&]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch (error) {
    console.error('Failed to extract key from URI:', uriOrKey, error);
  }

  return uriOrKey;
};

const transformBoard = (data: any): Board => {
  return {
    ...data,
    id: data.uid,
    bookMark: data.bookmarked ?? false,
    userId: data.userId || '',
    notes: data.notes?.map((note: any) => ({
      id: note.uid,
      title: note.title,
      content: note.content,
      imageUris: note.imageUris?.map((uri: string) => extractKeyFromUrl(uri)),
      videoUris: note.videoUris,
      files: note.files,
      url: note.url,
      ogData: note.ogData,
    })),
  };
};

/**
 * 새 보드 생성
 */
export const createBoard = async (boardData: {
  title: string;
  description?: string;
  tags?: string[];
}): Promise<Board> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards`, {
      method: 'POST',
      body: JSON.stringify(boardData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseBoard = data.data;
    return transformBoard(responseBoard);
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
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseBoard = data.data;
    return transformBoard(responseBoard);
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
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseBoard = data.data;
    return transformBoard(responseBoard);
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
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}`, {
      method: 'DELETE',
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
export const toggleBoardBookmark = async (boardUid: string, bookmarked?: boolean): Promise<Board> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}/bookmark`, {
      method: 'PATCH',
      body: JSON.stringify({ bookmarked: bookmarked ?? true }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseBoard = data.data;
    return transformBoard(responseBoard);
  } catch (error) {
    console.error('Failed to toggle board bookmark:', error);
    throw error;
  }
};
