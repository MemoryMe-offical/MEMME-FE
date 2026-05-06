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
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loginStyles as styles } from '../styles/LoginScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const API_BASE_URL = 'https://memme.o-r.kr';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ACCESS_TOKEN',
  AUTO_LOGIN: 'AUTO_LOGIN',
};

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const passwordInputRef = useRef<RNTextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
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
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = await response.json();
      const accessToken = data?.accessToken;
      console.log('로그인 성공, 받은 토큰:', accessToken);

      if (!accessToken) {
        throw new Error('토큰이 응답에 없습니다.');
      }

      await Keychain.setGenericPassword('token', accessToken);
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem(
        STORAGE_KEYS.AUTO_LOGIN,
        autoLogin ? 'true' : 'false',
      );

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setLoading(false);
    }
  };

  //TODO
  const handleKakaoLogin = () => {
    try {
      console.log('카카오 로그인');
    } catch {
      Alert.alert('로그인 실패', '카카오 로그인에 실패했습니다.');
    }
  };

  //TODO
  const handleAppleLogin = () => {
    try {
      console.log('애플 로그인');
    } catch {
      Alert.alert('로그인 실패', '애플 로그인에 실패했습니다.');
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
            {/* 로고 영역 */}
            <View style={styles['login-logoContainer']}>
              <Text style={styles['login-logoContainer-title']}>Memme</Text>
              <Text style={styles['login-logoContainer-subtitle']}>
                나를 기억하고 기록하는 공간
              </Text>
            </View>

            {/* 입력 영역 */}
            <View style={styles['login-inputContainer']}>
              {/* 이메일 입력 */}
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

              {/* 이메일 형식 에러 */}
              {email && !validateEmail(email) && (
                <View style={styles['login-inputContainer-errorMessage']}>
                  <Text style={styles['login-inputContainer-errorMessage-text']}>
                    올바른 이메일 형식을 입력해주세요
                  </Text>
                </View>
              )}

              {/* 비밀번호 입력 */}
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

              {/* 비밀번호 찾기 & 자동 로그인 */}
              <View style={styles['login-inputContainer-optionsRow']}>
                <TouchableOpacity onPress={handleFindPassword}>
                  <Text
                    style={styles['login-inputContainer-optionsRow-findPassword']}>
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
                        styles[
                          'login-inputContainer-optionsRow-autoLogin-checkbox-checked'
                        ],
                    ]}>
                    {autoLogin && (
                      <Text
                        style={
                          styles[
                            'login-inputContainer-optionsRow-autoLogin-checkbox-check'
                          ]
                        }>
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text
                    style={styles['login-inputContainer-optionsRow-autoLogin-text']}>
                    자동 로그인
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 로그인 버튼 */}
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

            {/* 회원가입 링크 */}
            <View style={styles['login-signupContainer']}>
              <Text style={styles['login-signupContainer-text']}>
                계정이 없으신가요?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={styles['login-signupContainer-link']}>회원가입</Text>
              </TouchableOpacity>
            </View>

            {/* 구분선 */}
            <View style={styles['login-dividerContainer']}>
              <View style={styles['login-dividerContainer-line']} />
              <Text style={styles['login-dividerContainer-text']}>또는</Text>
              <View style={styles['login-dividerContainer-line']} />
            </View>

            {/* 소셜 로그인 */}
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

              <TouchableOpacity
                style={styles['login-socialContainer-appleButton']}
                onPress={handleAppleLogin}
                disabled={loading}>
                <Image
                  source={require('../assets/imgs/appleLogin.png')}
                  style={styles['login-socialContainer-appleButton-image']}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;