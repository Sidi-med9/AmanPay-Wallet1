import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Wallet, Send, Folder, BarChart2, User, LayoutGrid, ReceiptText, PieChart } from 'lucide-react-native';
import { View, StyleSheet, Platform } from 'react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SendMoneyScreen } from '../screens/SendMoneyScreen';
import { useTheme } from '../context/ThemeContext';
import { DesignSystem } from '../constants/DesignSystem';

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Home') icon = <LayoutGrid color={color} size={24} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Wallet') icon = <Wallet color={color} size={24} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Transfers') icon = <Send color={color} size={24} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Reports') icon = <PieChart color={color} size={24} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Profile') icon = <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />;

          return (
            <View style={styles.iconContainer}>
              {icon}
              {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: DesignSystem.fonts.family,
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: 10,
          ...DesignSystem.shadows.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'الرئيسية' }} />
      <Tab.Screen name="Transfers" component={SendMoneyScreen} options={{ title: 'إرسال' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'المحفظة' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'التقارير' }} />
      <Tab.Screen name="Profile" component={SettingsScreen} options={{ title: 'حسابي' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  }
});
