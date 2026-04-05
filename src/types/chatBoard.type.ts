export type MessageType = 'chat' | 'post';

export interface BaseItem {
  id: string;
  userId: string;
  type: MessageType;
  createdAt: string;
  bookMark: boolean;
}

export interface ChatMessage extends BaseItem {
  type: 'chat';
  text: string;
}

export interface SubPostItem {
  id: string;
  title: string;
  content: string;
  imageUris?: string[];
}

export interface OgData {
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
}

export interface BoardPost extends BaseItem {
  type: 'post';
  title: string;
  content: string;
  subItems?: SubPostItem[];
  url?: string;
  ogData?: OgData;
  imageUris?: string[];
}

export type ChatBoardItem = ChatMessage | BoardPost;