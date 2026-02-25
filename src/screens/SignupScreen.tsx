import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { signupStyles as styles } from '../styles/SignupScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');

  const handleSignup = () => {
    // 유효성 검사
    if (!email || !password || !passwordConfirm || !name) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
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

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles['signup-container']}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles['signup-scrollContent']}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        
        {/* 헤더 */}
        <View style={styles['signup-headerContainer']}>
          <TouchableOpacity
            style={styles['signup-headerContainer-backButton']}
            onPress={handleBackToLogin}>
            <Text style={styles['signup-headerContainer-backButton-text']}>
              ← 뒤로
            </Text>
          </TouchableOpacity>
          <Text style={styles['signup-headerContainer-title']}>회원가입</Text>
          <Text style={styles['signup-headerContainer-subtitle']}>
            Memme과 함께 시작하세요
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

          <View style={styles['signup-inputContainer-inputWrapper']}>
            <Text style={styles['signup-inputContainer-inputWrapper-label']}>
              이메일
            </Text>
            <TextInput
              style={styles['signup-inputContainer-inputWrapper-input']}
              placeholder="example@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

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
            가입하기를 누르면{' '}
            <Text style={styles['signup-termsContainer-text-link']}>
              이용약관
            </Text>
            과{' '}
            <Text style={styles['signup-termsContainer-text-link']}>
              개인정보처리방침
            </Text>
            에 동의하는 것으로 간주됩니다.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;