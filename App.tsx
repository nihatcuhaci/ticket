import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/state/AppState';
import { NetworkGate } from './src/components/NetworkGate';
import { SplashIntro } from './src/components/SplashIntro';

/**
 * SplashIntro renders as an absolute overlay on top of the real app rather
 * than gating NetworkGate/RootNavigator's mount — that way first-render
 * data fetches (exchange rates, network status) start immediately behind
 * the animation instead of waiting for it to finish first.
 */
function AppRoot() {
  const [introVisible, setIntroVisible] = useState(true);
  return (
    <View style={{ flex: 1 }}>
      <NetworkGate>
        <RootNavigator />
      </NetworkGate>
      {introVisible && <SplashIntro onFinish={() => setIntroVisible(false)} />}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppStateProvider>
          <AppRoot />
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
