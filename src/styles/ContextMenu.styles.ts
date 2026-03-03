import { StyleSheet } from 'react-native';

export const contextMenuStyles = StyleSheet.create({
  // 전체화면 백드롭
  'contextMenu-backdrop': {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 팝업 카드
  'contextMenu-card': {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  // 각 메뉴 항목
  'contextMenu-item': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },

  // 항목 구분선
  'contextMenu-separator': {
    height: 1,
    backgroundColor: '#F0F4FF',
    marginHorizontal: 14,
  },

  // 항목 아이콘
  'contextMenu-item-icon': {
    fontSize: 17,
  },

  // 항목 텍스트 (기본)
  'contextMenu-item-text': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  // 항목 텍스트 (위험 — 삭제)
  'contextMenu-item-text--danger': {
    fontSize: 15,
    color: '#FF3B30',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  // 항목 텍스트 (변환 — 파란색)
  'contextMenu-item-text--convert': {
    fontSize: 15,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },
});
