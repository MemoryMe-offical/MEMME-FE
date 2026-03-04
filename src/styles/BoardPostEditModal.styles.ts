import { StyleSheet } from 'react-native';

export const boardPostEditModalStyles = StyleSheet.create({
  // 전체 컨테이너
  'editModal-container': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 헤더 바
  'editModal-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3FF',
  },

  // 헤더 - 취소 버튼
  'editModal-header-cancelButton': {
    padding: 4,
    minWidth: 48,
  },

  // 헤더 - 취소 텍스트
  'editModal-header-cancelText': {
    fontSize: 15,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },

  // 헤더 - 제목
  'editModal-header-title': {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  // 헤더 - 저장 버튼
  'editModal-header-saveButton': {
    padding: 4,
    minWidth: 48,
    alignItems: 'flex-end',
  },

  // 헤더 - 저장 텍스트
  'editModal-header-saveText': {
    fontSize: 15,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },

  // 헤더 - 저장 텍스트 (비활성)
  'editModal-header-saveText--disabled': {
    color: '#C0CDD8',
  },

  // 스크롤 본문
  'editModal-body': {
    flex: 1,
    paddingHorizontal: 20,
  },

  // 제목 TextInput
  'editModal-titleInput': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    paddingTop: 20,
    paddingBottom: 12,
  },

  // 제목/내용 구분선
  'editModal-divider': {
    height: 1,
    backgroundColor: '#EEF3FF',
    marginBottom: 12,
  },

  // 내용 TextInput
  'editModal-contentInput': {
    fontSize: 15,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
    lineHeight: 24,
    minHeight: 140,
    paddingBottom: 20,
  },

  // 섹션 구분선 (굵은 줄)
  'editModal-section-divider': {
    height: 8,
    backgroundColor: '#F4F7FF',
    marginHorizontal: -20,
    marginVertical: 4,
  },

  // 섹션 라벨 (미디어 / 일정)
  'editModal-section-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 4,
  },

  // 플레이스홀더 행 (준비 중 항목)
  'editModal-placeholder-row': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    opacity: 0.45,
  },

  // 플레이스홀더 텍스트
  'editModal-placeholder-text': {
    flex: 1,
    fontSize: 15,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
  },

  // "준비 중" 뱃지
  'editModal-placeholder-badge': {
    fontSize: 11,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },

  // 플레이스홀더 행 사이 구분선 (얇은 줄)
  'editModal-placeholder-separator': {
    height: 1,
    backgroundColor: '#EEF3FF',
  },
});
