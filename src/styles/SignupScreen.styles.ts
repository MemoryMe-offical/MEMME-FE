import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const isIOS = Platform.OS === 'ios';
const isIPhoneX = isIOS && SCREEN_HEIGHT >= 812;

export const signupStyles = StyleSheet.create({
  // 회원가입 - 메인 컨테이너
  'signup-container': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 회원가입 - 헤더
  'signup-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // 회원가입 - 헤더 - 뒤로 버튼
  'signup-header-backButton': {
    width: 40,
  },

  // 회원가입 - 헤더 - 뒤로 버튼 - 텍스트
  'signup-header-backButton-text': {
    fontSize: 24,
    color: '#333',
  },

  // 회원가입 - 헤더 - 타이틀
  'signup-header-title': {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 헤더 - 플레이스홀더
  'signup-header-placeholder': {
    width: 40,
  },

  // 회원가입 - 바디
  'signup-body': {
    flex: 1,
  },

  // 회원가입 - 안내 섹션
  'signup-infoSection': {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  // 회원가입 - 안내 섹션 - 타이틀
  'signup-infoSection-title': {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 28,
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 안내 섹션 - 서브타이틀
  'signup-infoSection-subtitle': {
    fontSize: 15,
    color: '#999',
    lineHeight: 22,
    fontFamily: 'PretendardVariable',
    marginTop: 8,
  },

  // 회원가입 - 입력 컨테이너
  'signup-inputContainer': {
    paddingHorizontal: 24,
    marginBottom: 24,
    width: '100%',
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼
  'signup-inputContainer-inputWrapper': {
    marginBottom: 20,
    width: '100%',
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
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼 - 가로 정렬
  'signup-inputContainer-inputWrapper-row': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼 - 입력 (flex)
  'signup-inputContainer-inputWrapper-input-flex': {
    flex: 1,
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼 - 인증 버튼
  'signup-inputContainer-inputWrapper-verifyButton': {
    backgroundColor: '#588DFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼 - 인증 버튼 (비활성화)
  'signup-inputContainer-inputWrapper-verifyButton-disabled': {
    backgroundColor: '#DDE1E6',
  },

  // 회원가입 - 입력 컨테이너 - 입력 래퍼 - 인증 버튼 - 텍스트
  'signup-inputContainer-inputWrapper-verifyButton-text': {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 입력 컨테이너 - 인증 완료 메시지
  'signup-inputContainer-verifiedMessage': {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },

  // 회원가입 - 입력 컨테이너 - 인증 완료 메시지 - 텍스트
  'signup-inputContainer-verifiedMessage-text': {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },

  // 회원가입 - 입력 컨테이너 - 가입 버튼
  'signup-inputContainer-signupButton': {
    width: '100%',
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
    paddingHorizontal: 32,
    paddingBottom: isIPhoneX ? 34 : 20,
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