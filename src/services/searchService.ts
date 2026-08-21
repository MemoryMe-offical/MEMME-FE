import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const API_BASE_URL = 'https://memme.o-r.kr/v1';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface SearchItem {
  type: 'memo' | 'board' | 'note';
  uid: string;
  title: string;
  content: string;
  snippet: string;
  parentType: string | null;
  parentUid: string | null;
  parentTitle: string | null;
  tags: string[];
  urls: string[];
  attachmentNames: string[];
  bookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  score: number;
}

export interface SearchResponse {
  items: SearchItem[];
  hasNext: boolean;
  nextCursor: string | null;
  limit: number;
  totalCount: number;
}

export const search = async (
  query: string,
  type?: 'memo' | 'board' | 'note',
  limit: number = 20,
  cursor?: string
): Promise<SearchResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) {
      params.append('type', type);
    }
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await fetchWithAutoLogoutHandler(
      `${API_BASE_URL}/search?${params.toString()}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<SearchResponse> = await response.json();
    return apiResponse.data;
  } catch (error) {
    // console.error('Search failed:', error);
    throw error;
  }
};

export const reindex = async (): Promise<{
  indexName: string;
  userUid: string;
  indexedCount: number;
  memoCount: number;
  boardCount: number;
  noteCount: number;
}> => {
  try {
    const response = await fetchWithAutoLogoutHandler(
      `${API_BASE_URL}/search/reindex`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<{
      indexName: string;
      userUid: string;
      indexedCount: number;
      memoCount: number;
      boardCount: number;
      noteCount: number;
    }> = await response.json();

    return apiResponse.data;
  } catch (error) {
    // console.error('Reindex failed:', error);
    throw error;
  }
};
