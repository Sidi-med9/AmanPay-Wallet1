import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navbar },
        headerTintColor: colors.text,
        headerTitleAlign: 'center',
        headerBackVisible: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'إنشاء حساب' }} />
    </Stack.Navigator>
  );
}
