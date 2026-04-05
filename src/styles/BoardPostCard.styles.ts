import { StyleSheet } from 'react-native';

export const boardPostCardStyles = StyleSheet.create({
  // 행 컨테이너
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

  // 카드 전체 래퍼 — 연한 파란 배경 (헤더 아래 바디 영역)
  'card-wrapper': {
    maxWidth: '85%',
    minWidth: 220,
    borderRadius: 16,
    backgroundColor: '#cfdfff',
    shadowColor: '#3A6FCC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },

  // 헤더 — 진한 파란 배경 + 흰색 텍스트/아이콘
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
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },

  // 헤더 우측 버튼 묶음
  'card-header-actions': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // 내부 흰색 카드
  'card-inner-card': {
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#f4f8ff',
    overflow: 'hidden',
  },

  // 내부 카드 서브아이템 제목 — 가운데 정렬
  'card-inner-title': {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2663ef',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
  },

  // 섹션 구분선
  'card-section-divider': {
    height: 1,
    backgroundColor: '#E8EAED',
  },

  // 섹션 행 (내용 / 사진 / 링크)
  'card-section-row': {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },

  // "내용" / "사진" / "링크" 섹션 레이블
  'card-section-label': {
    fontSize: 14,
    fontWeight: '700',
    color: '#2663ef',
    fontFamily: 'PretendardVariable',
    marginBottom: 6,
  },

  // 본문 텍스트
  'card-content-text': {
    fontSize: 13,
    color: '#333333',
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
  },

  // 자세히 버튼 행
  'card-detail-row': {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // 접힌 상태 서브아이템 제목 텍스트
  'card-collapsed-subtitle-text': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 아코디언 서브아이템 헤더 (제목 + 열기/닫기 아이콘)
  'sub-accordion-header': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // 아코디언 서브아이템 제목
  'sub-accordion-title': {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  // 아코디언 아이템 사이 구분선
  'sub-accordion-divider': {
    height: 1,
    backgroundColor: '#D0DAFA',
    marginHorizontal: 16,
  },

  // 서브탭 행 — 세로로 쌓인 전체 너비 버튼들
  'card-subtab-row': {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },

  // 서브탭 버튼 — 전체 너비, 흰색 배경
  'card-subtab-btn': {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  // 서브탭 버튼 텍스트
  'card-subtab-text': {
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  // 링크 바로가기 버튼
  'card-link-button': {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8D8FF',
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  'card-link-button-content': {
    flex: 1,
    marginRight: 10,
  },
  'card-link-button-title': {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    marginBottom: 2,
  },
  'card-link-button-url': {
    fontSize: 11,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },
  'card-link-button-action': {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    flexShrink: 0,
  },
});
