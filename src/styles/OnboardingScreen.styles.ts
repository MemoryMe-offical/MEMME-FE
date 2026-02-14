import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const onboardingStyles = StyleSheet.create({
  // 온보딩 - 메인 컨테이너
  'onboarding-container': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 온보딩 - 스킵 버튼
  'onboarding-skipButton': {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },

  // 온보딩 - 스킵 버튼 - 텍스트
  'onboarding-skipButton-text': {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },

  // 온보딩 - 슬라이드
  'onboarding-slide': {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  // 온보딩 - 슬라이드 - 이모지 컨테이너
  'onboarding-slide-emojiContainer': {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },

  // 온보딩 - 슬라이드 - 이모지 컨테이너 - 이모지
  'onboarding-slide-emojiContainer-emoji': {
    fontSize: 60,
  },

  // 온보딩 - 슬라이드 - 제목
  'onboarding-slide-title': {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },

  // 온보딩 - 슬라이드 - 설명
  'onboarding-slide-description': {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // 온보딩 - 하단 컨테이너
  'onboarding-bottomContainer': {
    paddingBottom: 50,
    paddingHorizontal: 20,
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
    backgroundColor: '#FF9500',
    marginHorizontal: 4,
  },

  // 온보딩 - 하단 컨테이너 - 다음 버튼
  'onboarding-bottomContainer-nextButton': {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  // 온보딩 - 하단 컨테이너 - 다음 버튼 - 텍스트
  'onboarding-bottomContainer-nextButton-text': {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});