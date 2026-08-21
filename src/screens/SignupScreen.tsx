import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { signupStyles as styles } from '../styles/SignupScreen.styles';
import { useAlert } from '../context/AlertContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const API_BASE_URL = 'https://memme.o-r.kr';

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  // 노치/홈 인디케이터 유무는 화면 높이 추정이 아니라 실제 safe area
  // inset으로 판단한다(Mac에서 실행되는 경우 창 높이가 노치 기기 기준을
  // 넘어 오판하는 것을 방지).
  const hasNotchBottom = Platform.OS === 'ios' && insets.bottom > 0;
  const scrollViewRef = useRef<ScrollView>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const signupCompletedRef = useRef(false);
  const { showAlert, showConfirm } = useAlert();

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userName, setName] = useState('');

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const nameInputRef = useRef<RNTextInput>(null);
  const emailInputRef = useRef<RNTextInput>(null);
  const verificationCodeInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const passwordConfirmInputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // 입력 진행 중 뒤로가기 시 확인 다이얼로그
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (signupCompletedRef.current) return;
      const hasInput = !!userName || !!email || !!password || !!passwordConfirm || isCodeSent;
      if (!hasInput) return;
      e.preventDefault();
      showConfirm({
        title: '나가기',
        message: '입력한 내용이 모두 사라집니다. 나가시겠습니까?',
        confirmText: '나가기',
        cancelText: '계속',
        destructive: true,
        onConfirm: () => navigation.dispatch(e.data.action),
      });
    });
    return unsubscribe;
  }, [navigation, userName, email, password, passwordConfirm, isCodeSent, showConfirm]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleFocus = (yOffset: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setTimer(180);

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
  };

  const parseErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();

      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.data?.message) return data.data.message;

      return '요청 처리 중 오류가 발생했습니다.';
    } catch {
      return '요청 처리 중 오류가 발생했습니다.';
    }
  };

  // 이메일 인증 요청
  const requestEmailCode = async () => {
    const response = await fetch(`${API_BASE_URL}/v1/email/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response;
  };

  // 이메일 인증 확인
  const verifyEmailCode = async () => {
    const response = await fetch(`${API_BASE_URL}/v1/email/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code: verificationCode,
      }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response;
  };

  // 회원가입 요청
  const registerUser = async () => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        userName
      }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response;
  };

  const handleSendCode = async () => {
    if (!email) {
      showAlert({ title: '알림', message: '이메일을 입력해주세요.' });
      return;
    }

    if (!validateEmail(email)) {
      showAlert({ title: '알림', message: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }

    try {
      setSendCodeLoading(true);
      setLoading(true);

      await requestEmailCode();

      setIsCodeSent(true);
      setIsVerified(false);
      startTimer();

      showAlert({ title: '인증번호 발송', message: '이메일로 인증번호가 발송되었습니다.', type: 'success' });

      setTimeout(() => {
        verificationCodeInputRef.current?.focus();
      }, 500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 발송 중 오류가 발생했습니다.';
      showAlert({ title: '오류', message, type: 'error' });
    } finally {
      setSendCodeLoading(false);
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      showAlert({ title: '알림', message: '인증번호를 입력해주세요.' });
      return;
    }

    if (verificationCode.length !== 6) {
      showAlert({ title: '알림', message: '인증번호 6자리를 입력해주세요.' });
      return;
    }

    try {
      setVerifyCodeLoading(true);
      setLoading(true);

      await verifyEmailCode();

      setIsVerified(true);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      showAlert({ title: '인증 완료', message: '이메일 인증이 완료되었습니다.', type: 'success' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 확인 중 오류가 발생했습니다.';
      showAlert({ title: '오류', message, type: 'error' });
    } finally {
      setVerifyCodeLoading(false);
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    showConfirm({
      title: '이메일 변경',
      message: '이메일을 변경하면 인증을 다시 진행해야 합니다.',
      confirmText: '변경',
      cancelText: '취소',
      destructive: false,
      onConfirm: () => {
        setIsVerified(false);
        setIsCodeSent(false);
        setVerificationCode('');
        setTimer(0);

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }

        emailInputRef.current?.focus();
      },
    });
  };

  const handleSignup = async () => {
    if (!email || !password || !passwordConfirm || !userName) {
      showAlert({ title: '알림', message: '모든 항목을 입력해주세요.' });
      return;
    }

    if (!isVerified) {
      showAlert({ title: '알림', message: '이메일 인증을 완료해주세요.' });
      return;
    }

    if (password !== passwordConfirm) {
      showAlert({ title: '알림', message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (password.length < 6) {
      showAlert({ title: '알림', message: '비밀번호는 6자 이상이어야 합니다.' });
      return;
    }

    try {
      setSignupLoading(true);
      setLoading(true);

      await registerUser();

      showConfirm({
        title: '가입 완료',
        message: '회원가입이 완료되었습니다.',
        confirmText: '확인',
        cancelText: undefined,
        destructive: false,
        onConfirm: () => {
          signupCompletedRef.current = true;
          navigation.replace('Login');
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '회원가입 중 오류가 발생했습니다.';
      showAlert({ title: '오류', message, type: 'error' });
    } finally {
      setSignupLoading(false);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isFormValid =
    !!userName &&
    !!email &&
    isVerified &&
    !!password &&
    !!passwordConfirm &&
    password === passwordConfirm;

  return (
    <SafeAreaView style={styles['signup-container']} edges={['top', 'bottom']}>
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
                  value={userName}
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
                      styles['signup-inputContainer-inputWrapper-input-flex'],
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
                      isCodeSent &&
                        timer > 0 &&
                        styles[
                          'signup-inputContainer-inputWrapper-verifyButton-disabled'
                        ],
                    ]}
                    onPress={handleSendCode}
                    disabled={(isCodeSent && timer > 0) || loading || isVerified}>
                    {sendCodeLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text
                        style={
                          styles[
                            'signup-inputContainer-inputWrapper-verifyButton-text'
                          ]
                        }>
                        {isCodeSent && timer > 0
                          ? formatTime(timer)
                          : isCodeSent
                          ? '재발송'
                          : '인증'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {email && !validateEmail(email) && !isVerified && (
                  <View style={styles['signup-inputContainer-errorMessage']}>
                    <Text
                      style={styles['signup-inputContainer-errorMessage-text']}>
                      올바른 이메일 형식을 입력해주세요
                    </Text>
                  </View>
                )}
              </View>

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
                        styles['signup-inputContainer-inputWrapper-input-flex'],
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
                      {verifyCodeLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text
                          style={
                            styles[
                              'signup-inputContainer-inputWrapper-verifyButton-text'
                            ]
                          }>
                          확인
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {isCodeSent && !isVerified && timer === 0 && (
                <View style={styles['signup-inputContainer-errorMessage']}>
                  <Text style={styles['signup-inputContainer-errorMessage-text']}>
                    인증 시간이 만료되었습니다. 재발송 버튼을 눌러주세요.
                  </Text>
                </View>
              )}

              {isVerified && (
                <View style={styles['signup-inputContainer-verifiedMessage']}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={styles['signup-inputContainer-verifiedMessage-text']}>
                      ✓ {email} 인증 완료
                    </Text>
                    <TouchableOpacity onPress={handleChangeEmail}>
                      <Text
                        style={{
                          color: '#588DFF',
                          fontSize: 13,
                          fontWeight: '600',
                        }}>
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
                    onSubmitEditing={() =>
                      passwordConfirmInputRef.current?.focus()
                    }
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
                    onPress={() =>
                      setShowPasswordConfirm(!showPasswordConfirm)
                    }>
                    <Icon
                      name={showPasswordConfirm ? 'eye-off' : 'eye'}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>

                {passwordConfirm && password !== passwordConfirm && (
                  <View style={styles['signup-inputContainer-errorMessage']}>
                    <Text
                      style={styles['signup-inputContainer-errorMessage-text']}>
                      비밀번호가 일치하지 않습니다
                    </Text>
                  </View>
                )}
              </View>

              {/* 약관 동의 안내 */}
              <View
                style={[
                  styles['signup-termsContainer'],
                  hasNotchBottom && { paddingBottom: 34 },
                ]}>
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
                  !isFormValid &&
                    styles['signup-inputContainer-signupButton-disabled'],
                ]}
                onPress={handleSignup}
                disabled={!isFormValid || signupLoading}>
                {signupLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles['signup-inputContainer-signupButton-text']}>
                    가입하기
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;