import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Wallet, Send, Folder, BarChart2, Settings } from 'lucide-react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SendMoneyScreen } from '../screens/SendMoneyScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Wallet') return <Wallet color={color} size={size} />;
          if (route.name === 'Transfers') return <Send color={color} size={size} />;
          if (route.name === 'Categories') return <Folder color={color} size={size} />;
          if (route.name === 'Reports') return <BarChart2 color={color} size={size} />;
          if (route.name === 'Settings') return <Settings color={color} size={size} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.navbar,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.navbar,
        },
        headerTintColor: colors.text,
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'الرئيسية' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'المحفظة' }} />
      {/* Middle Tab for Transfers / Quick Send */}
      <Tab.Screen name="Transfers" component={SendMoneyScreen} options={{ title: 'تحويل' }} />
      <Tab.Screen name="Categories" component={CategoriesScreen} options={{ title: 'التصنيفات' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'التقارير' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'الإعدادات' }} />
    </Tab.Navigator>
  );
}
