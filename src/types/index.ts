export type TimelineItemType = 'memo' | 'board';

export interface BaseItem {
  id: string;
  userId: string;
  type: TimelineItemType;
  createdAt: string;
  bookmarked: boolean;
}

// ── 메모 ────────────────────────────────────
export interface Memo extends BaseItem {
  type: 'memo';
  text: string;
  urls?: string[];
  ogDatas?: OgData[];
  imageUris?: string[];
  imageKeys?: string[];
  images?: MediaAttachment[];
  videoUris?: string[];
  videoKeys?: string[];
  videos?: MediaAttachment[];
  files?: FileAttachment[];
  url?: string;
  ogData?: OgData;
}

// ── 보드 ────────────────────────────────────
export interface Board extends BaseItem {
  type: 'board';
  title: string;
  description?: string;
  tags?: string[];
  notes?: Note[];
  updatedAt?: string;
}

// ── 미디어 첨부 (이미지/영상) ──────────────────
export interface MediaAttachment {
  uid: string;
  url: string;              // presigned URL (화면 렌더링용)
  key: string;              // S3 key (삭제/관리용)
  mimeType: string;
  size: number;             // bytes
  thumbnailUrl?: string;    // 영상 썸네일
  duration?: number;        // 영상 길이(초)
}

// ── 파일 첨부 ──────────────────────────────
export interface FileAttachment {
  uid: string;
  name: string;
  url: string;              // presigned URL (보기/다운로드용)
  key: string;              // S3 key (삭제/관리용)
  mimeType: string;
  size: number;             // bytes
}

// ── 노트 (보드에 속하는 콘텐츠 단위) ──────────
export interface Note {
  id: string;
  title: string;
  content?: string;
  // 기존 호환용
  imageUris?: string[];
  videoUris?: string[];
  imageKeys?: string[];
  videoKeys?: string[];
  // 권장 방식 (uid 포함, React key 경고 해결)
  images?: MediaAttachment[];
  videos?: MediaAttachment[];
  files?: FileAttachment[];
  urls?: string[];
  ogDatas?: OgData[];
  // 레거시 지원 (단일 링크)
  url?: string;
  ogData?: OgData;
}

// ── OG 미리보기 ─────────────────────────────
export interface OgData {
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  summary?: string;
}

// ── 링크 인박스 임시 항목 ─────────────────────
export interface PendingLink {
  id: string;
  userId: string;
  url: string;
  ogData?: OgData;
  receivedAt: string;
}

// ── 타임라인 응답 ──────────────────────────
export interface TimelineResponse {
  items: TimelineItem[];
  hasNext: boolean;
  nextCursor?: string;
  limit: number;
}

// ── 타임라인 유니온 ─────────────────────────
export type TimelineItem = Memo | Board;
