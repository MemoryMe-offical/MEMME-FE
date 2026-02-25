import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onboardingStyles as styles } from '../styles/OnboardingScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: '초기 동작',
    description: 'MEM-114\n체크박스와 메뉴로 쉽게 관리하세요',
    emoji: '✅',
  },
  {
    id: '2',
    title: '스플래쉬',
    description: 'MEM-115\n빠르고 간편한 접근',
    emoji: '🔗',
  },
  {
    id: '3',
    title: '온보딩',
    description: 'MEM-116\n시작하기 전 필요한 모든 것',
    emoji: '📋',
  },
];

const OnboardingScreen = ({ navigation }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      // 온보딩 완료 표시 저장
      await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('온보딩 완료 저장 실패:', error);
      navigation.replace('Main');
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles['onboarding-slide']}>
      <View style={styles['onboarding-slide-emojiContainer']}>
        <Text style={styles['onboarding-slide-emojiContainer-emoji']}>{item.emoji}</Text>
      </View>
      <Text style={styles['onboarding-slide-title']}>{item.title}</Text>
      <Text style={styles['onboarding-slide-description']}>{item.description}</Text>
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
    <View style={styles['onboarding-container']}>
      {/* Skip 버튼 */}
      <TouchableOpacity style={styles['onboarding-skipButton']} onPress={handleSkip}>
        <Text style={styles['onboarding-skipButton-text']}>건너뛰기</Text>
      </TouchableOpacity>

      {/* 온보딩 슬라이드 */}
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

      {/* 하단 영역 */}
      <View style={styles['onboarding-bottomContainer']}>
        {renderDots()}

        <TouchableOpacity style={styles['onboarding-bottomContainer-nextButton']} onPress={handleNext}>
          <Text style={styles['onboarding-bottomContainer-nextButton-text']}>
            {currentIndex === onboardingData.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;