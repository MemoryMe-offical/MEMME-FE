import { StyleSheet } from 'react-native';

export const splashStyles = StyleSheet.create({
  // 스플래시 - 메인 컨테이너
  'splash-container': {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // 스플래시 - 로고 컨테이너
  'splash-logoContainer': {
    alignItems: 'center',
  },

  // 스플래시 - 로고 컨테이너 - 로고
  'splash-logoContainer-logo': {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  // 스플래시 - 로고 컨테이너 - 로고 - 텍스트
  'splash-logoContainer-logo-text': {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // 스플래시 - 로고 컨테이너 - 서브타이틀
  'splash-logoContainer-subtitle': {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
});