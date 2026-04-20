import { OgData } from '../types';

// ── HTML 엔티티 디코딩 ──
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

// TODO(P3): 아래 함수를 GET /api/og?url={url} 호출로 교체
export const fetchOgData = async (url: string): Promise<OgData> => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const getMeta = (prop: string) => {
      const m =
        html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'));
      return m?.[1] ? decodeHtmlEntities(m[1]) : '';
    };
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return {
      title: getMeta('title') || (titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1]) : url),
      description: getMeta('description') || undefined,
      imageUrl: getMeta('image') || undefined,
      siteName: getMeta('site_name') || undefined,
    };
  } catch {
    return { title: url };
  }
};
