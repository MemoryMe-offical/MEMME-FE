import { StyleSheet } from 'react-native';

export const chatInputBarStyles = StyleSheet.create({
  // 입력 바 - 컨테이너
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  // 입력 바 - 플러스 버튼
  plusButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 입력 바 - 입력창
  input: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 13,
    lineHeight: 16,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'top',
  },

  // 입력 바 - 전송 버튼
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#588DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
