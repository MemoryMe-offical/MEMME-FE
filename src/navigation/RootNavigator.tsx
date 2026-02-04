// 전체 네비게이션 구조(Stack/Tab 등)
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';

// 네비게이션에서 사용할 화면 목록과 파라미터 타입 정의
export type RootStackParamList = {
    Home: undefined; // 파라미터 없음
}

// Stack 형태의 Navigator 생성 함수
const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
    return (
        // 일단은 Home 부터 시작
        <Stack.Navigator initialRouteName="Home">
            {/* 아래에 화면 리스트 추가 */}
            <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: "홈"}}
            />    
        </Stack.Navigator>
    )
}

export default RootNavigator;