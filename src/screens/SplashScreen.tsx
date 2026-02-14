import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { splashStyles as styles } from '../styles/SplashScreen.styles';

// 개발 플러그: true면 온보딩 강제로 보여줌, false면 실제 로직대로 동작
const FORCE_SHOW_ONBOARDING = true;

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        // 2초 대기 (스플래시 효과)
        await new Promise<void>(resolve => setTimeout(resolve, 2000));

        if (FORCE_SHOW_ONBOARDING) {
          // 개발 모드: 온보딩 강제 표시
          navigation.replace('Onboarding');
          return;
        }

        // 실제 로직: AsyncStorage에서 온보딩 완료 여부 확인
        const hasSeenOnboarding = await AsyncStorage.getItem('@hasSeenOnboarding');

        if (hasSeenOnboarding === 'true') {
          // 온보딩을 본 적 있으면 메인으로
          navigation.replace('Main');
        } else {
          // 최초 사용자면 온보딩으로
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.error('스플래시 체크 에러:', error);
        navigation.replace('Onboarding');
      }
    };

    // 애니메이션 시작
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    // 화면 이동 체크
    checkFirstLaunch();
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles['splash-container']}>
      <Animated.View
        style={[
          styles['splash-logoContainer'],
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <View style={styles['splash-logoContainer-logo']}>
          <Text style={styles['splash-logoContainer-logo-text']}>MEM</Text>
        </View>
        <Text style={styles['splash-logoContainer-subtitle']}>Memory Me</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;