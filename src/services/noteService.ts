import { Note } from '../types';
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

const transformNote = (data: any): Note => ({
  id: data.uid,
  title: data.title,
  content: data.content,
  imageUris: data.imageUris?.map((uri: string) => extractKeyFromUrl(uri)),
  videoUris: data.videoUris,
  files: data.files,
  url: data.url,
  ogData: data.ogData,
});

/**
 * 보드 내 노트 생성
 */
export const createNote = async (
  boardUid: string,
  noteData: {
    title: string;
    content?: string;
    imageUris?: string[];
    videoUris?: string[];
    files?: any[];
    url?: string;
  }
): Promise<Note> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseNote = data.data;
    return transformNote(responseNote);
  } catch (error) {
    console.error('Failed to create note:', error);
    throw error;
  }
};

/**
 * 노트 수정
 */
export const updateNote = async (
  boardUid: string,
  noteUid: string,
  updates: {
    title?: string;
    content?: string;
    imageUris?: string[];
    videoUris?: string[];
    files?: any[];
    url?: string;
  }
): Promise<Note> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}/notes/${noteUid}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseNote = data.data;
    return transformNote(responseNote);
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error;
  }
};

/**
 * 노트 삭제
 */
export const deleteNote = async (boardUid: string, noteUid: string): Promise<void> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}/notes/${noteUid}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
};

/**
 * 노트를 다른 보드로 이동
 */
export const moveNote = async (
  sourceBoard: string,
  noteUid: string,
  targetBoard: string
): Promise<Note> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${sourceBoard}/notes/${noteUid}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ targetBoardUid: targetBoard }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const responseNote = data.data;
    return transformNote(responseNote);
  } catch (error) {
    console.error('Failed to move note:', error);
    throw error;
  }
};
