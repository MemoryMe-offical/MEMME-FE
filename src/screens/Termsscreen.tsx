import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { termsStyles as styles } from '../styles/TermsScreen.styles';
import { useAlert } from '../context/AlertContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TermsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { showAlert } = useAlert();
  const [allChecked, setAllChecked] = useState(false);
  const [terms, setTerms] = useState({
    service: false,
    privacy: false,
    marketing: false,
    age: false,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [modalReady, setModalReady] = useState(false); // ⭐ 추가

  // ⭐ 모달이 열릴 때 레이아웃 준비
  useEffect(() => {
    if (modalVisible) {
      setModalReady(false);
      // 다음 프레임에서 레이아웃 활성화
      requestAnimationFrame(() => {
        setModalReady(true);
      });
    }
  }, [modalVisible]);

  const handleAllCheck = () => {
    const newValue = !allChecked;
    setAllChecked(newValue);
    setTerms({
      service: newValue,
      privacy: newValue,
      marketing: newValue,
      age: newValue,
    });
  };

  const handleTermCheck = (key: keyof typeof terms) => {
    const newTerms = { ...terms, [key]: !terms[key] };
    setTerms(newTerms);
    
    const allTermsChecked = Object.values(newTerms).every(v => v);
    setAllChecked(allTermsChecked);
  };

  const showTermDetail = (type: 'service' | 'privacy' | 'marketing') => {
    let title = '';
    let content = '';

    switch (type) {
      case 'service':
        title = '서비스 이용약관';
        content = SERVICE_TERMS;
        break;
      case 'privacy':
        title = '개인정보 처리방침';
        content = PRIVACY_POLICY;
        break;
      case 'marketing':
        title = '마케팅 정보 수신 동의';
        content = MARKETING_TERMS;
        break;
    }

    setModalContent({ title, content });
    setModalVisible(true);
  };

  const handleNext = () => {
    if (!terms.service || !terms.privacy || !terms.age) {
      showAlert({ title: '알림', message: '필수 약관에 모두 동의해주세요.' });
      return;
    }
    navigation.navigate('Signup');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles['terms-container']} edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View style={styles['terms-header']}>
        <TouchableOpacity
          style={styles['terms-header-backButton']}
          onPress={handleBack}>
          <Text style={styles['terms-header-backButton-text']}>←</Text>
        </TouchableOpacity>
        <Text style={styles['terms-header-title']}>약관 동의</Text>
        <View style={styles['terms-header-placeholder']} />
      </View>

      <ScrollView
        style={styles['terms-scrollView']}
        contentContainerStyle={styles['terms-scrollView-content']}
        showsVerticalScrollIndicator={false}>
        
        {/* 안내 문구 */}
        <View style={styles['terms-infoSection']}>
          <Text style={styles['terms-infoSection-title']}>
            Memme 서비스 이용을 위해{'\n'}약관 동의가 필요합니다
          </Text>
        </View>

        {/* 전체 동의 */}
        <TouchableOpacity
          style={styles['terms-allCheckButton']}
          onPress={handleAllCheck}>
          <View style={styles['terms-allCheckButton-checkbox']}>
            {allChecked && (
              <Text style={styles['terms-allCheckButton-checkbox-check']}>✓</Text>
            )}
          </View>
          <Text style={styles['terms-allCheckButton-text']}>
            전체 동의하기
          </Text>
        </TouchableOpacity>

        <View style={styles['terms-divider']} />

        {/* 개별 약관 */}
        <View style={styles['terms-itemsContainer']}>
          {/* 서비스 이용약관 */}
          <View style={styles['terms-item']}>
            <TouchableOpacity
              style={styles['terms-item-checkSection']}
              onPress={() => handleTermCheck('service')}>
              <View style={styles['terms-item-checkSection-checkbox']}>
                {terms.service && (
                  <Text style={styles['terms-item-checkSection-checkbox-check']}>✓</Text>
                )}
              </View>
              <Text style={styles['terms-item-checkSection-text']}>
                [필수] 서비스 이용약관
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showTermDetail('service')}>
              <Text style={styles['terms-item-detailButton']}>보기</Text>
            </TouchableOpacity>
          </View>

          {/* 개인정보 처리방침 */}
          <View style={styles['terms-item']}>
            <TouchableOpacity
              style={styles['terms-item-checkSection']}
              onPress={() => handleTermCheck('privacy')}>
              <View style={styles['terms-item-checkSection-checkbox']}>
                {terms.privacy && (
                  <Text style={styles['terms-item-checkSection-checkbox-check']}>✓</Text>
                )}
              </View>
              <Text style={styles['terms-item-checkSection-text']}>
                [필수] 개인정보 처리방침
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showTermDetail('privacy')}>
              <Text style={styles['terms-item-detailButton']}>보기</Text>
            </TouchableOpacity>
          </View>

          {/* 만 14세 이상 */}
          <View style={styles['terms-item']}>
            <TouchableOpacity
              style={styles['terms-item-checkSection']}
              onPress={() => handleTermCheck('age')}>
              <View style={styles['terms-item-checkSection-checkbox']}>
                {terms.age && (
                  <Text style={styles['terms-item-checkSection-checkbox-check']}>✓</Text>
                )}
              </View>
              <Text style={styles['terms-item-checkSection-text']}>
                [필수] 만 14세 이상입니다
              </Text>
            </TouchableOpacity>
          </View>

          {/* 마케팅 정보 수신 */}
          <View style={styles['terms-item']}>
            <TouchableOpacity
              style={styles['terms-item-checkSection']}
              onPress={() => handleTermCheck('marketing')}>
              <View style={styles['terms-item-checkSection-checkbox']}>
                {terms.marketing && (
                  <Text style={styles['terms-item-checkSection-checkbox-check']}>✓</Text>
                )}
              </View>
              <Text style={styles['terms-item-checkSection-text']}>
                [선택] 마케팅 정보 수신 동의
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showTermDetail('marketing')}>
              <Text style={styles['terms-item-detailButton']}>보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 다음 버튼 */}
      <View style={styles['terms-bottomSection']}>
        <TouchableOpacity
          style={[
            styles['terms-bottomSection-nextButton'],
            (!terms.service || !terms.privacy || !terms.age) &&
              styles['terms-bottomSection-nextButton-disabled'],
          ]}
          onPress={handleNext}
          disabled={!terms.service || !terms.privacy || !terms.age}>
          <Text style={styles['terms-bottomSection-nextButton-text']}>다음</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐ 약관 상세 모달 - 수정 */}
      {/* 약관 상세 모달 */}
<Modal
  animationType="slide"
  transparent={false}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
  onShow={() => {
    // ⭐ 모달이 완전히 표시된 후 강제 리렌더
    setTimeout(() => {
      setModalContent({ ...modalContent });
    }, 100);
  }}>
  <View style={styles['terms-modal']}>
    {/* ⭐ SafeAreaView 제거, 직접 패딩 */}
    <View style={styles['terms-modal-header-safe']}>
      <View style={styles['terms-modal-header']}>
        <Text style={styles['terms-modal-header-title']}>
          {modalContent.title}
        </Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(false)}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <Text style={styles['terms-modal-header-closeButton']}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
    
    <ScrollView style={styles['terms-modal-content']}>
      <Text style={styles['terms-modal-content-text']}>
        {modalContent.content}
      </Text>
    </ScrollView>
    
    <View style={styles['terms-modal-confirmButtonSection']}>
      <TouchableOpacity
        style={styles['terms-modal-confirmButton']}
        onPress={() => setModalVisible(false)}>
        <Text style={styles['terms-modal-confirmButton-text']}>확인</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};


// 실제 약관 내용
const SERVICE_TERMS = `제1조 (목적)
본 약관은 Memme(이하 "운영팀")가 제공하는 AI 기반 개인 메모 및 자료 관리 서비스(이하 "서비스")의 이용과 관련하여 운영팀과 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 운영팀이 제공하는 채팅 형태의 메모 저장, AI 기반 링크 요약, 카테고리 관리, 자료실 기능 등을 포함한 모든 서비스를 의미합니다.
2. "이용자"란 본 약관에 따라 운영팀이 제공하는 서비스를 받는 회원을 말합니다.
3. "회원"이란 운영팀과 서비스 이용계약을 체결하고 운영팀이 제공하는 서비스를 이용하는 자를 말합니다.
4. "채팅"이란 텍스트, 링크, 파일, 사진, 동영상 등을 시간순으로 저장하는 메시지를 말합니다.
5. "게시물"이란 채팅을 더 자세히 정리한 형태의 콘텐츠로, 제목, 내용, 카테고리 등을 포함합니다.
6. "AI 요약"이란 운영팀이 제공하는 인공지능 기술을 활용하여 링크 또는 텍스트를 자동으로 요약하는 기능을 말합니다.

제3조 (약관의 게시와 개정)
1. 운영팀은 본 약관의 내용을 이용자가 쉽게 알 수 있도록 회원가입 전 약관 동의 화면에 게시합니다.
2. 운영팀은 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
3. 약관이 개정되는 경우 운영팀은 개정 내용, 적용일자 및 개정 사유를 명시하여 서비스 내 공지사항 또는 별도 안내를 통해 적용일 전부터 공지합니다.
4. 이용자에게 불리하거나 중요한 약관 변경의 경우 운영팀은 이용자가 명확히 알 수 있도록 별도로 안내하고, 필요한 경우 관련 법령에 따라 동의를 받습니다. 이용자는 개정 약관에 동의하지 않을 수 있으며, 이 경우 서비스 이용계약을 해지할 수 있습니다.

제4조 (서비스의 제공 및 변경)
1. 운영팀은 다음과 같은 서비스를 제공합니다.
   - 채팅 형태의 메모 저장 및 관리
   - AI 기반 링크 및 텍스트 자동 요약
   - 사용자 정의 카테고리 관리
   - 파일, 이미지, 동영상 등 미디어 자료실
   - 검색 및 필터링 기능
   - 외부 앱(YouTube, 블로그 등)으로부터의 공유 연동
   - 기타 운영팀이 정하는 부가 서비스
2. 운영팀은 서비스 개선, 운영상 필요 또는 관련 법령 준수를 위해 서비스의 내용을 변경할 수 있으며, 이용자에게 중대한 영향을 미치는 변경 사항은 사전에 공지합니다.

제5조 (서비스의 중단)
1. 운영팀은 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절, AI 서비스 장애 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
2. 운영팀은 제1항의 사유로 서비스 제공이 일시적으로 중단됨으로 인하여 이용자가 입은 손해에 대하여 배상하지 않습니다. 다만, 운영팀의 고의 또는 과실이 있는 경우에는 그러하지 아니합니다.

제6조 (회원가입)
1. 이용자는 운영팀이 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
2. 운영팀은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
   - 가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
   - 등록 내용에 허위, 기재누락, 오기가 있는 경우
   - 만 14세 미만인 경우
   - 기타 회원으로 등록하는 것이 운영팀의 기술상 현저히 지장이 있다고 판단되는 경우

제7조 (회원 탈퇴 및 자격 상실)
1. 회원은 운영팀에 언제든지 탈퇴를 요청할 수 있으며 운영팀은 즉시 회원탈퇴를 처리합니다.
2. 회원 탈퇴 시 회원이 작성한 채팅, 게시물, 파일 등은 관련 법령 및 개인정보 처리방침에 따라 보관이 필요한 정보를 제외하고 삭제되며, 삭제된 정보는 복구할 수 없습니다.
3. 회원이 다음 각 호의 사유에 해당하는 경우, 운영팀은 회원자격을 제한, 정지 또는 이용계약을 해지할 수 있습니다.
   - 가입 신청 시에 허위 내용을 등록한 경우
   - 다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 경우
   - 서비스를 이용하여 법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우
   - AI 서비스를 부정한 목적으로 악용하는 경우
4. 운영팀은 회원자격 제한, 정지 또는 이용계약 해지 시 그 사유를 회원에게 안내하며, 회원은 운영팀에 이의를 제기할 수 있습니다.

제8조 (개인정보보호)
운영팀은 이용자의 개인정보 수집 시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다. 자세한 내용은 개인정보 처리방침을 참고하시기 바랍니다.

제9조 (운영팀의 의무)
1. 운영팀은 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 본 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.
2. 운영팀은 이용자가 안전하게 서비스를 이용할 수 있도록 개인정보(신용정보 포함) 보호를 위해 보안시스템을 갖추어야 하며 개인정보처리방침을 공시하고 준수합니다.

제10조 (회원의 의무)
1. 회원은 다음 행위를 하여서는 안 됩니다.
   - 신청 또는 변경 시 허위 내용의 등록
   - 타인의 정보 도용
   - 운영팀이 게시한 정보의 변경
   - 운영팀 및 기타 제3자의 저작권 등 지적재산권에 대한 침해
   - 운영팀 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
   - 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위
   - AI 요약 기능을 상업적 목적으로 무단 사용하는 행위
   - 서비스를 통해 얻은 정보를 운영팀의 사전 승낙 없이 복제, 유통, 전송하거나 상업적으로 이용하는 행위

제11조 (저작권 및 AI 생성 콘텐츠)
1. 운영팀이 작성한 저작물에 대한 저작권 기타 지적재산권은 운영팀에 귀속합니다.
2. 이용자가 서비스에 게시한 채팅, 게시물 등의 저작권은 해당 이용자에게 귀속됩니다.
3. 이용자가 입력한 텍스트, 링크 및 파일과 AI 요약 결과는 이용자가 개인적 용도로 활용할 수 있습니다. 다만, 이용자는 해당 콘텐츠가 제3자의 권리를 침해하지 않도록 확인할 책임이 있습니다.
4. 운영팀은 서비스 제공, 오류 대응, 보안 관리 및 품질 개선을 위해 필요한 범위에서 이용자가 서비스에 입력하거나 생성한 콘텐츠를 처리할 수 있으며, 개인정보 처리와 관련된 사항은 개인정보 처리방침을 따릅니다.
5. 이용자는 서비스를 통해 제공되는 운영팀 또는 제3자의 저작물을 권리자의 사전 승낙 없이 임의로 복제, 가공, 판매하거나 상업적으로 이용할 수 없습니다.

제12조 (면책조항)
1. 운영팀은 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
2. 운영팀은 AI 요약의 정확성을 보장하지 않으며, 요약된 내용에 오류가 있을 수 있습니다. 중요한 정보는 반드시 원본을 확인하시기 바랍니다.
3. 운영팀은 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
4. 운영팀은 이용자가 서비스를 통해 게재 또는 전송한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여 책임을 지지 않습니다.

부칙
본 약관은 앱 서비스 출시일부터 적용됩니다.`;

const PRIVACY_POLICY = `개인정보 처리방침

Memme(이하 "운영팀")는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령을 준수하기 위해 다음과 같이 개인정보 처리방침을 수립·공개합니다.

1. 개인정보의 수집 및 이용 목적
운영팀은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 아래 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 관련 법령에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.

가. 회원 가입 및 관리
- 회원 가입 의사 확인
- 회원제 서비스 제공에 따른 본인 식별 및 인증
- 회원자격 유지 및 관리
- 서비스 부정이용 방지
- 각종 고지 및 통지

나. 소셜 로그인 제공
- 카카오 및 애플 계정을 통한 간편 로그인 제공
- 소셜 로그인 이용자 식별
- 서비스 계정 연동 및 관리

다. 서비스 제공
- AI 기반 링크 및 텍스트 자동 요약 서비스 제공
- 채팅 형태의 메모 저장 및 관리
- 카테고리별 정보 분류 및 검색
- 미디어 자료실 제공
- 외부 앱 공유 연동
- 맞춤형 서비스 제공

라. 서비스 개선 및 안정적 운영
- 서비스 이용 기록 분석
- 오류 확인 및 서비스 품질 개선
- 부정 이용 방지 및 보안 관리

2. 수집하는 개인정보 항목
운영팀은 회원가입 및 서비스 이용 과정에서 아래와 같은 개인정보를 수집할 수 있습니다.

가. 일반 회원가입 시 필수 수집 항목
- 이메일
- 비밀번호
- 이름

나. 소셜 로그인 이용 시 수집 항목
카카오 또는 애플 소셜 로그인을 이용하는 경우, 운영팀은 해당 소셜 로그인 제공자로부터 아래 정보를 제공받을 수 있습니다.

- 카카오 로그인: 카카오 계정 식별값, 이메일, 이름 또는 닉네임
- 애플 로그인: 애플 계정 식별값, 이메일, 이름

단, 소셜 로그인 제공자로부터 실제 제공받는 정보는 이용자가 해당 제공자에게 동의한 항목 및 제공자의 정책에 따라 달라질 수 있습니다.

다. 서비스 이용 과정에서 자동으로 생성되어 수집될 수 있는 정보
- IP 주소
- 접속 로그
- 서비스 이용 기록
- 오류 로그
- 불량 이용 기록

라. 서비스 이용 과정에서 이용자가 직접 입력하거나 업로드하는 정보
- 채팅 및 메모 내용
- 게시물 내용
- 카테고리 설정 정보
- 파일, 이미지, 동영상 등 이용자가 업로드한 미디어
- 외부 앱 공유를 통해 저장한 링크 또는 텍스트

마. AI 요약 서비스 이용 시 수집되는 정보
- 요약을 요청한 링크 URL
- 이용자가 입력한 텍스트 내용
- AI 요약 결과
- 요약 생성 시각 및 진행 상태

3. 개인정보의 보유 및 이용기간
운영팀은 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 개인정보를 수집할 때 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리하고 보유합니다.

가. 회원 탈퇴 시까지 보유하는 정보
- 회원 정보
- 소셜 로그인 연동 정보
- 채팅 및 메모 내용
- 게시물 내용
- 카테고리 설정 정보
- 업로드한 파일, 이미지, 동영상 등 미디어 자료
- AI 요약 요청 기록 및 결과

단, 이용자가 직접 삭제한 콘텐츠는 서비스 운영 정책 및 관련 법령에 따라 필요한 범위 내에서 처리 후 삭제됩니다.

또한 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지 보관할 수 있습니다.

나. 관계 법령에 따른 보관
관련 법령에 따라 일정 기간 보관이 필요한 정보는 아래 기간 동안 보관할 수 있습니다.

- 계약 또는 청약철회 등에 관한 기록: 5년
- 대금결제 및 재화 등의 공급에 관한 기록: 5년
- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
- 표시·광고에 관한 기록: 6개월
- 웹사이트 또는 서비스 접속 기록: 3개월

4. 개인정보의 제3자 제공
운영팀은 이용자의 개인정보를 제1조에서 명시한 개인정보의 처리 목적 범위 내에서만 처리하며, 이용자의 동의가 있거나 법률에 특별한 규정이 있는 경우 등 관련 법령에서 허용하는 경우에만 개인정보를 제3자에게 제공합니다.

운영팀은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, AI 요약 기능 제공 과정에서 이용자가 입력한 텍스트 또는 URL 정보가 AI 서비스 제공자에게 전송될 수 있습니다.

5. 개인정보 처리의 위탁
운영팀은 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.

- 위탁받는 자: AWS(Amazon Web Services)
- 위탁하는 업무의 내용: 서버 호스팅, 데이터 저장 및 관리

운영팀은 위탁계약 체결 시 개인정보가 안전하게 관리될 수 있도록 관련 법령에 따라 필요한 사항을 관리·감독합니다.

6. 개인정보의 국외 이전
운영팀은 AI 요약 서비스 제공을 위해 아래와 같이 개인정보가 국외로 이전될 수 있음을 고지합니다.

- 이전받는 자: OpenAI
- 이전 국가: 미국
- 이전 항목: 이용자가 요약을 요청한 텍스트 내용, 링크 URL
- 이전 목적: AI 기반 텍스트 및 링크 요약 결과 생성
- 이전 시점 및 방법: 이용자가 AI 요약 기능을 요청하는 시점에 네트워크를 통해 전송
- 보유 및 이용기간: AI 요약 결과 생성 등 서비스 제공 목적 달성 후 지체 없이 파기하거나, AI 서비스 제공자의 정책 및 계약 조건에 따라 필요한 기간 동안 보관 후 파기

이용자는 AI 요약 기능 이용을 원하지 않는 경우 해당 기능을 사용하지 않을 수 있습니다.

7. 정보주체의 권리·의무 및 행사방법
이용자는 운영팀에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.

가. 개인정보 열람 요구
나. 오류 등이 있을 경우 정정 요구
다. 개인정보 삭제 요구
라. 개인정보 처리정지 요구
마. 채팅 및 게시물 내용 수정 또는 삭제
바. AI 요약 이력 삭제 요구

권리 행사는 개인정보 보호책임자 이메일을 통해 요청할 수 있으며, 운영팀은 관련 법령에 따라 지체 없이 조치합니다.

8. 회원 탈퇴 및 개인정보 삭제
이용자는 개인정보 보호책임자 이메일을 통해 회원 탈퇴 및 개인정보 삭제를 요청할 수 있습니다.

운영팀은 이용자의 요청을 확인한 후 본인 확인 절차를 거쳐 관련 법령에 따라 보관이 필요한 정보를 제외하고 개인정보를 삭제합니다.

다만, 관계 법령에 따라 보관이 필요한 정보는 해당 법령에서 정한 기간 동안 분리 보관 후 파기합니다.

9. 개인정보의 파기
운영팀은 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.

가. 파기절차
이용자가 입력한 정보는 처리 목적 달성 후 내부 방침 및 관련 법령에 따라 일정 기간 저장된 후 또는 즉시 파기됩니다.

나. 파기방법
- 전자적 파일 형태의 정보는 복구 및 재생이 불가능한 방법으로 삭제합니다.
- 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.

10. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항
운영팀은 현재 서비스 제공을 위해 쿠키 등 개인정보 자동 수집 장치를 별도로 운영하지 않습니다.

11. 개인정보의 안전성 확보 조치
운영팀은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.

- 비밀번호 암호화 저장
- 개인정보 접근 권한 제한
- 서버 및 데이터베이스 접근 통제
- 전송 구간 암호화
- 개인정보 처리 담당자 최소화
- 서비스 오류 및 보안 로그 관리

12. AI 서비스 관련 추가 고지사항

가. AI 요약 정확성
운영팀은 AI 요약 결과의 정확성, 완전성, 최신성을 보장하지 않습니다.
중요한 정보는 반드시 원본 내용을 직접 확인하시기 바랍니다.

나. AI 서비스 이용 시 주의사항
이용자는 AI 요약 기능 이용 시 주민등록번호, 금융정보, 비밀번호, 민감한 개인정보 등 중요한 개인정보가 포함된 내용을 입력하지 않도록 주의해야 합니다.

다. 서비스 품질 개선
운영팀은 개인을 식별할 수 없는 통계 정보에 한하여 서비스 품질 개선 및 안정적 운영을 위해 활용할 수 있습니다.

라. AI 서비스 제공자 변경
운영팀은 더 나은 서비스 제공을 위해 AI 서비스 제공자를 변경할 수 있으며, 변경이 필요한 경우 관련 법령 및 내부 정책에 따라 사전 공지합니다.

13. 개인정보 보호책임자
운영팀은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

- 개인정보 보호책임자: Memme 운영팀
- 이메일: memoryme202601@gmail.com

개인정보 관련 문의, 열람, 정정, 삭제, 처리정지, 회원 탈퇴 요청은 위 이메일을 통해 접수할 수 있습니다.

14. 개인정보 처리방침의 변경
이 개인정보 처리방침은 앱 서비스 출시일부터 적용됩니다.

운영팀은 개인정보 처리방침을 변경하는 경우 서비스 내 공지사항 또는 별도 안내를 통해 변경 내용을 고지합니다.

이전 개인정보 처리방침은 아래에서 확인할 수 있습니다.

- 해당사항 없음`;

const MARKETING_TERMS = `마케팅 정보 수신 동의

Memme(이하 "운영팀")는 회원에게 다양한 정보 및 혜택을 제공하기 위하여 아래와 같이 마케팅 정보 수신 동의를 받고 있습니다.

1. 수신 동의 목적
운영팀은 회원에게 다음과 같은 정보를 제공하기 위해 마케팅 정보 수신 동의를 받습니다.

가. 신규 서비스 및 기능 안내
나. 이벤트 및 프로모션 정보
다. 맞춤형 서비스 및 혜택 제공
라. 서비스 이용에 도움이 되는 각종 정보

2. 수신 방법
운영팀은 다음의 방법으로 마케팅 정보를 발송합니다.

가. 이메일


3. 수신 동의 철회
회원은 언제든지 마케팅 정보 수신 동의를 철회할 수 있습니다.

가. 앱 내 설정에서 직접 변경
나. 수신한 이메일 하단의 수신거부 링크 클릭
다. 고객센터를 통한 요청

4. 동의 거부 시 불이익
마케팅 정보 수신에 동의하지 않더라도 운영팀이 제공하는 서비스 이용에는 제한이 없습니다. 다만, 각종 이벤트 및 프로모션 정보를 받아보실 수 없습니다.

5. 개인정보의 보유 및 이용기간
회원이 마케팅 정보 수신에 동의한 경우, 운영팀은 회원 탈퇴 시 또는 수신 동의 철회 시까지 해당 정보를 보유 및 이용합니다.

부칙
본 마케팅 정보 수신 동의는 앱 서비스 출시일부터 적용됩니다.`;

export default TermsScreen;
