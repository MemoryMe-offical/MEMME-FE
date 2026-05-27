import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CHAT_MESSAGE_MAX_WIDTH = (SCREEN_WIDTH - 48) / 1.3;
export const CHAT_LINK_CARD_MAX_WIDTH = CHAT_MESSAGE_MAX_WIDTH * 0.85;

export const chatMessageItemStyles = StyleSheet.create({
  // 메인 컨테이너
  'container': {
    width: '100%',
    alignSelf: 'flex-end',
  },

  // 메시지 + 시간 행
  'message-row': {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    justifyContent: 'flex-end',
  },

  // 시간 텍스트
  'chatMessageItem-time': {
    fontSize: 11,
    color: '#9DAFC8',
    marginRight: 6,
    marginBottom: 2,
    fontFamily: 'PretendardVariable',
  },

  // 메시지 bubble 래퍼
  'message-bubble-wrapper': {
    flexShrink: 1,
    maxWidth: CHAT_MESSAGE_MAX_WIDTH,
  },

  // 말풍선
  'chatMessageItem-bubble': {
    backgroundColor: '#588DFF',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 1,
    flexGrow: 0,
  },

  // 말풍선 텍스트
  'chatMessageItem-bubble-text': {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
    flexWrap: 'wrap',
  },

  // 전문 보기 힌트
  'expand-hint-text': {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
    marginTop: 6,
    fontStyle: 'italic',
    opacity: 0.8,
    textAlign: 'center',
  },

  // 링크 관련 아이템들 컨테이너
  'links-container': {
    gap: 8,
    alignItems: 'flex-end',
    marginTop: 8,
    alignSelf: 'flex-end',
  },

  // OG 데이터 로딩 중 표시
  'og-loading': {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E8EEF8',
    alignItems: 'center',
  },

  'og-loading-text': {
    fontSize: 11,
    color: '#AABBCC',
    marginTop: 6,
    fontFamily: 'PretendardVariable',
  },

  // 링크 카드
  'link-card': {
    maxWidth: CHAT_LINK_CARD_MAX_WIDTH,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF8',
  },

  'link-card-image': {
    width: '100%',
    aspectRatio: 16 / 9,
  },

  'link-card-content': {
    padding: 12,
  },

  'link-card-title': {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    fontFamily: 'PretendardVariable',
  },

  'link-card-description': {
    fontSize: 11,
    color: '#666666',
    marginBottom: 6,
    fontFamily: 'PretendardVariable',
  },

  'link-card-domain': {
    fontSize: 10,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },

  // 링크만 있는 경우 (OgData 없음)
  'link-only-card': {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E8EEF8',
  },

  'link-only-text': {
    fontSize: 11,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },

  // 링크 추가 버튼 래퍼
  'button-wrapper': {
    alignItems: 'flex-end',
  },

  // 링크 추가 버튼
  'add-link-button': {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },

  'add-link-button-text': {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
});
