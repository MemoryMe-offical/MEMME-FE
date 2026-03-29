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
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },

  // 각 메뉴 항목
  'contextMenu-item': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // 항목 구분선
  'contextMenu-separator': {
    height: 1,
    backgroundColor: '#EFEFEF',
  },

  // 항목 텍스트 (기본)
  'contextMenu-item-text': {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '400',
  },

  // 항목 텍스트 (위험 — 삭제)
  'contextMenu-item-text--danger': {
    fontSize: 16,
    color: '#FF3B30',
    fontFamily: 'PretendardVariable',
    fontWeight: '400',
  },

  // 항목 텍스트 (변환 — 파란색) [하위호환 유지]
  'contextMenu-item-text--convert': {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '400',
  },
});
