// 전체 네비게이션 구조(Stack/Tab 등)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainScreen from '../screens/MainScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import TermsScreen from '../screens/Termsscreen';
import BoardPostDetailScreen from '../screens/BoardPostDetailScreen';
import { BoardPost } from '../types/chatBoard.type';
import EncryptionTestScreen from '../screens/EncryptionTestScreen';
import DevicePairingScreen from '../screens/DevicePairingScreen';

// 네비게이션에서 사용할 화면 목록과 파라미터 타입 정의
export type RootStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Main: undefined;
    Login: undefined;
    Signup: undefined;
    Terms: undefined;
    BoardPostDetail: {
        post: BoardPost;
        subItemId?: string;
        onSave?: (updated: BoardPost) => void;
    };
    EncryptionTest: undefined;
    DevicePairing: undefined;
}

// Stack 형태의 Navigator 생성 함수
const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    return (
        <Stack.Navigator 
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false, // 모든 화면의 헤더 숨김
            }}
        >
            {/* 스플래시 화면 */}
            <Stack.Screen
                name="Splash"
                component={SplashScreen}
            />
            
            {/* 온보딩 화면 */}
            <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
            />

             {/* 로그인 화면 */}
             <Stack.Screen
                name="Login"
                component={LoginScreen}
            />

             {/* 회원가입 화면 */}
             <Stack.Screen
                name="Signup"
                component={SignupScreen}
            />
            
             {/* 이용약관 화면 */}
             <Stack.Screen
                name="Terms"
                component={TermsScreen}
            />
            
            {/* 메인 화면 */}
            <Stack.Screen
                name="Main"
                component={MainScreen}
            />

            {/* 게시물 상세 화면 */}
            <Stack.Screen
                name="BoardPostDetail"
                component={BoardPostDetailScreen}
            />

            <Stack.Screen
                name="EncryptionTest"
                component={EncryptionTestScreen}
                options={{ title: '암호화 테스트' }}
            />

            <Stack.Screen
                name="DevicePairing"
                component={DevicePairingScreen}
                options={{ title: '기기 페어링' }}
            />
        </Stack.Navigator>
    )
}

export default RootNavigator;