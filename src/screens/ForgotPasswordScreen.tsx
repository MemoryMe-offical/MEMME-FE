import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { forgotPasswordStyles as styles } from '../styles/ForgotPasswordScreen.styles';
import { useAlert } from '../context/AlertContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const API_BASE_URL = 'https://memme.o-r.kr';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { showAlert, showConfirm } = useAlert();
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // 단계: 1=이메일입력, 2=인증번호입력, 3=비밀번호재설정
  const [step, setStep] = useState(1);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
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

  const requestPasswordResetCode = async () => {
    const params = new URLSearchParams({ email });
    const response = await fetch(
      `${API_BASE_URL}/v1/auth/pw/email/request?${params.toString()}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response;
  };

  const verifyPasswordResetCode = async () => {
    const params = new URLSearchParams({
      email,
      code: verificationCode,
    });
    const response = await fetch(
      `${API_BASE_URL}/v1/auth/pw/email/verify?${params.toString()}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response;
  };

  const resetPassword = async () => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/pw/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        newPassword,
      }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    return response;
  };

  // 1단계: 이메일 인증번호 발송
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
      await requestPasswordResetCode();

      setIsCodeSent(true);
      setVerificationCode('');
      setStep(2);
      startTimer();

      showAlert({ title: '인증번호 발송', message: '이메일로 인증번호가 발송되었습니다.', type: 'success' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 발송 중 오류가 발생했습니다.';
      showAlert({ title: '오류', message, type: 'error' });
    } finally {
      setSendCodeLoading(false);
    }
  };

  // 2단계: 인증번호 확인
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
      await verifyPasswordResetCode();

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      setStep(3);
      showAlert({ title: '인증 완료', message: '이메일 인증이 완료되었습니다.\n새 비밀번호를 설정해주세요.', type: 'success' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '인증번호 확인 중 오류가 발생했습니다.';
      showAlert({ title: '오류', message, type: 'error' });
    } finally {
      setVerifyCodeLoading(false);
    }
  };

  // 3단계: 비밀번호 재설정
  const handleResetPassword = async () => {
    if (!newPassword || !newPasswordConfirm) {
      showAlert({ title: '알림', message: '새 비밀번호를 입력해주세요.' });
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      showAlert({ title: '알림', message: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({ title: '알림', message: '비밀번호는 6자 이상이어야 합니다.' });
      return;
    }

    try {
      setResetPasswordLoading(true);
      await resetPassword();

      showConfirm({
        title: '완료',
        message: '비밀번호가 성공적으로 변경되었습니다.\n로그인 화면으로 이동합니다.',
        confirmText: '확인',
        cancelText: undefined,
        destructive: false,
        onConfirm: () => navigation.replace('Login'),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '비밀번호 변경 중 오류가 발생했습니다.';
      showAlert({ title: '오류', message, type: 'error' });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // 타이머 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles['forgot-container']} edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View style={styles['forgot-header']}>
        <TouchableOpacity
          style={styles['forgot-header-backButton']}
          onPress={handleBack}>
          <Text style={styles['forgot-header-backButton-text']}>←</Text>
        </TouchableOpacity>
        <Text style={styles['forgot-header-title']}>비밀번호 찾기</Text>
        <View style={styles['forgot-header-placeholder']} />
      </View>

      <KeyboardAvoidingView
        style={styles['forgot-body']}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* 안내 문구 */}
        <View style={styles['forgot-infoSection']}>
          <Text style={styles['forgot-infoSection-title']}>
            {step === 1 && '비밀번호를 잊으셨나요?'}
            {step === 2 && '인증번호를 입력하세요'}
            {step === 3 && '새 비밀번호를 설정하세요'}
          </Text>
          <Text style={styles['forgot-infoSection-subtitle']}>
            {step === 1 && '가입하신 이메일 주소로 인증번호를 보내드립니다.'}
            {step === 2 && '이메일로 발송된 6자리 인증번호를 입력해주세요.'}
            {step === 3 && '새로운 비밀번호를 입력하고 확인해주세요.'}
          </Text>
        </View>

        {/* 입력 영역 */}
        <View style={styles['forgot-inputContainer']}>
          {/* 1단계: 이메일 입력 */}
          {(step === 1 || step === 2) && (
            <>
              <View style={styles['forgot-inputContainer-inputWrapper']}>
                <Text style={styles['forgot-inputContainer-inputWrapper-label']}>
                  이메일
                </Text>
                <View style={styles['forgot-inputContainer-inputWrapper-row']}>
                  <TextInput
                    style={[
                      styles['forgot-inputContainer-inputWrapper-input'],
                      styles['forgot-inputContainer-inputWrapper-input-flex']
                    ]}
                    placeholder="example@email.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isCodeSent}
                  />
                  <TouchableOpacity
                    style={[
                      styles['forgot-inputContainer-inputWrapper-verifyButton'],
                      (isCodeSent && timer > 0) && styles['forgot-inputContainer-inputWrapper-verifyButton-disabled']
                    ]}
                    onPress={handleSendCode}
                    disabled={(isCodeSent && timer > 0) || sendCodeLoading}>
                    {sendCodeLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles['forgot-inputContainer-inputWrapper-verifyButton-text']}>
                        {isCodeSent && timer > 0 ? formatTime(timer) : isCodeSent ? '재발송' : '인증'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {isCodeSent && step === 2 && (
                <>
                  <View style={styles['forgot-inputContainer-inputWrapper']}>
                    <Text style={styles['forgot-inputContainer-inputWrapper-label']}>
                      인증번호
                    </Text>
                    <View style={styles['forgot-inputContainer-inputWrapper-row']}>
                      <TextInput
                        style={[
                          styles['forgot-inputContainer-inputWrapper-input'],
                          styles['forgot-inputContainer-inputWrapper-input-flex']
                        ]}
                        placeholder="인증번호 6자리"
                        placeholderTextColor="#999"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                      <TouchableOpacity
                        style={styles['forgot-inputContainer-inputWrapper-verifyButton']}
                        onPress={handleVerifyCode}
                        disabled={verifyCodeLoading}>
                        {verifyCodeLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles['forgot-inputContainer-inputWrapper-verifyButton-text']}>
                            확인
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              {isCodeSent && step === 2 && timer === 0 && (
                <Text style={styles['forgot-helpContainer-text']}>
                  인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.
                </Text>
              )}
            </>
          )}

          {/* 3단계: 비밀번호 재설정 */}
          {step === 3 && (
            <>
              <View style={styles['forgot-inputContainer-inputWrapper']}>
                <Text style={styles['forgot-inputContainer-inputWrapper-label']}>
                  새 비밀번호
                </Text>
                <TextInput
                  style={styles['forgot-inputContainer-inputWrapper-input']}
                  placeholder="6자 이상 입력하세요"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <View style={styles['forgot-inputContainer-inputWrapper']}>
                <Text style={styles['forgot-inputContainer-inputWrapper-label']}>
                  새 비밀번호 확인
                </Text>
                <TextInput
                  style={styles['forgot-inputContainer-inputWrapper-input']}
                  placeholder="비밀번호를 다시 입력하세요"
                  placeholderTextColor="#999"
                  value={newPasswordConfirm}
                  onChangeText={setNewPasswordConfirm}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <TouchableOpacity
                style={styles['forgot-inputContainer-sendButton']}
                onPress={handleResetPassword}
                disabled={resetPasswordLoading}>
                {resetPasswordLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles['forgot-inputContainer-sendButton-text']}>
                    비밀번호 변경
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 도움말 */}
        {step === 1 && (
          <View style={styles['forgot-helpContainer']}>
            <Text style={styles['forgot-helpContainer-text']}>
              인증번호가 도착하지 않았나요?{'\n'}
              스팸 메일함을 확인해보시거나 고객센터로 문의해주세요.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
