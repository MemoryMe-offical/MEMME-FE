import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as styles } from '../styles/OnboardingScreen.styles';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: '카톡 나에게 보내기를\n대체하는 똑똑한 메모',
    description: '링크, 파일, 사진을 저장하고\n나중에 쉽게 찾아보세요',
    image: require('../assets/imgs/onbording1.png'),
  },
  {
    id: '2',
    title: 'AI가 링크 내용을\n자동으로 요약',
    description: 'YouTube, 블로그, 뉴스\n긴 콘텐츠를 3줄로 정리해드립니다',
    image: require('../assets/imgs/onbording2.png'),
  },
  {
    id: '3',
    title: '카테고리로 분류하고\n검색으로 찾기',
    description: '태그를 붙여 정리하고\n필요할 때 검색해서 바로 확인하세요',
    image: require('../assets/imgs/onbording3.png'),
  },
];

const OnboardingScreen = ({ navigation }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // 🎬 각 슬라이드마다 독립적인 애니메이션 값
  const fadeAnims = useRef(onboardingData.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(onboardingData.map(() => new Animated.Value(0.8))).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // 🎬 바운스 애니메이션 (무한 반복)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 현재 페이지 애니메이션 시작
  useEffect(() => {
    // 현재 페이지 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnims[currentIndex], {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[currentIndex], {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    
    // 이전 페이지 초기화
    if (index !== currentIndex) {
      fadeAnims[currentIndex].setValue(0);
      scaleAnims[currentIndex].setValue(0.8);
    }
    
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      // 현재 페이지 페이드아웃
      Animated.parallel([
        Animated.timing(fadeAnims[currentIndex], {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[currentIndex], {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 다음 페이지로 이동
        flatListRef.current?.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        });
        setCurrentIndex(currentIndex + 1);
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('온보딩 완료 저장 실패:', error);
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item, index }: { item: OnboardingItem; index: number }) => (
    <View style={styles['onboarding-slide']}>
      {/* 🎬 이미지 애니메이션 */}
      <Animated.View
        style={{
          opacity: fadeAnims[index],
          transform: [
            { scale: scaleAnims[index] },
            { translateY: bounceAnim },
          ],
        }}
      >
        <Image 
          source={item.image} 
          style={styles['onboarding-slide-image']} 
          resizeMode="contain" 
        />
      </Animated.View>

      {/* 🎬 텍스트 애니메이션 */}
      <Animated.View
        style={{
          opacity: fadeAnims[index],
          transform: [{
            translateY: fadeAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          }],
        }}
      >
        <Text style={styles['onboarding-slide-title']}>{item.title}</Text>
        <Text style={styles['onboarding-slide-description']}>{item.description}</Text>
      </Animated.View>
    </View>
  );

  const renderDots = () => (
    <View style={styles['onboarding-bottomContainer-dotsContainer']}>
      {onboardingData.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 20, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles['onboarding-bottomContainer-dotsContainer-dot'],
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <LinearGradient
      colors={['#588DFF', '#9CB8FF', '#D5E3FF', '#F0F5FF', '#FFFFFF']}
      locations={[0.05, 0.25, 0.45, 0.55, 0.99]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles['onboarding-container']}
    >
      <TouchableOpacity style={styles['onboarding-skipButton']} onPress={handleSkip}>
        <Text style={styles['onboarding-skipButton-text']}>건너뛰기</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={item => item.id}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      />

      <View style={styles['onboarding-bottomContainer']}>
        {renderDots()}
        <TouchableOpacity 
          style={styles['onboarding-bottomContainer-nextButton']} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles['onboarding-bottomContainer-nextButton-text']}>
            {currentIndex === onboardingData.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default OnboardingScreen;