import { TimelineItem, TimelineResponse } from '../types';
import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

export interface TimelineQuery {
  type?: 'memo' | 'board';
  tags?: string;            // 콤마로 구분: "work,idea"
  q?: string;               // 검색어
  sort?: 'createdAt' | 'updatedAt';
  limit?: number;           // 최대 100
  cursor?: string;          // 다음 슬라이스용
  excludeId?: string;       // 특정 메모/보드 제외
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

const transformTimelineItem = (item: any): TimelineItem => {
  const base = {
    id: item.uid,
    userId: item.userId || '',
    type: item.type,
    createdAt: item.createdAt,
    bookmarked: item.bookmarked ?? false,
  };

  if (item.type === 'memo') {
    return {
      ...base,
      type: 'memo' as const,
      text: item.text,
    };
  }

  const board = {
    ...base,
    type: 'board' as const,
    title: item.title,
    description: item.description,
    tags: item.tags,
    updatedAt: item.updatedAt,
    notes: item.notes?.map((note: any) => {
      // videoUris가 있지만 videos가 없으면 videoUris를 기반으로 videos 생성
      const videos = note.videos || (note.videoUris?.map((uri: string, idx: number) => ({
        uid: `video-${idx}`,
        url: uri,
        key: note.videoKeys?.[idx] || '',
        mimeType: 'video/mp4',
        size: 0,
      })) ?? []);

      // urls가 없지만 url이 있으면 urls 배열 생성
      const urls = note.urls || (note.url ? [note.url] : []);
      const ogDatas = note.ogDatas || (note.ogData ? [note.ogData] : []);

      const transformedNote = {
        id: note.uid,
        title: note.title,
        content: note.content,
        imageUris: note.imageUris,
        videoUris: note.videoUris,
        imageKeys: note.imageKeys,
        videoKeys: note.videoKeys,
        images: note.images,
        videos: videos,
        files: note.files,
        urls: urls,
        ogDatas: ogDatas,
        url: note.url,
        ogData: note.ogData,
      };
      console.log('Transformed note:', transformedNote);
      return transformedNote;
    }),
  };
  return board;
};

/**
 * 타임라인 조회 (메모 + 보드 통합) - cursor slice 방식
 * 첫 조회: fetchTimeline({ limit: 50 })
 * 다음 조회: fetchTimeline({ limit: 50, cursor: nextCursor })
 */
export const fetchTimeline = async (query?: TimelineQuery): Promise<TimelineResponse> => {
  try {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.tags) params.append('tags', query.tags);
    if (query?.q) params.append('q', query.q);
    if (query?.sort) params.append('sort', query.sort);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.cursor) params.append('cursor', query.cursor);
    if (query?.excludeId) params.append('excludeId', query.excludeId);

    const url = `${BASE_URL}/timeline${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetchWithAutoLogoutHandler(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<TimelineResponse> = await response.json();
    const { items, hasNext, nextCursor, limit } = apiResponse.data;

    // 백엔드가 desc로 보내므로 역순으로 뒤집음 (오래된 것이 위, 최신이 아래)
    const transformedItems = items.map(transformTimelineItem).reverse();

    return {
      items: transformedItems,
      hasNext,
      nextCursor,
      limit,
    };
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    throw error;
  }
};
