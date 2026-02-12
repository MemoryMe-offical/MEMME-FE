// 보낸 메시지가 채팅인지 게시물인지 타입으로 구분

// 메시지 종류(채팅 chat이냐 게시물 post냐)
export type MessageType = 'chat' | 'post';

// 공통 필드 타입
export interface BaseItem {
    id: string;
    userId: string; // 누가 만든 것인가(추후 타인과 대화를 추가할 경우 대비)
    type: MessageType; // 메시지 종류
    createdAt: string; // 생성 날짜
    bookMark: boolean; // 북마크 유무
}

// 채팅 메시지 타입
export interface ChatMessage extends BaseItem {
    type: 'chat'; // 채팅 메시지라 'chat'으로 고정
    text: string; // 메시지 내용
}

// 게시판 글 타입
export interface BoardPost extends BaseItem {
    type: 'post';
    title: string; // 제목
    content: string; // 내용
}

// 메인 화면의 리스트에 들어갈 통합 아이템 타입
export type ChatBoardItem = ChatMessage | BoardPost; // 아이템은 채팅이거나 게시물이거나