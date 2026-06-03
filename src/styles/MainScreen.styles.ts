import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const mainStyles = StyleSheet.create({
  // 메인 - 최상위 SafeArea
  'main-safeArea': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  'main-topSafeAreaFill': {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: '#EEF3FF',
  },

  // 메인 - 헤더
  'main-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 4,
    minHeight: 48,
    backgroundColor: '#EEF3FF',
  },

  // 메인 - 헤더 - 프로필 버튼
  'main-header-profileButton': {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D6E4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // 메인 - 헤더 - 프로필 버튼 - 이미지
  'main-header-profileButton-image': {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },

  // 메인 - 헤더 - 타이틀 래퍼
  'main-header-titleWrapper': {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 메인 - 헤더 - 타이틀
  'main-header-title': {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
    color: '#588DFF',
  },

  // 메인 - 헤더 - 좌측 버튼 컨테이너
  'main-header-leftButtons': {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-start',
    zIndex: 1,
  },

  // 메인 - 헤더 - 우측 버튼 컨테이너
  'main-header-rightButtons': {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-end',
    zIndex: 1,
  },

  // 메인 - 헤더 - 아이콘 버튼
  'main-header-iconButton': {
    padding: 4,
  },

  // 메인 - 헤더 - 접기/펼치기 텍스트
  'main-header-expandText': {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // 메인 - 검색 입력창
  'main-inputBar-input': {
    flex: 1,
    backgroundColor: '#F0F4FF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 16,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    maxHeight: 100,
    minHeight: 40,
  },

  // 메인 - 바디
  'main-body': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 메인 - 컨텐츠 영역
  'main-content': {
    flex: 1,
    backgroundColor: '#EEF3FF',
    overflow: 'hidden',
  },

  // 메인 - 워터마크 컨테이너
  'main-watermark': {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
    elevation: 0,
  },

  // 메인 - 워터마크 이미지
  'main-watermark-image': {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    opacity: 0.07,
    resizeMode: 'contain',
  },

  // 메인 - FlatList
  'main-list': {
    zIndex: 1,
    elevation: 1,
  },

  // 메인 - FlatList 콘텐츠
  'main-listContent': {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },

  // 메인 - 입력바 래퍼
  'main-inputBarWrapper': {
    backgroundColor: '#FFFFFF',
    zIndex: 2,
    elevation: 2,
  },

  // 메인 - 입력바 래퍼 - 키보드 표시 중
  'main-inputBarWrapper-keyboardVisible': {
    paddingBottom: 6,
  },
});
