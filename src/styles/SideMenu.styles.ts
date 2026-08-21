import { StyleSheet } from 'react-native';

export const sideMenuStyles = StyleSheet.create({
  // 최상위 오버레이
  'sideMenu-overlay': {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },

  'sideMenu-backdrop': {
    flex: 1,
  },

  // width는 컴포넌트에서 인라인으로 덮어씀 (창 크기에 따라 실시간 계산)
  'sideMenu-panel': {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 14,
  },

  'sideMenu-safeArea': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 파란 헤더 영역
  'sideMenu-headerBg': {
    backgroundColor: '#588DFF',
    borderTopLeftRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },

  'sideMenu-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 11,
    paddingBottom: 9,
  },

  'sideMenu-header-logo': {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Paprika',
    textAlign: 'center'
  },

  'sideMenu-header-subtitle': {
    fontSize: 10,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: 3,
    opacity: 0.85,
  },

  'sideMenu-header-btn': {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 프로필 섹션
  'sideMenu-profileSection': {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },

  'sideMenu-profile-avatar': {
    width: 61,
    height: 61,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
    marginTop: -30,
    marginBottom: 11,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#588DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  'sideMenu-profile-nameRow': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
    marginTop: 12,
  },

  'sideMenu-profile-name': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  // 스토리지
  'sideMenu-storage': {
    gap: 7,
  },

  'sideMenu-storage-barWrapper': {
    height: 16,
    justifyContent: 'center',
  },

  'sideMenu-storage-barBg': {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8EEFF',
    overflow: 'hidden',
  },

  'sideMenu-storage-barFill': {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#588DFF',
  },

  'sideMenu-storage-barThumb': {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#588DFF',
    top: 2,
    shadowColor: '#588DFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },

  'sideMenu-storage-textRow': {
    flexDirection: 'row',
    alignItems: 'center',
  },

  'sideMenu-storage-usedText': {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  'sideMenu-storage-totalText': {
    fontSize: 11,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    flex: 1,
    marginLeft: 3,
  },

  'sideMenu-storage-detailBtn': {
    paddingVertical: 2,
    paddingHorizontal: 5,
  },

  'sideMenu-storage-detailText': {
    fontSize: 11,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 스크롤 바디
  'sideMenu-scroll': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  'sideMenu-scrollContent': {
    paddingBottom: 14,
  },

  // 구분선
  'sideMenu-divider': {
    height: 1,
    backgroundColor: '#E2EAFF',
    marginHorizontal: 14,
  },

  // 공통 섹션
  'sideMenu-section': {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 12,
  },

  'sideMenu-section-header': {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  'sideMenu-section-title': {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A4A5C',
    fontFamily: 'PretendardVariable',
    flex: 1,
  },

  'sideMenu-section-count': {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
    backgroundColor: '#588DFF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 7,
    overflow: 'hidden',
  },

  'sideMenu-section-size': {
    fontSize: 11,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  'sideMenu-empty-text': {
    fontSize: 12,
    color: '#B8C8D8',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    paddingVertical: 14,
  },

  // 북마크 아이템
  'sideMenu-bookmark-card': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    marginBottom: 6,
    overflow: 'hidden',
    shadowColor: '#3A5FBF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },

  'sideMenu-bookmark-accent': {
    width: 4,
    alignSelf: 'stretch',
  },

  'sideMenu-bookmark-label': {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 11,
    fontSize: 12,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  'sideMenu-bookmark-badge': {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 9,
  },

  'sideMenu-bookmark-badgeText': {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },

  // 준비 중 박스
  'sideMenu-placeholder-box': {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2EAFF',
  },

  'sideMenu-placeholder-text': {
    fontSize: 12,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  'sideMenu-placeholder-subText': {
    fontSize: 10,
    color: '#B8C8D8',
    fontFamily: 'PretendardVariable',
  },

  // 미디어 행
  'sideMenu-mediaRow': {
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 3,
  },

  'sideMenu-mediaThumbnail': {
    width: 63,
    height: 63,
    borderRadius: 9,
    backgroundColor: '#F0F5FF',
  },

  'sideMenu-videoThumbnail': {
    position: 'relative',
  },

  'sideMenu-videoPlayIcon': {
    position: 'absolute',
    width: 63,
    height: 63,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 9,
  },

  'sideMenu-videoPlayText': {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },

  // 파일 목록
  'sideMenu-filesList': {
    gap: 7,
  },

  'sideMenu-fileItem': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8EEF8',
  },

  'sideMenu-fileIconContainer': {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  'sideMenu-fileName': {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 14,
  },

  // 더보기 버튼
  'sideMenu-moreButton': {
    paddingVertical: 11,
    paddingHorizontal: 11,
    marginTop: 7,
    backgroundColor: '#F0F5FF',
    borderRadius: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C0D0F0',
    borderStyle: 'dashed',
  },

  'sideMenu-moreButtonText': {
    fontSize: 12,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 링크 프리뷰
  'sideMenu-linkPreview': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    borderRadius: 9,
    padding: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2EAFF',
    marginBottom: 5,
  },

  'sideMenu-linkPreviewImage': {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#F0F5FF',
    flexShrink: 0,
  },

  'sideMenu-linkPreviewContent': {
    flex: 1,
    gap: 2,
  },

  'sideMenu-linkTitle': {
    fontSize: 10,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 12,
    fontWeight: '500',
  },

  'sideMenu-linkUrl': {
    fontSize: 8,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    lineHeight: 11,
  },
});