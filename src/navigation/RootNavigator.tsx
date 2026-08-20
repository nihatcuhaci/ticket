import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.offWhite,
    primary: colors.navy800,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.navy900,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Özet' }} />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{
            title: 'Yönlendirme',
            headerBackVisible: false,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
