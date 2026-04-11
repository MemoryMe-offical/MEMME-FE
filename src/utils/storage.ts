import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimelineItem, Board, Note } from '../types';

const ITEMS_KEY = 'timeline_items';
const V1_KEY = 'chat_board_items';

export const loadItems = async (): Promise<TimelineItem[] | null> => {
  try {
    const json = await AsyncStorage.getItem(ITEMS_KEY);
    if (!json) return null;
    return JSON.parse(json) as TimelineItem[];
  } catch {
    return null;
  }
};

export const saveItems = async (items: TimelineItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    // 저장 실패 시 무시 (다음 저장 시 재시도)
  }
};

/**
 * V1 데이터(chat/post 타입)를 V2(memo/board/note)로 마이그레이션.
 * 최초 1회만 실행 (V1 키 존재 여부로 판단).
 */
export const migrateFromV1 = async (): Promise<void> => {
  const oldJson = await AsyncStorage.getItem(V1_KEY);
  if (!oldJson) return;

  const oldItems: any[] = JSON.parse(oldJson);
  const newItems: TimelineItem[] = oldItems.map(item => {
    // ── chat → memo ───────────────────────────
    if (item.type === 'chat') {
      return {
        id: item.id,
        userId: item.userId,
        type: 'memo' as const,
        text: item.text,
        bookMark: item.bookMark,
        createdAt: item.createdAt,
      };
    }

    // ── post → board ──────────────────────────
    const existingNotes: Note[] = (item.subItems ?? []).map((sub: any) => ({
      id: sub.id,
      title: sub.title,
      content: sub.content,
      imageUris: sub.imageUris,
      url: sub.url,
      ogData: sub.ogData,
    }));

    // Board에 직접 붙어있던 미디어를 별도 노트로 이관
    if (item.url) {
      const noteTitle = item.ogData?.title || (() => {
        try { return new URL(item.url).hostname; } catch { return item.url; }
      })();
      existingNotes.push({
        id: `migrated_url_${item.id}`,
        title: noteTitle,
        content: item.ogData?.description,
        url: item.url,
        ogData: item.ogData,
      });
    }
    if (item.imageUris?.length) {
      const dateStr = new Date(item.createdAt).toLocaleDateString('ko-KR');
      existingNotes.push({
        id: `migrated_img_${item.id}`,
        title: `이미지 (${dateStr})`,
        imageUris: item.imageUris,
      });
    }

    const board: Board = {
      id: item.id,
      userId: item.userId,
      type: 'board' as const,
      title: item.title,
      description: item.content || undefined,
      tags: item.tags,
      notes: existingNotes.length > 0 ? existingNotes : undefined,
      bookMark: item.bookMark,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
    return board;
  });

  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(newItems));
  await AsyncStorage.removeItem(V1_KEY);
};
