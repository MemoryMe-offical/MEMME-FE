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
export const createMemo = async (
  text: string,
  urls?: string[],
  ogDatas?: any[],
  imageUris?: string[],
  imageKeys?: string[],
  videoUris?: string[],
  videoKeys?: string[],
  files?: any[]
): Promise<Memo> => {
  try {
    const trimmedText = text.trim();
    const body: any = { text: trimmedText || ' ' };

    if (urls && urls.length > 0) {
      body.urls = urls;
    }
    if (ogDatas && ogDatas.length > 0) {
      body.ogDatas = ogDatas;
    }
    if (imageUris && imageUris.length > 0) {
      body.imageUris = imageUris;
    }
    if (imageKeys && imageKeys.length > 0) {
      body.imageKeys = imageKeys;
    }
    if (videoUris && videoUris.length > 0) {
      body.videoUris = videoUris;
    }
    if (videoKeys && videoKeys.length > 0) {
      body.videoKeys = videoKeys;
    }
    if (files && files.length > 0) {
      body.files = files;
    }

    console.log('Creating memo with body:', JSON.stringify(body));

    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/memos`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    const memo = apiResponse.data;

    const responseVideos = memo.videoUris && memo.videoKeys
      ? memo.videoUris.map((uri: string, idx: number) => ({
          uri,
          key: memo.videoKeys[idx],
        }))
      : undefined;

    return {
      id: memo.uid,
      userId: memo.userId || '',
      type: 'memo',
      text: memo.text,
      urls: memo.urls || urls,
      ogDatas: memo.ogDatas || ogDatas,
      imageUris: memo.imageUris || imageUris,
      imageKeys: memo.imageKeys || imageKeys,
      videos: responseVideos || (videoUris && videoKeys ? videoUris.map((uri: string, idx: number) => ({ uri, key: videoKeys[idx] })) : undefined),
      files: memo.files || files,
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
      imageUris: memo.imageUris,
      imageKeys: memo.imageKeys,
      videos: memo.videos,
      files: memo.files,
      bookmarked: memo.bookmarked ?? false,
      createdAt: memo.createdAt,
    };
  } catch (error) {
    console.error('Failed to toggle memo bookmark:', error);
    throw error;
  }
};
