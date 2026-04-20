import AsyncStorage from '@react-native-async-storage/async-storage';
import { PendingLink } from '../types';

// ─── P2: 로컬 구현 ───────────────────────────────────────────────────────────
// TODO(P3): 아래 함수들을 API 호출로 교체
// POST /api/pending-links, GET /api/pending-links, DELETE /api/pending-links/:id

const PENDING_KEY = 'pending_links';

export const addPendingLink = async (link: Omit<PendingLink, 'id'>): Promise<PendingLink> => {
  const stored = await loadPendingLinks();
  const newLink: PendingLink = { ...link, id: Date.now().toString() };
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify([...stored, newLink]));
  return newLink;
};

export const loadPendingLinks = async (): Promise<PendingLink[]> => {
  try {
    const json = await AsyncStorage.getItem(PENDING_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const removePendingLink = async (id: string): Promise<void> => {
  const stored = await loadPendingLinks();
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(stored.filter(l => l.id !== id)));
};
