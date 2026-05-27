import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CHAT_MESSAGE_MAX_WIDTH = (SCREEN_WIDTH - 48) / 1.3;

export const chatMessageItemStyles = StyleSheet.create({
  // 채팅 아이템 - 행 컨테이너 (우측 정렬)
  'chatMessageItem-row': {
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },

  // 채팅 아이템 - 시간 텍스트 (버블 왼쪽)
  'chatMessageItem-time': {
    fontSize: 11,
    color: '#9DAFC8',
    marginRight: 6,
    marginBottom: 2,
    fontFamily: 'PretendardVariable',
  },

  // 채팅 아이템 - 말풍선
  'chatMessageItem-bubble': {
    backgroundColor: '#588DFF',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 1,
    flexGrow: 0,
  },

  // 채팅 아이템 - 말풍선 - 텍스트
  'chatMessageItem-bubble-text': {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
});
