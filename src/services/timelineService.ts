import { TimelineItem } from '../types';
import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

export interface TimelineQuery {
  type?: 'memo' | 'board';
  sort?: 'createdAt' | 'updatedAt' | 'bookMark';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  tags?: string[];
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

interface TimelineData {
  items: any[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 타임라인 조회 (메모 + 보드 통합)
 */
export const fetchTimeline = async (query?: TimelineQuery): Promise<TimelineItem[]> => {
  try {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.sort) params.append('sort', query.sort);
    if (query?.order) params.append('order', query.order || 'desc');
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());
    if (query?.tags?.length) {
      query.tags.forEach(tag => params.append('tags', tag));
    }

    const url = `${BASE_URL}/timeline${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetchWithAutoLogoutHandler(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<TimelineData> = await response.json();
    const items = apiResponse.data?.items || [];

    const transformed = items.map((item: any) => ({
      ...item,
      id: item.uid,
      bookMark: item.bookmarked ?? false,
      userId: item.userId || '',
      notes: item.notes?.map((note: any) => ({
        id: note.uid,
        title: note.title,
        content: note.content,
        imageUris: note.imageUris,
        videoUris: note.videoUris,
        files: note.files,
        url: note.url,
        ogData: note.ogData,
      })),
    }));

    // 백엔드가 여전히 desc로 보내므로 역순으로 뒤집음 (오래된 것이 위, 최신이 아래)
    return transformed.reverse();
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    throw error;
  }
};
