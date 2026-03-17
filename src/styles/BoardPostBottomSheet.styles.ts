import { StyleSheet } from 'react-native';

export const boardPostBottomSheetStyles = StyleSheet.create({
  // 반투명 어두운 오버레이 (백드롭)
  'sheet-backdrop': {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  // 시트 본체 컨테이너 (화면 하단 고정)
  'sheet-container': {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // 드래그 핸들 막대 영역
  'sheet-handle-wrap': {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },

  // 드래그 핸들 막대
  'sheet-handle-bar': {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D8E8',
  },

  // 시트 헤더 (라벨 + 닫기 버튼)
  'sheet-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3FF',
  },

  // 시트 헤더 - 라벨
  'sheet-header-label': {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9500',
    fontFamily: 'PretendardVariable',
  },

  // 시트 본문 스크롤 영역
  'sheet-body': {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // 시트 본문 - 제목
  'sheet-body-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 26,
    marginBottom: 6,
  },

  // 시트 본문 - 날짜/시간
  'sheet-body-time': {
    fontSize: 12,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    marginBottom: 16,
  },

  // 시트 본문 - 내용
  'sheet-body-content': {
    fontSize: 15,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
    lineHeight: 24,
  },

  // 시트 하단 액션 영역
  'sheet-footer': {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEF3FF',
  },

  // 시트 하단 - 수정 버튼
  'sheet-footer-editButton': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EEF3FF',
    gap: 6,
  },

  // 시트 하단 - 수정 버튼 텍스트
  'sheet-footer-editButton-text': {
    fontSize: 14,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
});
