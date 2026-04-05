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
import { RootStackParamList } from '../navigation/RootNavigator';
import { loginStyles as styles } from '../styles/LoginScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const passwordInputRef = useRef<RNTextInput>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ⭐ 로그인 처리 (Alert로 검증)
  const handleLogin = () => {
    // 입력 검증
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    // TODO: 로그인 API 연동
    setTimeout(() => {
      console.log('로그인:', { email, password, autoLogin });
      setLoading(false);
    
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 1000);
  };

  const handleKakaoLogin = () => {
    try {
      // TODO: 카카오 로그인 연동
      console.log('카카오 로그인');
    } catch (error) {
      Alert.alert('로그인 실패', '카카오 로그인에 실패했습니다.');
    }
  };

  const handleAppleLogin = () => {
    try {
      // TODO: 애플 로그인 연동
      console.log('애플 로그인');
    } catch (error) {
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
                <Text style={styles['login-inputContainer-optionsRow-findPassword']}>
                  비밀번호 찾기
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles['login-inputContainer-optionsRow-autoLogin']}
                onPress={() => setAutoLogin(!autoLogin)}>
                <View style={[
                  styles['login-inputContainer-optionsRow-autoLogin-checkbox'],
                  autoLogin && styles['login-inputContainer-optionsRow-autoLogin-checkbox-checked']
                ]}>
                  {autoLogin && (
                    <Text style={styles['login-inputContainer-optionsRow-autoLogin-checkbox-check']}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text style={styles['login-inputContainer-optionsRow-autoLogin-text']}>
                  자동 로그인
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* ⭐ 로그인 버튼 (항상 활성화, Alert로 검증) */}
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
            {/* 카카오 로그인 */}
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

            {/* 애플 로그인 */}
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