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
    paddingVertical: 60,
  },

  // 로그인 - 로고 컨테이너
  'login-logoContainer': {
    alignItems: 'center',
    marginBottom: 48,
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
    marginBottom: 20,
  },

  // 로그인 - 입력 컨테이너 - 입력
  'login-inputContainer-input': {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 입력 컨테이너 - 비밀번호 래퍼
  'login-inputContainer-passwordWrapper': {
    position: 'relative',
    marginBottom: 12,
  },

  // 로그인 - 입력 컨테이너 - 비밀번호 래퍼 - 입력
  'login-inputContainer-passwordWrapper-input': {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 입력 컨테이너 - 비밀번호 래퍼 - 아이콘 버튼
  'login-inputContainer-passwordWrapper-iconButton': {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  // ⭐ 로그인 - 입력 컨테이너 - 에러 메시지
  'login-inputContainer-errorMessage': {
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: -8,
    marginBottom: 12,
  },

  // ⭐ 로그인 - 입력 컨테이너 - 에러 메시지 - 텍스트
  'login-inputContainer-errorMessage-text': {
    color: '#C62828',
    fontSize: 13,
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 입력 컨테이너 - 옵션 행
  'login-inputContainer-optionsRow': {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  // 로그인 - 입력 컨테이너 - 옵션 행 - 비밀번호 찾기
  'login-inputContainer-optionsRow-findPassword': {
    fontSize: 14,
    color: '#999',
    paddingLeft: 5,
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 입력 컨테이너 - 옵션 행 - 자동 로그인
  'login-inputContainer-optionsRow-autoLogin': {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // 로그인 - 입력 컨테이너 - 옵션 행 - 자동 로그인 - 체크박스
  'login-inputContainer-optionsRow-autoLogin-checkbox': {
    width: 15,
    height: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDE1E6',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 로그인 - 입력 컨테이너 - 옵션 행 - 자동 로그인 - 체크박스 (체크됨)
  'login-inputContainer-optionsRow-autoLogin-checkbox-checked': {
    borderColor: '#588DFF',
    backgroundColor: '#588DFF',
  },

  // 로그인 - 입력 컨테이너 - 옵션 행 - 자동 로그인 - 체크박스 - 체크
  'login-inputContainer-optionsRow-autoLogin-checkbox-check': {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // 로그인 - 입력 컨테이너 - 옵션 행 - 자동 로그인 - 텍스트
  'login-inputContainer-optionsRow-autoLogin-text': {
    fontSize: 13,
    color: '#333',
    fontFamily: 'PretendardVariable',
  },

  // 로그인 - 입력 컨테이너 - 로그인 버튼 (항상 활성화)
  'login-inputContainer-loginButton': {
    backgroundColor: '#588DFF',
    borderRadius: 12,
    paddingVertical: 18,
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

  // 로그인 - 회원가입 컨테이너
  'login-signupContainer': {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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

  // 로그인 - 구분선 컨테이너
  'login-dividerContainer': {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
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
    marginBottom: 20,
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
    height: 55,
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
    height: 55,
  },
});
