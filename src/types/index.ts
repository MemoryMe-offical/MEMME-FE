export type TimelineItemType = 'memo' | 'board';

export interface BaseItem {
  id: string;
  userId: string;
  type: TimelineItemType;
  createdAt: string;
  bookMark: boolean;
}

// ── 메모 ────────────────────────────────────
export interface Memo extends BaseItem {
  type: 'memo';
  text: string;
}

// ── 보드 ────────────────────────────────────
export interface Board extends BaseItem {
  type: 'board';
  title: string;
  description?: string;
  tags?: string[];
  notes?: Note[];
  updatedAt?: string;
  // imageUris, url, ogData 없음 — 모든 미디어는 Note에 귀속
}

// ── 노트 (보드에 속하는 콘텐츠 단위) ──────────
export interface Note {
  id: string;
  title: string;          // 필수. 빈 문자열 불가
  content?: string;
  imageUris?: string[];
  videoUris?: string[];
  files?: FileAttachment[];
  url?: string;
  ogData?: OgData;
}

// ── 첨부 파일 ────────────────────────────────
export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;           // bytes
}

// ── OG 미리보기 ─────────────────────────────
export interface OgData {
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
}

// ── 링크 인박스 임시 항목 ─────────────────────
export interface PendingLink {
  id: string;
  userId: string;
  url: string;
  ogData?: OgData;
  receivedAt: string;
}

// ── 타임라인 유니온 ─────────────────────────
export type TimelineItem = Memo | Board;
