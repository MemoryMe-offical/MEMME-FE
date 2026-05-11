import { Dimensions, StyleSheet } from 'react-native';

export const SIDE_MENU_WIDTH = Dimensions.get('window').width * 0.82;

export const sideMenuStyles = StyleSheet.create({
  // 최상위 오버레이
  'sideMenu-overlay': {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },

  'sideMenu-backdrop': {
    flex: 1,
  },

  'sideMenu-panel': {
    width: SIDE_MENU_WIDTH,
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
    paddingHorizontal: 16,
    paddingBottom: 50,
  },

  'sideMenu-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },

  'sideMenu-header-btn': {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 프로필 섹션
  'sideMenu-profileSection': {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEFF',
  },

  'sideMenu-profile-avatar': {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
    marginTop: -34,
    marginBottom: 12,
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
    gap: 8,
    marginBottom: 16,
  },

  'sideMenu-profile-name': {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  // 스토리지
  'sideMenu-storage': {
    gap: 8,
  },

  'sideMenu-storage-barWrapper': {
    height: 18,
    justifyContent: 'center',
  },

  'sideMenu-storage-barBg': {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8EEFF',
    overflow: 'hidden',
  },

  'sideMenu-storage-barFill': {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#588DFF',
  },

  'sideMenu-storage-barThumb': {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  'sideMenu-storage-totalText': {
    fontSize: 12,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    flex: 1,
    marginLeft: 4,
  },

  'sideMenu-storage-detailBtn': {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },

  'sideMenu-storage-detailText': {
    fontSize: 12,
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
    paddingBottom: 16,
  },

  // 구분선
  'sideMenu-divider': {
    height: 1,
    backgroundColor: '#E2EAFF',
    marginHorizontal: 16,
  },

  // 공통 섹션
  'sideMenu-section': {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
  },

  'sideMenu-section-header': {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  'sideMenu-section-title': {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A4A5C',
    fontFamily: 'PretendardVariable',
    flex: 1,
  },

  'sideMenu-section-count': {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
    backgroundColor: '#588DFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },

  'sideMenu-section-size': {
    fontSize: 12,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  'sideMenu-empty-text': {
    fontSize: 13,
    color: '#B8C8D8',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    paddingVertical: 16,
  },

  // 북마크 아이템
  'sideMenu-bookmark-card': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 7,
    overflow: 'hidden',
    shadowColor: '#3A5FBF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  'sideMenu-bookmark-accent': {
    width: 4,
    alignSelf: 'stretch',
  },

  'sideMenu-bookmark-label': {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  'sideMenu-bookmark-badge': {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 10,
  },

  'sideMenu-bookmark-badgeText': {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },

  // 준비 중 박스
  'sideMenu-placeholder-box': {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2EAFF',
  },

  'sideMenu-placeholder-text': {
    fontSize: 13,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    fontWeight: '500',
  },

  'sideMenu-placeholder-subText': {
    fontSize: 11,
    color: '#B8C8D8',
    fontFamily: 'PretendardVariable',
  },

  // 미디어 행
  'sideMenu-mediaRow': {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },

  'sideMenu-mediaThumbnail': {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F0F5FF',
  },

  'sideMenu-videoThumbnail': {
    position: 'relative',
  },

  'sideMenu-videoPlayIcon': {
    position: 'absolute',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
  },

  'sideMenu-videoPlayText': {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },

  // 파일 목록
  'sideMenu-filesList': {
    gap: 8,
  },

  'sideMenu-fileItem': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    borderRadius: 8,
    padding: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2EAFF',
  },

  'sideMenu-fileIcon': {
    fontSize: 14,
  },

  'sideMenu-fileName': {
    flex: 1,
    fontSize: 11,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 14,
  },

  // 더보기 버튼
  'sideMenu-moreButton': {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    backgroundColor: '#F0F5FF',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C0D0F0',
    borderStyle: 'dashed',
  },

  'sideMenu-moreButtonText': {
    fontSize: 13,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 링크 프리뷰
  'sideMenu-linkPreview': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    borderRadius: 10,
    padding: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2EAFF',
    marginBottom: 6,
  },

  'sideMenu-linkPreviewImage': {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#F0F5FF',
    flexShrink: 0,
  },

  'sideMenu-linkPreviewContent': {
    flex: 1,
    gap: 3,
  },

  'sideMenu-linkTitle': {
    fontSize: 11,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 14,
    fontWeight: '500',
  },

  'sideMenu-linkUrl': {
    fontSize: 9,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    lineHeight: 12,
  },
});