import React, { useEffect, useRef } from 'react';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import analytics from '@react-native-firebase/analytics';
import { AlertProvider } from './src/context/AlertContext';
import RootNavigator from './src/navigation/RootNavigator';
import { logScreenView } from './src/utils/analytics';
import useInAppUpdate from './src/hooks/useInAppUpdate';

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  useInAppUpdate();

  useEffect(() => {
    analytics().setAnalyticsCollectionEnabled(true);
  }, []);

  const onNavigationReady = () => {
    routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
  };

  const onNavigationStateChange = async () => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    if (previousRouteName !== currentRouteName && currentRouteName) {
      // 화면 조회 기록
      await logScreenView(currentRouteName);
    }

    routeNameRef.current = currentRouteName;
  };

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={onNavigationReady}
          onStateChange={onNavigationStateChange}
        >
          <RootNavigator />
        </NavigationContainer>
      </AlertProvider>
    </SafeAreaProvider>
  )
}

export default App;