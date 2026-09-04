import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TextInput as RNTextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import appleAuth from '@invertase/react-native-apple-authentication';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loginStyles as styles } from '../styles/LoginScreen.styles';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } from '@env';
import { extractUserIdFromJWT } from '../utils/tokenUtils';
import { useAlert } from '../context/AlertContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const API_BASE_URL = 'https://memme.o-r.kr';

const STORAGE_KEYS = {
  AUTO_LOGIN: 'AUTO_LOGIN',
};

const KAKAO_AUTH_URL =
  `https://kauth.kakao.com/oauth/authorize` +
  `?response_type=code` +
  `&client_id=${KAKAO_REST_API_KEY}` +
  `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const passwordInputRef = useRef<RNTextInput>(null);
  const kakaoLoginInProgressRef = useRef(false);
  const appleLoginInProgressRef = useRef(false);
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kakaoWebViewVisible, setKakaoWebViewVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const parseErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();

      if (typeof data === 'string') return data;
      if (data?.message) return data.message;
      if (data?.error) return data.error;

      return '로그인 중 오류가 발생했습니다.';
    } catch {
      return '로그인 중 오류가 발생했습니다.';
    }
  };

  const getErrorMessage = (
    error: unknown,
    fallback: string,
  ): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const nativeError = error as {
        code?: unknown;
        message?: unknown;
        localizedDescription?: unknown;
        nativeStackIOS?: unknown;
      };
      const parts = [
        typeof nativeError.code === 'string' && `code: ${nativeError.code}`,
        typeof nativeError.message === 'string' && nativeError.message,
        typeof nativeError.localizedDescription === 'string' &&
          nativeError.localizedDescription,
      ].filter(Boolean);

      if (parts.length > 0) {
        return parts.join('\n');
      }

      try {
        return JSON.stringify(error);
      } catch {
        return fallback;
      }
    }

    if (typeof error === 'string') {
      return error;
    }

    return fallback;
  };

  const persistLoginSession = async (
    accessToken: string,
    refreshToken: string | undefined,
    shouldAutoLogin: boolean,
  ) => {
    if (!accessToken) {
      throw new Error('토큰이 응답에 없습니다.');
    }

    const userId = extractUserIdFromJWT(accessToken);

    if (!userId) {
      throw new Error('토큰에서 userId를 추출할 수 없습니다.');
    }

    await AsyncStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }
    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.AUTO_LOGIN,
      shouldAutoLogin ? 'true' : 'false',
    );
  };

  const navigateToMain = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({ title: '알림', message: '이메일과 비밀번호를 입력해주세요.' });
      return;
    }

    if (!validateEmail(email)) {
      showAlert({ title: '알림', message: '올바른 이메일 형식을 입력해주세요.' });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const apiResponse = await response.json();
      const { accessToken, refreshToken } = apiResponse.data;
      await persistLoginSession(accessToken, refreshToken, autoLogin);
      navigateToMain();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.';
      showAlert({ title: '로그인 실패', message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const completeKakaoLogin = async (code: string) => {
    if (kakaoLoginInProgressRef.current) {
      return;
    }

    kakaoLoginInProgressRef.current = true;

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/v1/auth/kakao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const apiResponse = await response.json();
      const { accessToken, refreshToken } = apiResponse.data;

      await persistLoginSession(accessToken, refreshToken, true);
      navigateToMain();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '카카오 로그인 중 오류가 발생했습니다.';
      showAlert({ title: '카카오 로그인 실패', message, type: 'error' });
    } finally {
      kakaoLoginInProgressRef.current = false;
      setLoading(false);
    }
  };

  const completeAppleLogin = async (code: string) => {
    try {
      setLoading(true);
  
      const response = await fetch(`${API_BASE_URL}/v1/auth/apple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ code }),
      });
  
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
  
      const apiResponse = await response.json();
      const { accessToken, refreshToken } = apiResponse.data;
  
      await persistLoginSession(accessToken, refreshToken, true);
      navigateToMain();
    } catch (error) {
      const message = getErrorMessage(
        error,
        '애플 로그인 중 오류가 발생했습니다.',
      );
      showAlert({ title: '애플 로그인 실패', message, type: 'error' });
    } finally {
      appleLoginInProgressRef.current = false;
      setLoading(false);
    }
  };

  const handleKakaoRedirect = (url: string): boolean => {
    if (!url.startsWith(KAKAO_REDIRECT_URI)) {
      return false;
    }

    setKakaoWebViewVisible(false);

    const codeMatch = url.match(/[?&]code=([^&]*)/);
    const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;

    const errorMatch = url.match(/[?&]error=([^&]*)/);
    const error = errorMatch ? decodeURIComponent(errorMatch[1]) : null;

    if (error) {
      showAlert({ title: '카카오 로그인 실패', message: `인증 오류: ${error}`, type: 'error' });
      return true;
    }

    if (!code) {
      showAlert({ title: '카카오 로그인 실패', message: '인가코드를 받지 못했습니다.', type: 'error' });
      return true;
    }

    completeKakaoLogin(code);
    return true;
  };

  // iOS: onNavigationStateChange로 리다이렉트 감지
  const handleKakaoNavigationChange = (navState: WebViewNavigation) => {
    handleKakaoRedirect(navState.url);
  };

  // Android: onShouldStartLoadWithRequest로 리다이렉트 사전 차단
  const handleKakaoShouldStartLoad = ({ url }: { url: string }): boolean => {
    if (url.startsWith(KAKAO_REDIRECT_URI)) {
      handleKakaoRedirect(url);
      return false;
    }
    return true;
  };

  const handleKakaoLogin = () => {
    kakaoLoginInProgressRef.current = false;
    setKakaoWebViewVisible(true);
  };

  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') {
      showAlert({
        title: '애플 로그인 안내',
        message: '애플 로그인은 iOS에서 사용할 수 있습니다.',
      });
      return;
    }

    if (appleLoginInProgressRef.current) {
      return;
    }

    appleLoginInProgressRef.current = true;

    try {
      setLoading(true);
      // console.log('[AppleLogin] start native request');

      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      const { authorizationCode } = response;
      // console.log('[AppleLogin] native response', {
        // hasAuthorizationCode: Boolean(authorizationCode),
      // });

      if (!authorizationCode) {
        throw new Error('인가코드를 받지 못했습니다.');
      }

      await completeAppleLogin(authorizationCode);
    } catch (error) {
      appleLoginInProgressRef.current = false;
      setLoading(false);
      // console.warn('[AppleLogin] native request failed', error);

      const isCanceled =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === appleAuth.Error.CANCELED;

      if (isCanceled) {
        return;
      }

      const message = getErrorMessage(
        error,
        '애플 로그인 중 오류가 발생했습니다.',
      );
      showAlert({ title: '애플 로그인 실패', message, type: 'error' });
    }
  };

  const handleSignup = () => {
    navigation.navigate('Terms');
  };

  const handleFindPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles['login-container']} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles['login-scrollContent']}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles['login-logoContainer']}>
              <Text style={styles['login-logoContainer-title']}>Memme</Text>
              <Text style={styles['login-logoContainer-subtitle']}>
                나를 기억하고 기록하는 공간
              </Text>
            </View>

            <View style={styles['login-inputContainer']}>
              <TextInput
                style={styles['login-inputContainer-input']}
                placeholder="이메일"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                editable={!loading}
              />

              {email && !validateEmail(email) && (
                <View style={styles['login-inputContainer-errorMessage']}>
                  <Text style={styles['login-inputContainer-errorMessage-text']}>
                    올바른 이메일 형식을 입력해주세요
                  </Text>
                </View>
              )}

              <View style={styles['login-inputContainer-passwordWrapper']}>
                <TextInput
                  ref={passwordInputRef}
                  style={styles['login-inputContainer-passwordWrapper-input']}
                  placeholder="비밀번호"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles['login-inputContainer-passwordWrapper-iconButton']}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles['login-inputContainer-optionsRow']}>
                <TouchableOpacity onPress={handleFindPassword}>
                  <Text style={styles['login-inputContainer-optionsRow-findPassword']}>
                    비밀번호 찾기
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles['login-inputContainer-optionsRow-autoLogin']}
                  onPress={() => setAutoLogin(!autoLogin)}>
                  <View
                    style={[
                      styles['login-inputContainer-optionsRow-autoLogin-checkbox'],
                      autoLogin &&
                        styles['login-inputContainer-optionsRow-autoLogin-checkbox-checked'],
                    ]}>
                    {autoLogin && (
                      <Text
                        style={styles['login-inputContainer-optionsRow-autoLogin-checkbox-check']}>
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text style={styles['login-inputContainer-optionsRow-autoLogin-text']}>
                    자동 로그인
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles['login-inputContainer-loginButton']}
                onPress={handleLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles['login-inputContainer-loginButton-text']}>
                    로그인
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles['login-signupContainer']}>
              <Text style={styles['login-signupContainer-text']}>
                계정이 없으신가요?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles['login-signupContainer-link']}>회원가입</Text>
              </TouchableOpacity>
            </View>

            <View style={styles['login-dividerContainer']}>
              <View style={styles['login-dividerContainer-line']} />
              <Text style={styles['login-dividerContainer-text']}>또는</Text>
              <View style={styles['login-dividerContainer-line']} />
            </View>

            <View style={styles['login-socialContainer']}>
              <TouchableOpacity
                style={styles['login-socialContainer-kakaoButton']}
                onPress={handleKakaoLogin}
                disabled={loading}>
                <Image
                  source={require('../assets/imgs/kakaoLogin.png')}
                  style={styles['login-socialContainer-kakaoButton-image']}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles['login-socialContainer-appleButton']}
                  onPress={handleAppleLogin}
                  disabled={loading}>
                  <Image
                    source={require('../assets/imgs/appleLogin.png')}
                    style={styles['login-socialContainer-appleButton-image']}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        visible={kakaoWebViewVisible}
        animationType="slide"
        statusBarTranslucent>
        <View
          style={[
            webViewStyles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}>
          <View style={webViewStyles.header}>
            <TouchableOpacity
              onPress={() => {
                kakaoLoginInProgressRef.current = false;
                setKakaoWebViewVisible(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={webViewStyles.title}>카카오 로그인</Text>
            <View style={{ width: 24 }} />
          </View>
          <WebView
            source={{ uri: KAKAO_AUTH_URL }}
            onNavigationStateChange={handleKakaoNavigationChange}
            onShouldStartLoadWithRequest={handleKakaoShouldStartLoad}
            originWhitelist={['*']}
            incognito={true}
            startInLoadingState
            renderLoading={() => (
              <View style={webViewStyles.loading}>
                <ActivityIndicator size="large" color="#FEE500" />
              </View>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const webViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default LoginScreen;
