import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from './src/context/AlertContext';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <AlertProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AlertProvider>
    </SafeAreaProvider>
  )
}

export default App;