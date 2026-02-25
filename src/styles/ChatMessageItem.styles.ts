import { StyleSheet } from 'react-native';

export const chatMessageItemStyles = StyleSheet.create({
  // 채팅 아이템 - 행 컨테이너 (우측 정렬)
  'chatMessageItem-row': {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '72%',
  },

  // 채팅 아이템 - 말풍선 - 텍스트
  'chatMessageItem-bubble-text': {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
  },
});
