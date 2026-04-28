import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { I18nManager } from 'react-native';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { SendMoneyScreen } from './src/screens/SendMoneyScreen';
import { RouteScreen } from './src/screens/RouteScreen';
import { EnvelopesScreen } from './src/screens/EnvelopesScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Force RTL for Arabic
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F2C59',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'لوحة التحكم' }} 
        />
        <Stack.Screen 
          name="SendMoney" 
          component={SendMoneyScreen} 
          options={{ title: 'إرسال المال' }} 
        />
        <Stack.Screen 
          name="Route" 
          component={RouteScreen} 
          options={{ title: 'مسار التحويل' }} 
        />
        <Stack.Screen 
          name="Envelopes" 
          component={EnvelopesScreen} 
          options={{ title: 'المحافظ الموثوقة' }} 
        />
        <Stack.Screen 
          name="Success" 
          component={SuccessScreen} 
          options={{ title: 'الإيصال', headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
