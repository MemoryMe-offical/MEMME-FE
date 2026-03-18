import { StyleSheet } from 'react-native';

export const boardPostCardStyles = StyleSheet.create({
  // 행 컨테이너 (채팅과 동일한 우측 정렬 구조)
  'card-row': {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 8,
  },

  // 시간 텍스트 (카드 왼쪽)
  'card-time': {
    fontSize: 11,
    color: '#9DAFC8',
    marginRight: 6,
    marginBottom: 4,
    fontFamily: 'PretendardVariable',
  },

  // 카드 전체 래퍼
  'card-wrapper': {
    maxWidth: '85%',
    minWidth: 200,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#3A6FCC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },

  // 파란색 헤더
  'card-header': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#588DFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  // 헤더 제목 텍스트
  'card-header-title': {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },

  // 헤더 우측 버튼 묶음
  'card-header-actions': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // 바디 영역
  'card-body': {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  // 서브아이템 제목 (그룹일 때만 표시)
  'card-body-subtitle': {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    marginBottom: 8,
  },

  // "내용" 섹션 레이블
  'card-section-label': {
    fontSize: 12,
    fontWeight: '600',
    color: '#8899AA',
    fontFamily: 'PretendardVariable',
    marginBottom: 5,
  },

  // 본문 텍스트
  'card-content-text': {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
  },

  // 자세히 버튼 행
  'card-detail-row': {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingBottom: 4,
  },

  // "자세히 >" 버튼 텍스트
  'card-detail-btn': {
    fontSize: 13,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  // 접힌 상태 서브아이템 제목 행
  'card-collapsed-subtitle-row': {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF8',
  },

  // 접힌 상태 서브아이템 제목 텍스트
  'card-collapsed-subtitle-text': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 서브탭 행 (하단)
  'card-subtab-row': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF8',
  },

  // 서브탭 버튼
  'card-subtab-btn': {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EEF3FF',
  },

  // 서브탭 버튼 텍스트
  'card-subtab-text': {
    fontSize: 13,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },
});
