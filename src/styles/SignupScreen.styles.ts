import { StyleSheet } from 'react-native';

export const signupStyles = StyleSheet.create({
  // 회원가입 - 메인 컨테이너
  'signup-container': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 회원가입 - 스크롤 컨텐츠
  'signup-scrollContent': {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 60,
  },

  // 회원가입 - 헤더 컨테이너
  'signup-headerContainer': {
    marginBottom: 40,
  },

  // 회원가입 - 헤더 컨테이너 - 뒤로 버튼
  'signup-headerContainer-backButton': {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },

  // 회원가입 - 헤더 컨테이너 - 뒤로 버튼 - 텍스트
  'signup-headerContainer-backButton-text': {
    fontSize: 16,
    color: '#588DFF',
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 헤더 컨테이너 - 타이틀
  'signup-headerContainer-title': {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 헤더 컨테이너 - 서브타이틀
  'signup-headerContainer-subtitle': {
    fontSize: 16,
    color: '#666',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 입력 컨테이너
  'signup-inputContainer': {
    marginBottom: 24,
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼
  'signup-inputContainer-inputWrapper': {
    marginBottom: 20,
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼 - 라벨
  'signup-inputContainer-inputWrapper-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼 - 입력
  'signup-inputContainer-inputWrapper-input': {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 입력 컨테이너 - 가입 버튼
  'signup-inputContainer-signupButton': {
    backgroundColor: '#588DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#588DFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // 회원가입 - 입력 컨테이너 - 가입 버튼 - 텍스트
  'signup-inputContainer-signupButton-text': {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 약관 컨테이너
  'signup-termsContainer': {
    paddingHorizontal: 8,
  },

  // 회원가입 - 약관 컨테이너 - 텍스트
  'signup-termsContainer-text': {
    fontSize: 12,
    color: '#ADB5BD',
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 약관 컨테이너 - 텍스트 - 링크
  'signup-termsContainer-text-link': {
    color: '#588DFF',
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },
});