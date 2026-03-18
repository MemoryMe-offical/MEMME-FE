import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loginStyles as styles } from '../styles/LoginScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  const handleLogin = () => {
    // TODO: 로그인 API 연동
    console.log('로그인:', { email, password, autoLogin });
    navigation.navigate('Main');
  };

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 연동
    console.log('카카오 로그인');
  };

  const handleAppleLogin = () => {
    // TODO: 애플 로그인 연동
    console.log('애플 로그인');
  };

  const handleSignup = () => {
    navigation.navigate('Terms');
  };

  const handleFindPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView
      style={styles['login-container']}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
          <TextInput
            style={styles['login-inputContainer-input']}
            placeholder="이메일"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={styles['login-inputContainer-input']}
            placeholder="비밀번호"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {/* ⭐ 자동 로그인 & 비밀번호 찾기 */}
          <View style={styles['login-inputContainer-optionsRow']}>
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

            <TouchableOpacity onPress={handleFindPassword}>
              <Text style={styles['login-inputContainer-optionsRow-findPassword']}>
                비밀번호 찾기
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles['login-inputContainer-loginButton']}
            onPress={handleLogin}>
            <Text style={styles['login-inputContainer-loginButton-text']}>
              로그인
            </Text>
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
            onPress={handleKakaoLogin}>
            <Image
              source={require('../assets/imgs/kakaoLogin.png')}
              style={styles['login-socialContainer-kakaoButton-image']}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 애플 로그인 */}
          <TouchableOpacity
            style={styles['login-socialContainer-appleButton']}
            onPress={handleAppleLogin}>
            <Image
              source={require('../assets/imgs/appleLogin.png')}
              style={styles['login-socialContainer-appleButton-image']}
            />
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

        {/* 개발용 암호화 테스트 버튼 */}
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: '#6c757d',
            borderRadius: 12,
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('EncryptionTest')}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            🧪 암호화 테스트 (개발용)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;