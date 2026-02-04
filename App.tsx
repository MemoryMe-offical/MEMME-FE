import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    // 앱 시작 시 NavigationContainer -> RootNavigator -> initialRoute 페이지로 이동
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  )
}

export default App;