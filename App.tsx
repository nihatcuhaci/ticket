import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/state/AppState';
import { NetworkGate } from './src/components/NetworkGate';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NetworkGate>
          <AppStateProvider>
            <RootNavigator />
          </AppStateProvider>
        </NetworkGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
