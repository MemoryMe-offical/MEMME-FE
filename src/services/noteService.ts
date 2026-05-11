import { Note, MediaAttachment, FileAttachment } from '../types';
import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

const transformNote = (data: any): Note => ({
  id: data.uid,
  title: data.title,
  content: data.content,
  imageUris: data.imageUris,
  videoUris: data.videoUris,
  imageKeys: data.imageKeys,
  videoKeys: data.videoKeys,
  images: data.images,
  videos: data.videos,
  files: data.files,
  urls: data.urls,
  ogDatas: data.ogDatas,
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
    videos?: MediaAttachment[];
    files?: FileAttachment[];
    urls?: string[];
  }
): Promise<Note> => {
  try {
    // 백엔드 호환성: videos → videoUris로 변환하여 전송
    const bodyData = {
      title: noteData.title,
      content: noteData.content,
      imageUris: noteData.imageUris,
      videoUris: noteData.videos?.map(v => v.url),
      files: noteData.files,
      urls: noteData.urls,
    };

    console.log('Creating note with data:', JSON.stringify(bodyData, null, 2));
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}/notes`, {
      method: 'POST',
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to create note. Status:', response.status, 'Error:', errorData);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
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
    videos?: MediaAttachment[];
    files?: FileAttachment[];
    urls?: string[];
  }
): Promise<Note> => {
  try {
    // 백엔드 호환성: videos → videoUris로 변환하여 전송
    const bodyData: any = {};
    if (updates.title !== undefined) bodyData.title = updates.title;
    if (updates.content !== undefined) bodyData.content = updates.content;
    if (updates.imageUris !== undefined) bodyData.imageUris = updates.imageUris;
    if (updates.videos !== undefined) bodyData.videoUris = updates.videos.map(v => v.url);
    if (updates.files !== undefined) bodyData.files = updates.files;
    if (updates.urls !== undefined) bodyData.urls = updates.urls;

    console.log('Updating note with data:', JSON.stringify(bodyData, null, 2));
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/boards/${boardUid}/notes/${noteUid}`, {
      method: 'PUT',
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to update note. Status:', response.status, 'Error:', errorData);
      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
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
