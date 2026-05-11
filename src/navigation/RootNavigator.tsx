// 전체 네비게이션 구조(Stack/Tab 등)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainScreen from '../screens/MainScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import TermsScreen from '../screens/Termsscreen';
import BoardDetailScreen from '../screens/BoardDetailScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import MediaGalleryScreen from '../screens/MediaGalleryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DevicePairingScreen from '../screens/DevicePairingScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { Board, Note, TimelineItem } from '../types';

// 네비게이션에서 사용할 화면 목록과 파라미터 타입 정의
export type RootStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Main: undefined;
    Login: undefined;
    Signup: undefined;
    Terms: undefined;
    BoardDetail: {
        board: Board;
        noteId?: string;
        onSave?: (updated: Board) => void;
        startEditing?: boolean;
    };
    NoteDetail: {
        note: Note | null;
        boardId: string;
        boardTitle?: string;
        isNew?: boolean;
    };
    MediaGallery: {
        items: TimelineItem[];
        galleryType: 'images' | 'videos' | 'files' | 'links' | 'bookmarks';
    };
    Settings: undefined;
    EncryptionTest: undefined;
    DevicePairing: undefined;
    ForgotPassword: undefined;
}

// Stack 형태의 Navigator 생성 함수
const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Main" component={MainScreen} />

            {/* 보드 상세 화면 */}
            <Stack.Screen name="BoardDetail" component={BoardDetailScreen} />

            {/* 노트 상세 화면 */}
            <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />

            {/* 미디어 갤러리 화면 */}
            <Stack.Screen name="MediaGallery" component={MediaGalleryScreen} />

            {/* 설정 화면 */}
            <Stack.Screen name="Settings" component={SettingsScreen} />

            <Stack.Screen name="DevicePairing" component={DevicePairingScreen} options={{ title: '기기 페어링' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: '비밀번호 찾기' }} />
        </Stack.Navigator>
    );
};

export default RootNavigator;
