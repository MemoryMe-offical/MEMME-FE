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
 * HTML에서 OG 메타태그 추출
 */
const extractOgData = (html: string, url: string): OgData => {
  const ogData: OgData = {};

  // og:title
  const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  if (titleMatch) {
    ogData.title = titleMatch[1];
  }

  // og:description
  const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  if (descMatch) {
    ogData.description = descMatch[1];
  }

  // og:image
  const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (imageMatch) {
    ogData.imageUrl = imageMatch[1];
  }

  // og:site_name
  const siteMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
  if (siteMatch) {
    ogData.siteName = siteMatch[1];
  }

  // 폴백: title이 없으면 <title> 태그 사용
  if (!ogData.title) {
    const pageTitleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (pageTitleMatch) {
      ogData.title = pageTitleMatch[1];
    }
  }

  // 폴백: 모든 데이터가 없으면 URL 도메인 사용
  if (!ogData.title) {
    const domain = url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || url;
    ogData.title = domain;
  }

  console.log('🔥 추출된 OG 데이터:', ogData);
  return ogData;
};

/**
 * URL에서 직접 OG 데이터 크롤링 (프론트엔드)
 */
const fetchOgDataDirect = async (url: string): Promise<OgData> => {
  try {
    console.log('🔥 직접 OG 크롤링 시작:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const ogData = extractOgData(html, url);
    console.log('🔥 직접 크롤링 완료:', ogData);
    return ogData;
  } catch (error) {
    console.error('🔥 직접 크롤링 실패:', error);
    return { title: url.match(/^(?:https?:\/\/)?([^/?#]+)/)?.[1] || url };
  }
};

/**
 * URL의 Open Graph 메타데이터 조회
 * 1차: 직접 크롤링 시도
 * 2차: 백엔드 API 요청 (폴백)
 */
export const fetchOgData = async (url: string): Promise<OgData> => {
  try {
    console.log('🔥 ===== OG 데이터 조회 시작 =====');

    // 1차 시도: 프론트에서 직접 크롤링
    console.log('🔥 [1차] 직접 크롤링 시도...');
    const directData = await fetchOgDataDirect(url);

    // 제목이 있으면 직접 크롤링 성공
    if (directData.title && directData.title !== url && !directData.title.includes('://')) {
      console.log('🔥 ✅ 직접 크롤링 성공!', directData);
      return directData;
    }

    // 2차 시도: 백엔드 API로 요청
    console.log('🔥 [2차] 백엔드 API 요청...');
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
        console.log('🔥 ✅ 백엔드 API 성공!', apiResponse.data);
        return apiResponse.data;
      }
    }

    // 모두 실패하면 직접 크롤링 결과 사용
    console.log('🔥 ⚠️ 둘 다 실패, 직접 크롤링 결과 사용:', directData);
    return directData;
  } catch (error) {
    console.error('🔥 OG 데이터 조회 최종 실패:', error);
    return { title: url };
  }
};
