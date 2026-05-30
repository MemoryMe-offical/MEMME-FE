import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 1.3; // 화면 너비의 절반

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
    width: CARD_WIDTH,
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
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  // 헤더 제목 터치 영역
  'card-header-title-touch': {
    flex: 1,
    paddingVertical: 4,
  },

  // 헤더 제목 텍스트
  'card-header-title': {
    fontSize: 12,
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
    marginTop: 0,
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#cfdfff',
    overflow: 'hidden',
  },

  // 섹션 구분선
  'card-section-divider': {
    height: 1,
    backgroundColor: '#E4ECFF',
    marginHorizontal: 14,
  },

  // 섹션 행
  'card-section-row': {
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 'auto',
  },

  // 섹션 레이블
  'card-section-label': {
    fontSize: 10,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    marginBottom: 6,
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  // 본문 텍스트
  'card-content-text': {
    fontSize: 11,
    color: '#333333',
    fontFamily: 'PretendardVariable',
    lineHeight: 18,
  },

  // 빈 본문 텍스트
  'card-empty-content-text': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    lineHeight: 18,
  },

  // 접힌 상태 노트 제목 행
  'card-collapsed-subtitle-row': {
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  'card-collapsed-subtitle-text': {
    fontSize: 13,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 노트 카드 래퍼
  'note-card-wrapper': {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    marginHorizontal: 0,
    marginBottom: 8,
    overflow: 'hidden',
  },

  // 노트 아코디언 헤더
  'sub-accordion-header': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F7FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECFF',
  },

  'sub-accordion-title': {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  'sub-accordion-divider': {
    height: 1.5,
    backgroundColor: '#B8CCFF',
    marginHorizontal: 0,
  },

  // 빈 노트 상태
  'card-empty-notes': {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  'card-empty-notes-text': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    fontStyle: 'italic',
  },

  // 태그 칩 영역
  'card-tags-row': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },

  'card-tag-chip': {
    backgroundColor: '#E8EEFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  'card-tag-text': {
    fontSize: 10,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  // 더보기 버튼
  'more-notes-button': {
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },

  'more-notes-text': {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },

  // 첨부파일 컨테이너
  'card-attachments-container': {
    paddingVertical: 0,
    gap: 0,
    paddingHorizontal: 0,
  },

  // 이미지 미리보기
  'card-images-preview': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 0,
    marginTop: 0,
  },

  'card-image-thumbnail': {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
  },

  'card-image-thumbnail-pressed': {
    opacity: 0.7,
  },

  'card-image-more': {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  'card-image-more-pressed': {
    opacity: 0.7,
  },

  'card-image-more-text': {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },

  // 동영상 미리보기
  'card-videos-preview': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 0,
    marginTop: 0,
  },

  'card-video-thumbnail': {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  'card-video-thumbnail-pressed': {
    opacity: 0.7,
  },

  'card-video-thumbnail-placeholder': {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  'card-video-icon': {
    fontSize: 20,
  },

  'card-video-more': {
    fontSize: 12,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 0,
  },

  'video-player-container': {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  'video-play-icon': {
    fontSize: 48,
    color: '#FFFFFF',
  },

  'video-open-text': {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },

  // 링크 카드
  'card-link-card': {
    flexDirection: 'row',
    backgroundColor: '#F7FAFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    overflow: 'hidden',
    alignItems: 'center',
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    height: 52,
  },

  'card-link-image': {
    width: 52,
    height: 52,
  },

  'card-link-image-placeholder': {
    width: 52,
    height: 52,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  'card-link-info': {
    flex: 1,
    padding: 6,
    gap: 1,
  },

  'card-link-domain': {
    fontSize: 9,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },

  'card-link-title': {
    fontSize: 10,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 16,
  },

  'card-link-desc': {
    fontSize: 9,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 14,
  },

  // 링크 헤더
  'card-link-header': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  'card-link-count': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    lineHeight: 11,
    paddingTop: 6
  },

  // 링크 컨테이너
  'card-links-container': {
    gap: 8,
  },

  // 링크 미리보기
  'card-links-preview': {
    gap: 6,
    paddingHorizontal: 0,
    marginTop: 0,
  },

  'card-link-more': {
    fontSize: 11,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 16,
    paddingTop: 0,
  },

  // 파일 미리보기
  'card-files-preview': {
    gap: 8,
    paddingHorizontal: 0,
    marginTop: 0,
  },

  'card-file-item': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
    borderWidth: 0,
    gap: 6,
  },

  'card-file-icon': {
    fontSize: 12,
  },

  'card-file-name': {
    flex: 1,
    fontSize: 10,
    color: '#4A5568',
    fontFamily: 'PretendardVariable',
  },

  'card-file-more': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    paddingHorizontal: 16,
    paddingTop: 0,
  },

  // 더 많은 콘텐츠 배지
  'card-more-content-badge': {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF4E6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },

  'card-more-content-text': {
    fontSize: 9,
    color: '#FF9500',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },
});
