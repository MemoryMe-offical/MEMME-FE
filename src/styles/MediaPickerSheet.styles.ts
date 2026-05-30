import { StyleSheet } from 'react-native';

export const mediaPickerSheetStyles = StyleSheet.create({
  // 모달 오버레이
  'modal-overlay': {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },

  // 모달 시트
  'modal-sheet': {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    maxHeight: '75%',
  },

  // 드래그 핸들바
  'modal-handle': {
    width: 40,
    height: 4,
    backgroundColor: '#E0E8F8',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },

  // 헤더 컨테이너
  'modal-header': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  // 헤더 타이틀
  'modal-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  // 닫기 버튼
  'modal-close-btn': {
    padding: 8,
  },

  // 컨텐츠 컨테이너
  'modal-content': {
    gap: 12,
    marginBottom: 12,
  },

  // 미디어 선택 항목
  'picker-item': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },

  // 선택 항목 아이콘
  'picker-item-icon': {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 선택 항목 텍스트 컨테이너
  'picker-item-text-container': {
    flex: 1,
  },

  // 선택 항목 주요 텍스트
  'picker-item-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  // 선택 항목 부가 텍스트
  'picker-item-description': {
    fontSize: 12,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    marginTop: 2,
  },
});
