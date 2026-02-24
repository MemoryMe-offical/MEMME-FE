import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  // 로그인 - 메인 컨테이너
  'login-container': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 로그인 - 스크롤 컨텐츠
  'login-scrollContent': {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // 로그인 - 로고 컨테이너
  'login-logoContainer': {
    alignItems: 'center',
    marginBottom: 48,
  },

  // 로그인 - 로고 컨테이너 - 로고 이미지
  'login-logoContainer-logoImage': {
    width: 100,
    height: 100,
    marginBottom: 20,
  },

  // 로그인 - 로고 컨테이너 - 타이틀
  'login-logoContainer-title': {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#588DFF',
    marginBottom: 8,
    fontFamily: 'Paprika',
  },

  // 로그인 - 로고 컨테이너 - 서브타이틀
  'login-logoContainer-subtitle': {
    fontSize: 15,
    color: '#666',
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 입력 컨테이너
  'login-inputContainer': {
    marginBottom: 24,
  },

  // 로그인 - 입력 컨테이너 - 입력
  'login-inputContainer-input': {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 입력 컨테이너 - 로그인 버튼
  'login-inputContainer-loginButton': {
    backgroundColor: '#588DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#588DFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // 로그인 - 입력 컨테이너 - 로그인 버튼 - 텍스트
  'login-inputContainer-loginButton-text': {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 구분선 컨테이너
  'login-dividerContainer': {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },

  // 로그인 - 구분선 컨테이너 - 라인
  'login-dividerContainer-line': {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },

  // 로그인 - 구분선 컨테이너 - 텍스트
  'login-dividerContainer-text': {
    marginHorizontal: 16,
    color: '#ADB5BD',
    fontSize: 14,
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 소셜 컨테이너
  'login-socialContainer': {
    marginBottom: 24,
    gap: 12,
  },

  // 로그인 - 소셜 컨테이너 - 카카오 버튼
  'login-socialContainer-kakaoButton': {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // 로그인 - 소셜 컨테이너 - 카카오 버튼 - 이미지
  'login-socialContainer-kakaoButton-image': {
    width: '100%',
    height: 55,  // 높이 고정
  },

  // 로그인 - 소셜 컨테이너 - 애플 버튼
  'login-socialContainer-appleButton': {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // 로그인 - 소셜 컨테이너 - 애플 버튼 - 이미지
  'login-socialContainer-appleButton-image': {
    width: '100%',
    height: 50,  // 높이 고정 (카카오와 동일)
  },


  // 로그인 - 회원가입 컨테이너
  'login-signupContainer': {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 로그인 - 회원가입 컨테이너 - 텍스트
  'login-signupContainer-text': {
    color: '#666',
    fontSize: 14,
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 회원가입 컨테이너 - 링크
  'login-signupContainer-link': {
    color: '#588DFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PretendardVariable',
  },
});