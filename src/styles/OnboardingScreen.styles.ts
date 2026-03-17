import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const onboardingStyles = StyleSheet.create({
  // 온보딩 - 메인 컨테이너
  'onboarding-container': {
    flex: 1,
  },

  // 온보딩 - 스킵 버튼
  'onboarding-skipButton': {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },

  // 온보딩 - 스킵 버튼 - 텍스트
  'onboarding-skipButton-text': {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // 온보딩 - 슬라이드
  'onboarding-slide': {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },

  // 온보딩 - 슬라이드 - 이미지
  'onboarding-slide-image': {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.35,
    marginBottom: 60,
  },

  // 온보딩 - 슬라이드 - 제목
  'onboarding-slide-title': {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },

  // 온보딩 - 슬라이드 - 설명
  'onboarding-slide-description': {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  // 온보딩 - 하단 컨테이너
  'onboarding-bottomContainer': {
    paddingBottom: 60,
    paddingHorizontal: 30,
  },

  // 온보딩 - 하단 컨테이너 - 점 컨테이너
  'onboarding-bottomContainer-dotsContainer': {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },

  // 온보딩 - 하단 컨테이너 - 점 컨테이너 - 점
  'onboarding-bottomContainer-dotsContainer-dot': {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#588DFF',
    marginHorizontal: 4,
  },

  // 온보딩 - 하단 컨테이너 - 다음 버튼
  'onboarding-bottomContainer-nextButton': {
    backgroundColor: '#588DFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#588DFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // 온보딩 - 하단 컨테이너 - 다음 버튼 - 텍스트
  'onboarding-bottomContainer-nextButton-text': {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
