import AsyncStorage from '@react-native-async-storage/async-storage';
import { OgData } from '../types';

const BASE_URL = 'https://memme.o-r.kr/v1';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

/**
 * HTML 엔티티 디코딩 (과거 구현 기반)
 */
const decodeHtmlEntities = (str: string): string =>
  str
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

/**
 * HTML에서 OG 메타데이터 추출 (과거 구현 기반)
 * - HTML 엔티티 디코딩 적용
 * - 속성 순서 상관없이 매칭 (2가지 패턴)
 */
const extractOgDataFromHtml = (html: string, url: string): OgData => {
  const getMeta = (prop: string): string => {
    // 패턴 1: property 먼저, content 나중
    const m1 = html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i'));
    if (m1?.[1]) return decodeHtmlEntities(m1[1]);

    // 패턴 2: content 먼저, property 나중
    const m2 = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'));
    if (m2?.[1]) return decodeHtmlEntities(m2[1]);

    return '';
  };

  const title = getMeta('title');
  const description = getMeta('description');
  const imageUrl = getMeta('image');
  const siteName = getMeta('site_name');

  // title 폴백: <title> 태그 사용
  let finalTitle = title;
  if (!finalTitle) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    finalTitle = titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1]) : url;
  }

  return {
    title: finalTitle,
    description: description || undefined,
    imageUrl: imageUrl || undefined,
    siteName: siteName || undefined,
  };
};

/**
 * URL에서 직접 OG 데이터 크롤링
 */
const fetchOgDataDirect = async (url: string): Promise<OgData> => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const ogData = extractOgDataFromHtml(html, url);
    return ogData;
  } catch (error) {
    console.error('Failed to fetch OG data directly:', error);
    return { title: url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || url };
  }
};

/**
 * URL의 Open Graph 메타데이터 조회
 * 1차: 직접 크롤링 (클라이언트)
 * 2차: 백엔드 API (폴백)
 */
export const fetchOgData = async (url: string): Promise<OgData> => {
  try {
    const directData = await fetchOgDataDirect(url);

    if (directData.title && directData.title !== url && !directData.title.includes('://')) {
      return directData;
    }

    const token = await AsyncStorage.getItem('accessToken');
    const endpoint = `${BASE_URL}/og?url=${encodeURIComponent(url)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (response.ok) {
      const apiResponse: ApiResponse<OgData> = await response.json();
      if (apiResponse.data) {
        return apiResponse.data;
      }
    }

    return directData;
  } catch (error) {
    console.error('Failed to fetch OG data:', error);
    return { title: url };
  }
};
