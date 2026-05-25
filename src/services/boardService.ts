import { Board } from '../types';
import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

const transformBoard = (data: any): Board => {
  return {
    id: data.uid,
    userId: data.userId || '',
    type: 'board',
    title: data.title,
    description: data.description,
    tags: data.tags,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    bookmarked: data.bookmarked ?? false,
    notes: data.notes?.map((note: any) => {
      // urls가 없지만 url이 있으면 urls 배열 생성 (하위호환성)
      const urls = note.urls || (note.url ? [note.url] : []);
      const ogDatas = note.ogDatas || (note.ogData ? [note.ogData] : []);

      return {
        id: note.uid,
        title: note.title,
        content: note.content,
        imageUris: note.imageUris,
        videoUris: note.videoUris,
        imageKeys: note.imageKeys,
        videoKeys: note.videoKeys,
        images: note.images,
        videos: note.videos,
        files: note.files,
        urls: urls,
        ogDatas: ogDatas,
        url: note.url,
        ogData: note.ogData,
      };
    }),
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
