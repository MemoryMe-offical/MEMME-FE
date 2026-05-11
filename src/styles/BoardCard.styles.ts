import { StyleSheet } from 'react-native';

export const boardCardStyles = StyleSheet.create({
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

  // 카드 전체 래퍼
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

  // 섹션 구분선
  'card-section-divider': {
    height: 1,
    backgroundColor: '#E8EAED',
  },

  // 섹션 행
  'card-section-row': {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },

  // 섹션 레이블
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

  // 접힌 상태 노트 제목 행
  'card-collapsed-subtitle-row': {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  'card-collapsed-subtitle-text': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 노트 아코디언 헤더
  'sub-accordion-header': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  'sub-accordion-title': {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  'sub-accordion-divider': {
    height: 1,
    backgroundColor: '#D0DAFA',
    marginHorizontal: 16,
  },

  // 빈 노트 상태
  'card-empty-notes': {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  'card-empty-notes-text': {
    fontSize: 13,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    fontStyle: 'italic',
  },

  // 태그 칩 영역
  'card-tags-row': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },

  'card-tag-chip': {
    backgroundColor: '#E8EEFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  'card-tag-text': {
    fontSize: 12,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  // 더보기 버튼
  'more-notes-button': {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },

  'more-notes-text': {
    fontSize: 14,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
});
