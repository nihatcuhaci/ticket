import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import HelpScreen from '../screens/HelpScreen';
import { colors } from '../theme';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t } = useTranslation();
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
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: t.navigation.checkoutTitle }} />
        <Stack.Screen
          name="Confirmation"
          component={ConfirmationScreen}
          options={{
            title: t.navigation.confirmationTitle,
            headerBackVisible: false,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="Help" component={HelpScreen} options={{ title: t.navigation.helpTitle }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
