import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimelineItem } from '../types';

const BASE_URL = 'https://memme.o-r.kr/v1';

export interface TimelineQuery {
  type?: 'memo' | 'board';
  sort?: 'createdAt' | 'updatedAt' | 'bookMark';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  tags?: string[];
}

/**
 * 타임라인 조회 (메모 + 보드 통합)
 */
export const fetchTimeline = async (query?: TimelineQuery): Promise<TimelineItem[]> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    if (query?.sort) params.append('sort', query.sort);
    if (query?.order) params.append('order', query.order);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());
    if (query?.tags?.length) {
      query.tags.forEach(tag => params.append('tags', tag));
    }

    const url = `${BASE_URL}/timeline${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    throw error;
  }
};
