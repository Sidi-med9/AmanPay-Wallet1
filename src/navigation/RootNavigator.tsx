import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { SendMoneyScreen } from '../screens/SendMoneyScreen';
import { LocalTransferScreen } from '../screens/TransferOptions/LocalTransferScreen';
import { InternationalTransferScreen } from '../screens/TransferOptions/InternationalTransferScreen';
import { ReceiveScreen } from '../screens/ReceiveScreen';
import { EnvelopesScreen } from '../screens/EnvelopesScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Group screenOptions={{ 
              headerShown: true,
              headerStyle: { backgroundColor: colors.navbar },
              headerTintColor: colors.text,
              headerTitleAlign: 'center',
            }}>
              <Stack.Screen name="SendMoney" component={SendMoneyScreen} options={{ title: 'إرسال المال' }} />
              <Stack.Screen name="ReceiveMoney" component={ReceiveScreen} options={{ title: 'استلام الأموال' }} />
              <Stack.Screen name="LocalTransfer" component={LocalTransferScreen} options={{ title: 'تحويل محلي' }} />
              <Stack.Screen name="InternationalTransfer" component={InternationalTransferScreen} options={{ title: 'تحويل دولي' }} />
              <Stack.Screen name="Envelopes" component={EnvelopesScreen} options={{ title: 'المحافظ الموثوقة' }} />
              <Stack.Screen name="Success" component={SuccessScreen} options={{ title: 'الإيصال', headerShown: false }} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
