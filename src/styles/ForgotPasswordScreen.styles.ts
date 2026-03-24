import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const isIOS = Platform.OS === 'ios';
const isIPhoneX = isIOS && SCREEN_HEIGHT >= 812;

export const forgotPasswordStyles = StyleSheet.create({
  // 비밀번호 찾기 - 메인 컨테이너
  'forgot-container': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 비밀번호 찾기 - 헤더
  'forgot-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // 비밀번호 찾기 - 헤더 - 뒤로 버튼
  'forgot-header-backButton': {
    width: 40,
  },

  // 비밀번호 찾기 - 헤더 - 뒤로 버튼 - 텍스트
  'forgot-header-backButton-text': {
    fontSize: 24,
    color: '#333',
  },

  // 비밀번호 찾기 - 헤더 - 타이틀
  'forgot-header-title': {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'PretendardVariable',
  },

  // 비밀번호 찾기 - 헤더 - 플레이스홀더
  'forgot-header-placeholder': {
    width: 40,
  },

  // 비밀번호 찾기 - 바디
  'forgot-body': {
    flex: 1,
  },

  // 비밀번호 찾기 - 안내 섹션
  'forgot-infoSection': {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  // 비밀번호 찾기 - 안내 섹션 - 타이틀
  'forgot-infoSection-title': {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 28,
    fontFamily: 'PretendardVariable',
    marginBottom: 12,
  },

  // 비밀번호 찾기 - 안내 섹션 - 서브타이틀
  'forgot-infoSection-subtitle': {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
    fontFamily: 'PretendardVariable',
  },

  // 비밀번호 찾기 - 입력 컨테이너
  'forgot-inputContainer': {
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  // 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼
  'forgot-inputContainer-inputWrapper': {
    marginBottom: 20,
    width: '100%',
  },

  // 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼 - 라벨
  'forgot-inputContainer-inputWrapper-label': {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'PretendardVariable',
  },

  // 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼 - 입력
  'forgot-inputContainer-inputWrapper-input': {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontFamily: 'PretendardVariable',
  },

  // ⭐ 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼 - 가로 정렬
  'forgot-inputContainer-inputWrapper-row': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // ⭐ 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼 - 입력 (flex)
  'forgot-inputContainer-inputWrapper-input-flex': {
    flex: 1,
  },

  // ⭐ 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼 - 인증 버튼
  'forgot-inputContainer-inputWrapper-verifyButton': {
    backgroundColor: '#588DFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ⭐ 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼 - 인증 버튼 (비활성화)
  'forgot-inputContainer-inputWrapper-verifyButton-disabled': {
    backgroundColor: '#DDE1E6',
  },

  // ⭐ 비밀번호 찾기 - 입력 컨테이너 - 입력 래퍼 - 인증 버튼 - 텍스트
  'forgot-inputContainer-inputWrapper-verifyButton-text': {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'PretendardVariable',
  },

  // 비밀번호 찾기 - 입력 컨테이너 - 전송 버튼
  'forgot-inputContainer-sendButton': {
    width: '100%',
    backgroundColor: '#588DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#588DFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // 비밀번호 찾기 - 입력 컨테이너 - 전송 버튼 - 텍스트
  'forgot-inputContainer-sendButton-text': {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PretendardVariable',
  },

  // 비밀번호 찾기 - 도움말 컨테이너
  'forgot-helpContainer': {
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  // 비밀번호 찾기 - 도움말 컨테이너 - 텍스트
  'forgot-helpContainer-text': {
    fontSize: 13,
    color: '#ADB5BD',
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'PretendardVariable',
  },
});