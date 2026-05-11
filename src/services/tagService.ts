import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

export interface TagData {
  name: string;
  count: number;
}

/**
 * 사용 가능한 모든 태그 조회 (사용 횟수 포함)
 */
export const fetchTags = async (): Promise<TagData[]> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/tags`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tags || [];
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    throw error;
  }
};
