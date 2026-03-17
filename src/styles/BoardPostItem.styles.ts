import { StyleSheet } from 'react-native';

export const boardPostItemStyles = StyleSheet.create({
  // 게시판 아이템 - 행 컨테이너 (우측 정렬)
  'boardPostItem-row': {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 4,
  },

  // 게시판 아이템 - 시간 텍스트 (버블 왼쪽)
  'boardPostItem-time': {
    fontSize: 11,
    color: '#9DAFC8',
    marginRight: 6,
    marginBottom: 2,
    fontFamily: 'PretendardVariable',
  },

  // 게시판 아이템 - 말풍선
  'boardPostItem-bubble': {
    backgroundColor: '#FF9500',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },

  // 게시판 아이템 - 말풍선 - 제목
  'boardPostItem-bubble-title': {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
  },

  // 게시판 아이템 - 말풍선 - 내용 (제목 아래 미리보기)
  'boardPostItem-bubble-content': {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontFamily: 'PretendardVariable',
    marginTop: 4,
    lineHeight: 18,
  },
});
