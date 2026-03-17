import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const mainStyles = StyleSheet.create({
  // 메인 - 최상위 SafeArea
  'main-safeArea': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 메인 - 헤더
  'main-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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

  // 메인 - 헤더 - 타이틀
  'main-header-title': {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  // 메인 - 헤더 - 우측 버튼 컨테이너
  'main-header-rightButtons': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // 메인 - 헤더 - 아이콘 버튼
  'main-header-iconButton': {
    padding: 4,
  },

  // 메인 - 바디 (KeyboardAvoidingView)
  'main-body': {
    flex: 1,
    backgroundColor: '#EEF3FF',
  },

  // 메인 - 컨텐츠 영역 (FlatList + 워터마크 wrapper)
  'main-content': {
    flex: 1,
  },

  // 메인 - 워터마크 컨테이너 (배경)
  'main-watermark': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 메인 - 워터마크 - 이미지
  'main-watermark-image': {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    opacity: 0.07,
    resizeMode: 'contain',
  },

  // 메인 - FlatList 콘텐츠
  'main-listContent': {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // 메인 - 입력 바
  'main-inputBar': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  // 메인 - 입력 바 - 플러스 버튼
  'main-inputBar-plusButton': {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 메인 - 입력 바 - 입력창
  'main-inputBar-input': {
    flex: 1,
    backgroundColor: '#F0F4FF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    maxHeight: 100,
  },

  // 메인 - 입력 바 - 전송 버튼
  'main-inputBar-sendButton': {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#588DFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

});

