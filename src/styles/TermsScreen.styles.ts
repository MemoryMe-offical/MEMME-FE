import { StyleSheet, Platform, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const isIOS = Platform.OS === 'ios';
const isIPhoneX = isIOS && SCREEN_HEIGHT >= 812;

// SafeAreaView 사용 시 자동으로 처리되므로 추가 패딩 불필요
const BOTTOM_PADDING = 0;

export const termsStyles = StyleSheet.create({
  // 약관 - 메인 컨테이너
  'terms-container': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 약관 - 헤더
  'terms-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // 약관 - 헤더 - 뒤로 버튼
  'terms-header-backButton': {
    width: 40,
  },

  // 약관 - 헤더 - 뒤로 버튼 - 텍스트
  'terms-header-backButton-text': {
    fontSize: 24,
    color: '#333',
  },

  // 약관 - 헤더 - 타이틀
  'terms-header-title': {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 헤더 - 플레이스홀더
  'terms-header-placeholder': {
    width: 40,
  },

  // 약관 - 스크롤뷰
  'terms-scrollView': {
    flex: 1,
  },

  // 약관 - 스크롤뷰 컨텐츠 컨테이너 ⭐ 추가
  'terms-scrollView-content': {
    paddingBottom: 100, // 하단 버튼 높이만큼 여유 공간
  },

  // 약관 - 안내 섹션
  'terms-infoSection': {
    padding: 24,
  },

  // 약관 - 안내 섹션 - 타이틀
  'terms-infoSection-title': {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 34,
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 전체 동의 버튼
  'terms-allCheckButton': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 24,
    borderRadius: 12,
  },

  // 약관 - 전체 동의 버튼 - 체크박스
  'terms-allCheckButton-checkbox': {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#588DFF',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 약관 - 전체 동의 버튼 - 체크박스 - 체크
  'terms-allCheckButton-checkbox-check': {
    fontSize: 16,
    color: '#588DFF',
    fontWeight: 'bold',
  },

  // 약관 - 전체 동의 버튼 - 텍스트
  'terms-allCheckButton-text': {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 구분선
  'terms-divider': {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
    marginHorizontal: 24,
  },

  // 약관 - 항목 컨테이너
  'terms-itemsContainer': {
    paddingHorizontal: 24,
    gap: 16,
  },

  // 약관 - 항목
  'terms-item': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  // 약관 - 항목 - 체크 섹션
  'terms-item-checkSection': {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // 약관 - 항목 - 체크 섹션 - 체크박스
  'terms-item-checkSection-checkbox': {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDE1E6',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 약관 - 항목 - 체크 섹션 - 체크박스 - 체크
  'terms-item-checkSection-checkbox-check': {
    fontSize: 14,
    color: '#588DFF',
    fontWeight: 'bold',
  },

  // 약관 - 항목 - 체크 섹션 - 텍스트
  'terms-item-checkSection-text': {
    fontSize: 15,
    color: '#333',
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 항목 - 상세 버튼
  'terms-item-detailButton': {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 하단 섹션 ⭐ 수정 (position: absolute)
  'terms-bottomSection': {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: isIPhoneX ? 34 : 20, // iPhone X 홈 인디케이터
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  // 약관 - 하단 섹션 - 다음 버튼
  'terms-bottomSection-nextButton': {
    backgroundColor: '#588DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },

  // 약관 - 하단 섹션 - 다음 버튼 (비활성화)
  'terms-bottomSection-nextButton-disabled': {
    backgroundColor: '#DDE1E6',
  },

  // 약관 - 하단 섹션 - 다음 버튼 - 텍스트
  'terms-bottomSection-nextButton-text': {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 모달
  'terms-modal': {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 약관 - 모달 - 헤더
  'terms-modal-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  // 약관 - 모달 - 헤더 - 타이틀
  'terms-modal-header-title': {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 모달 - 헤더 - 닫기 버튼
  'terms-modal-header-closeButton': {
    fontSize: 24,
    color: '#999',
  },

  // 약관 - 모달 - 컨텐츠
  'terms-modal-content': {
    flex: 1,
    padding: 20,
  },

  // 약관 - 모달 - 컨텐츠 - 텍스트
  'terms-modal-content-text': {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'PretendardVariable',
  },

  // 약관 - 모달 - 확인 버튼 섹션 ⭐ 추가
  'terms-modal-confirmButtonSection': {
    padding: 20,
    paddingBottom: isIPhoneX ? 34 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  // 약관 - 모달 - 확인 버튼
  'terms-modal-confirmButton': {
    backgroundColor: '#588DFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  // 약관 - 모달 - 확인 버튼 - 텍스트
  'terms-modal-confirmButton-text': {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PretendardVariable',
  },
});