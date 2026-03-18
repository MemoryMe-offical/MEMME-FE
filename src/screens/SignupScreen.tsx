import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { signupStyles as styles } from '../styles/SignupScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  
  // ⭐ 인증 관련 상태
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  // ⭐ 인증번호 발송
  const handleSendCode = () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }

    // TODO: 이메일 인증 API 연동
    console.log('인증번호 발송:', email);
    setIsCodeSent(true);
    setTimer(180); // 3분 타이머
    
    Alert.alert('인증번호 발송', '이메일로 인증번호가 발송되었습니다.');

    // 타이머 시작
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ⭐ 인증번호 확인
  const handleVerifyCode = () => {
    if (!verificationCode) {
      Alert.alert('알림', '인증번호를 입력해주세요.');
      return;
    }

    // TODO: 인증번호 확인 API 연동
    console.log('인증번호 확인:', verificationCode);
    
    // 임시: 인증 성공 처리
    setIsVerified(true);
    Alert.alert('인증 완료', '이메일 인증이 완료되었습니다.');
  };

  const handleSignup = () => {
    // 유효성 검사
    if (!email || !password || !passwordConfirm || !name) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    if (!isVerified) {
      Alert.alert('알림', '이메일 인증을 완료해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    // TODO: 회원가입 API 연동
    console.log('회원가입:', { email, password, name });
    Alert.alert('가입 완료', '회원가입이 완료되었습니다.', [
      {
        text: '확인',
        onPress: () => navigation.replace('Login'),
      },
    ]);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // 타이머 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles['signup-container']} edges={['top']}>
      {/* 헤더 */}
      <View style={styles['signup-header']}>
        <TouchableOpacity
          style={styles['signup-header-backButton']}
          onPress={handleBack}>
          <Text style={styles['signup-header-backButton-text']}>←</Text>
        </TouchableOpacity>
        <Text style={styles['signup-header-title']}>회원가입</Text>
        <View style={styles['signup-header-placeholder']} />
      </View>

      <KeyboardAvoidingView
        style={styles['signup-body']}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* 안내 문구 */}
        <View style={styles['signup-infoSection']}>
          <Text style={styles['signup-infoSection-title']}>
            나만의 작은 저장 공간
          </Text>
          <Text style={styles['signup-infoSection-subtitle']}>
            로그인 전 회원가입을 진행하세요.
          </Text>
        </View>

        {/* 입력 영역 */}
        <View style={styles['signup-inputContainer']}>
          <View style={styles['signup-inputContainer-inputWrapper']}>
            <Text style={styles['signup-inputContainer-inputWrapper-label']}>
              이름
            </Text>
            <TextInput
              style={styles['signup-inputContainer-inputWrapper-input']}
              placeholder="이름을 입력하세요"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
          </View>

          {/* ⭐ 이메일 + 인증번호 발송 */}
          <View style={styles['signup-inputContainer-inputWrapper']}>
            <Text style={styles['signup-inputContainer-inputWrapper-label']}>
              이메일
            </Text>
            <View style={styles['signup-inputContainer-inputWrapper-row']}>
              <TextInput
                style={[
                  styles['signup-inputContainer-inputWrapper-input'],
                  styles['signup-inputContainer-inputWrapper-input-flex']
                ]}
                placeholder="example@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isVerified}
              />
              <TouchableOpacity
                style={[
                  styles['signup-inputContainer-inputWrapper-verifyButton'],
                  (isCodeSent && timer > 0) && styles['signup-inputContainer-inputWrapper-verifyButton-disabled']
                ]}
                onPress={handleSendCode}
                disabled={isCodeSent && timer > 0}>
                <Text style={styles['signup-inputContainer-inputWrapper-verifyButton-text']}>
                  {isCodeSent && timer > 0 ? formatTime(timer) : '인증'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ⭐ 인증번호 입력 (인증번호 발송 후에만 표시) */}
          {isCodeSent && !isVerified && (
            <View style={styles['signup-inputContainer-inputWrapper']}>
              <Text style={styles['signup-inputContainer-inputWrapper-label']}>
                인증번호
              </Text>
              <View style={styles['signup-inputContainer-inputWrapper-row']}>
                <TextInput
                  style={[
                    styles['signup-inputContainer-inputWrapper-input'],
                    styles['signup-inputContainer-inputWrapper-input-flex']
                  ]}
                  placeholder="인증번호 6자리"
                  placeholderTextColor="#999"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={styles['signup-inputContainer-inputWrapper-verifyButton']}
                  onPress={handleVerifyCode}>
                  <Text style={styles['signup-inputContainer-inputWrapper-verifyButton-text']}>
                    확인
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ⭐ 인증 완료 메시지 */}
          {isVerified && (
            <View style={styles['signup-inputContainer-verifiedMessage']}>
              <Text style={styles['signup-inputContainer-verifiedMessage-text']}>
                ✓ 이메일 인증이 완료되었습니다.
              </Text>
            </View>
          )}

          <View style={styles['signup-inputContainer-inputWrapper']}>
            <Text style={styles['signup-inputContainer-inputWrapper-label']}>
              비밀번호
            </Text>
            <TextInput
              style={styles['signup-inputContainer-inputWrapper-input']}
              placeholder="6자 이상 입력하세요"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <View style={styles['signup-inputContainer-inputWrapper']}>
            <Text style={styles['signup-inputContainer-inputWrapper-label']}>
              비밀번호 확인
            </Text>
            <TextInput
              style={styles['signup-inputContainer-inputWrapper-input']}
              placeholder="비밀번호를 다시 입력하세요"
              placeholderTextColor="#999"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={styles['signup-inputContainer-signupButton']}
            onPress={handleSignup}>
            <Text style={styles['signup-inputContainer-signupButton-text']}>
              가입하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 약관 동의 안내 */}
        <View style={styles['signup-termsContainer']}>
          <Text style={styles['signup-termsContainer-text']}>
            가입 시 <Text style={styles['signup-termsContainer-text-link']}>이용약관</Text> 및 <Text style={styles['signup-termsContainer-text-link']}>개인정보처리방침</Text>에 동의합니다.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;