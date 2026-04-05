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
    minHeight: 100,
    paddingBottom: 20,
  },

  // 섹션 구분선 (굵은 줄)
  'editModal-section-divider': {
    height: 8,
    backgroundColor: '#F4F7FF',
    marginHorizontal: -20,
    marginVertical: 4,
  },

  // 섹션 라벨 (미디어 / 일정 / 서브아이템 / 링크)
  'editModal-section-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },

  // ── 서브아이템 섹션 ──

  // 서브아이템 카드
  'subItem-card': {
    backgroundColor: '#F8FAFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },

  // 서브아이템 헤더 (번호 + 삭제 버튼)
  'subItem-card-header': {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  // 서브아이템 번호 뱃지
  'subItem-card-index': {
    fontSize: 11,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
  },

  // 서브아이템 삭제 버튼 (우측 정렬)
  'subItem-card-deleteButton': {
    marginLeft: 'auto',
    padding: 4,
  },

  // 서브아이템 제목 입력
  'subItem-titleInput': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECFF',
    marginBottom: 8,
  },

  // 서브아이템 내용 입력
  'subItem-contentInput': {
    fontSize: 14,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
    minHeight: 60,
  },

  // 서브아이템 추가 버튼
  'subItem-addButton': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },

  // 서브아이템 추가 버튼 텍스트
  'subItem-addButton-text': {
    fontSize: 14,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // ── 링크 섹션 ──

  // 링크 입력 행
  'link-inputRow': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  // 링크 TextInput
  'link-input': {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: '#E4ECFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // 링크 불러오기 버튼
  'link-fetchButton': {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#588DFF',
    borderRadius: 10,
  },

  // 링크 불러오기 버튼 텍스트
  'link-fetchButton-text': {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },

  // 링크 삭제 버튼
  'link-clearButton': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 8,
  },

  // 링크 삭제 텍스트
  'link-clearButton-text': {
    fontSize: 13,
    color: '#FF3B30',
    fontFamily: 'PretendardVariable',
  },

  // OG 미리보기 카드
  'link-og-card': {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4ECFF',
    marginBottom: 4,
  },

  // OG 이미지
  'link-og-image': {
    width: '100%',
    height: 140,
    backgroundColor: '#E8EEF8',
  },

  // OG 텍스트 영역
  'link-og-body': {
    padding: 12,
    backgroundColor: '#F8FAFF',
  },

  // OG 사이트명
  'link-og-sitename': {
    fontSize: 11,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    marginBottom: 2,
  },

  // OG 제목
  'link-og-title': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    marginBottom: 2,
  },

  // OG 설명
  'link-og-desc': {
    fontSize: 12,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 18,
  },

  // 링크 로딩 중 표시
  'link-loading': {
    paddingVertical: 14,
    alignItems: 'center',
  },

  // ── 이미지 섹션 ──

  // 이미지 가로 스크롤 래퍼
  'image-row': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },

  // 이미지 썸네일
  'image-thumb': {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E8EEF8',
  },

  // 이미지 삭제 오버레이 버튼
  'image-deleteOverlay': {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    padding: 2,
  },

  // 이미지 추가 버튼 박스
  'image-addButton': {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#EEF3FF',
    borderWidth: 1.5,
    borderColor: '#C8D8FF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── 일정 섹션 (준비 중) ──

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
