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
    noteTitle?: string;
    content?: string;
  }
): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const requestBody = {
      boardTitle: boardData?.title,
      description: boardData?.description,
      tags: boardData?.tags,
      noteTitle: boardData?.noteTitle,
      content: boardData?.content,
    };
    console.log('convertMemoToNewBoard request:', memoUid, JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${BASE_URL}/memos/${memoUid}/convert/new-board`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Convert memo error response:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const response_data = await response.json();
    console.log('convertMemoToNewBoard response:', JSON.stringify(response_data, null, 2));

    const responseBoard = response_data.data;
    const result: Board = {
      id: responseBoard.uid,
      userId: responseBoard.userId || '',
      type: 'board',
      title: responseBoard.title,
      description: responseBoard.description,
      tags: responseBoard.tags,
      notes: responseBoard.notes?.map((note: any) => ({
        id: note.uid,
        title: note.title,
        content: note.content,
        imageUris: note.imageUris,
        videoUris: note.videoUris,
        files: note.files,
        url: note.url,
        ogData: note.ogData,
      })),
      bookMark: responseBoard.bookmarked ?? false,
      createdAt: responseBoard.createdAt,
      updatedAt: responseBoard.updatedAt,
    };
    return result;
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
  targetBoardUid: string,
  noteData?: {
    noteTitle?: string;
    content?: string;
  }
): Promise<Board> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const requestBody = {
      noteTitle: noteData?.noteTitle,
      content: noteData?.content,
    };

    const response = await fetch(
      `${BASE_URL}/memos/${memoUid}/convert/boards/${targetBoardUid}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const response_data = await response.json();
    const responseBoard = response_data.data;
    const result: Board = {
      id: responseBoard.uid,
      userId: responseBoard.userId || '',
      type: 'board',
      title: responseBoard.title,
      description: responseBoard.description,
      tags: responseBoard.tags,
      notes: responseBoard.notes?.map((note: any) => ({
        id: note.uid,
        title: note.title,
        content: note.content,
        imageUris: note.imageUris,
        videoUris: note.videoUris,
        files: note.files,
        url: note.url,
        ogData: note.ogData,
      })),
      bookMark: responseBoard.bookmarked ?? false,
      createdAt: responseBoard.createdAt,
      updatedAt: responseBoard.updatedAt,
    };
    return result;
  } catch (error) {
    console.error('Failed to convert memo to existing board:', error);
    throw error;
  }
};
