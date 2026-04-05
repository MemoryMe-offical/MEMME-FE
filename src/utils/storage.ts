import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatBoardItem } from '../types/chatBoard.type';

const ITEMS_KEY = 'chat_board_items';

export const loadItems = async (): Promise<ChatBoardItem[] | null> => {
  try {
    const json = await AsyncStorage.getItem(ITEMS_KEY);
    if (!json) return null;
    return JSON.parse(json) as ChatBoardItem[];
  } catch {
    return null;
  }
};

export const saveItems = async (items: ChatBoardItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    // 저장 실패 시 무시 (다음 저장 시 재시도)
  }
};
