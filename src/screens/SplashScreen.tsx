import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { splashStyles as styles } from '../styles/SplashScreen.styles';

// 개발 플러그: true면 온보딩 강제로 보여줌, false면 실제 로직대로 동작
const FORCE_SHOW_ONBOARDING = true;

// 스플래시 고정 (개발용) - true면 스플래시 화면에서 멈춤
const FREEZE_SPLASH = false;

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const characterAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        // 스플래시 고정 모드면 화면 전환 안 함
        if (FREEZE_SPLASH) {
          console.log('스플래시 화면 고정 모드');
          return;
        }

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
      Animated.spring(characterAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 화면 이동 체크
    checkFirstLaunch();
  }, [navigation, fadeAnim, characterAnim]);

  return (
    <View style={styles['splash-container']}>
      {/* 상단 로고 영역 (왼쪽 정렬) */}
      <Animated.View
        style={[
          styles['splash-logoSection'],
          { opacity: fadeAnim },
        ]}>
        {/* 작은 로고 아이콘 */}
        <Image
          source={require('../assets/imgs/mainlogo.png')}
          style={styles['splash-logoSection-iconBox-image']}
          resizeMode="contain"
        />
        
        {/* 앱 이름 */}
        <Text style={styles['splash-logoSection-title']}>Memme</Text>
        
        {/* 서브타이틀 */}
        <Text style={styles['splash-logoSection-subtitle']}>
          나를 기억하고 기록하는 공간
        </Text>
      </Animated.View>

      {/* 캐릭터 이미지 (하단 크게) */}
      <Animated.View
        style={[
          styles['splash-characterContainer'],
          {
            opacity: fadeAnim,
            transform: [{ translateY: characterAnim }],
          },
        ]}>
        <Image
          source={require('../assets/imgs/mainart.png')}
          style={[
            styles['splash-characterContainer-image'],
            { transform: [{ rotate: '-21deg' }] }, // 이미지에 직접 회전
          ]}
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;