import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { signupStyles as styles } from '../styles/SignupScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const timerIntervalRef = useRef<number | null>(null);
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const nameInputRef = useRef<RNTextInput>(null);
  const emailInputRef = useRef<RNTextInput>(null);
  const verificationCodeInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const passwordConfirmInputRef = useRef<RNTextInput>(null);

  // ⭐ 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFocus = (yOffset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  // ⭐ 인증번호 발송 (타이머 중복 실행 방지)
  const handleSendCode = () => {
    if (!email) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    // ⭐ 기존 타이머 정리
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // TODO: 이메일 인증 API 연동
    setTimeout(() => {
      console.log('인증번호 발송:', email);
      setIsCodeSent(true);
      setTimer(180);
      setLoading(false);
      Alert.alert('인증번호 발송', '이메일로 인증번호가 발송되었습니다.');

      // ⭐ 타이머 시작
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // ⭐ 인증번호 입력창으로 자동 포커스
      setTimeout(() => {
        verificationCodeInputRef.current?.focus();
      }, 500);
    }, 1000);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      Alert.alert('알림', '인증번호를 입력해주세요.');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('알림', '인증번호 6자리를 입력해주세요.');
      return;
    }

    setLoading(true);
    // TODO: 인증번호 확인 API 연동
    setTimeout(() => {
      console.log('인증번호 확인:', verificationCode);
      setIsVerified(true);
      setLoading(false);
      
      // ⭐ 타이머 정리
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      Alert.alert('인증 완료', '이메일 인증이 완료되었습니다.');
    }, 1000);
  };

  // ⭐ 이메일 변경 (재인증)
  const handleChangeEmail = () => {
    Alert.alert(
      '이메일 변경',
      '이메일을 변경하면 인증을 다시 진행해야 합니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '변경',
          onPress: () => {
            setIsVerified(false);
            setIsCodeSent(false);
            setVerificationCode('');
            setTimer(0);
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            emailInputRef.current?.focus();
          },
        },
      ]
    );
  };

  const handleSignup = () => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isFormValid = name && email && isVerified && password && passwordConfirm && password === passwordConfirm;

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles['signup-scrollView']}
            contentContainerStyle={styles['signup-scrollContent']}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            
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
              {/* 이름 */}
              <View style={styles['signup-inputContainer-inputWrapper']}>
                <Text style={styles['signup-inputContainer-inputWrapper-label']}>
                  이름
                </Text>
                <TextInput
                  ref={nameInputRef}
                  style={styles['signup-inputContainer-inputWrapper-input']}
                  placeholder="이름을 입력하세요"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  onFocus={() => handleFocus(0)}
                  editable={!loading}
                />
              </View>

              {/* 이메일 */}
              <View style={styles['signup-inputContainer-inputWrapper']}>
                <Text style={styles['signup-inputContainer-inputWrapper-label']}>
                  이메일
                </Text>
                <View style={styles['signup-inputContainer-inputWrapper-row']}>
                  <TextInput
                    ref={emailInputRef}
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
                    textContentType="emailAddress"
                    editable={!isVerified && !loading}
                    returnKeyType="done"
                    onFocus={() => handleFocus(50)}
                  />
                  <TouchableOpacity
                    style={[
                      styles['signup-inputContainer-inputWrapper-verifyButton'],
                      (isCodeSent && timer > 0) && styles['signup-inputContainer-inputWrapper-verifyButton-disabled']
                    ]}
                    onPress={handleSendCode}
                    disabled={(isCodeSent && timer > 0) || loading || isVerified}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles['signup-inputContainer-inputWrapper-verifyButton-text']}>
                        {isCodeSent && timer > 0 ? formatTime(timer) : isCodeSent ? '재발송' : '인증'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* ⭐ 이메일 형식 에러 */}
                {email && !validateEmail(email) && !isVerified && (
                  <View style={styles['signup-inputContainer-errorMessage']}>
                    <Text style={styles['signup-inputContainer-errorMessage-text']}>
                      올바른 이메일 형식을 입력해주세요
                    </Text>
                  </View>
                )}
              </View>

              {/* ⭐ 인증번호 입력 (타이머 > 0 일 때만) */}
              {isCodeSent && !isVerified && timer > 0 && (
                <View style={styles['signup-inputContainer-inputWrapper']}>
                  <Text style={styles['signup-inputContainer-inputWrapper-label']}>
                    인증번호
                  </Text>
                  <View style={styles['signup-inputContainer-inputWrapper-row']}>
                    <TextInput
                      ref={verificationCodeInputRef}
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
                      returnKeyType="done"
                      onFocus={() => handleFocus(150)}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles['signup-inputContainer-inputWrapper-verifyButton']}
                      onPress={handleVerifyCode}
                      disabled={loading}>
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles['signup-inputContainer-inputWrapper-verifyButton-text']}>
                          확인
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ⭐ 타이머 만료 메시지 */}
              {isCodeSent && !isVerified && timer === 0 && (
                <View style={styles['signup-inputContainer-errorMessage']}>
                  <Text style={styles['signup-inputContainer-errorMessage-text']}>
                    인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.
                  </Text>
                </View>
              )}

              {/* ⭐ 인증 완료 메시지 + 이메일 변경 */}
              {isVerified && (
                <View style={styles['signup-inputContainer-verifiedMessage']}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles['signup-inputContainer-verifiedMessage-text']}>
                      ✓ {email} 인증 완료
                    </Text>
                    <TouchableOpacity onPress={handleChangeEmail}>
                      <Text style={{ color: '#588DFF', fontSize: 13, fontWeight: '600' }}>
                        이메일 변경
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 비밀번호 */}
              <View style={styles['signup-inputContainer-inputWrapper']}>
                <Text style={styles['signup-inputContainer-inputWrapper-label']}>
                  비밀번호
                </Text>
                <View style={styles['signup-inputContainer-passwordWrapper']}>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles['signup-inputContainer-passwordWrapper-input']}
                    placeholder="6자 이상 입력하세요"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="newPassword"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordConfirmInputRef.current?.focus()}
                    onFocus={() => handleFocus(250)}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={styles['signup-inputContainer-passwordWrapper-iconButton']}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Icon 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 비밀번호 확인 */}
              <View style={styles['signup-inputContainer-inputWrapper']}>
                <Text style={styles['signup-inputContainer-inputWrapper-label']}>
                  비밀번호 확인
                </Text>
                <View style={styles['signup-inputContainer-passwordWrapper']}>
                  <TextInput
                    ref={passwordConfirmInputRef}
                    style={styles['signup-inputContainer-passwordWrapper-input']}
                    placeholder="비밀번호를 다시 입력하세요"
                    placeholderTextColor="#999"
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    secureTextEntry={!showPasswordConfirm}
                    autoComplete="password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onFocus={() => handleFocus(350)}
                    editable={!loading}
                  />
                  <TouchableOpacity 
                    style={styles['signup-inputContainer-passwordWrapper-iconButton']}
                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                    <Icon 
                      name={showPasswordConfirm ? 'eye-off' : 'eye'} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
                
                {/* ⭐ 비밀번호 불일치 에러 */}
                {passwordConfirm && password !== passwordConfirm && (
                  <View style={styles['signup-inputContainer-errorMessage']}>
                    <Text style={styles['signup-inputContainer-errorMessage-text']}>
                      비밀번호가 일치하지 않습니다
                    </Text>
                  </View>
                )}
              </View>

              {/* ⭐ 약관 동의 안내 (버튼 위로 이동) */}
              <View style={styles['signup-termsContainer']}>
                <Text style={styles['signup-termsContainer-text']}>
                  가입 시{' '}
                  <Text 
                    style={styles['signup-termsContainer-text-link']}
                    onPress={() => navigation.navigate('Terms')}>
                    이용약관
                  </Text>
                  {' '}및{' '}
                  <Text 
                    style={styles['signup-termsContainer-text-link']}
                    onPress={() => navigation.navigate('Terms')}>
                    개인정보처리방침
                  </Text>
                  에 동의합니다.
                </Text>
              </View>

              {/* 가입하기 버튼 */}
              <TouchableOpacity
                style={[
                  styles['signup-inputContainer-signupButton'],
                  !isFormValid && styles['signup-inputContainer-signupButton-disabled']
                ]}
                onPress={handleSignup}
                disabled={!isFormValid}>
                <Text style={styles['signup-inputContainer-signupButton-text']}>
                  가입하기
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;