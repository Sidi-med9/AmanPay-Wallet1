import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Wallet,
  Send,
  PieChart,
  User,
  LayoutGrid,
} from "lucide-react-native";
import { View, StyleSheet, Platform, useWindowDimensions } from "react-native";

import { DashboardScreen } from "../screens/DashboardScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { CategoriesScreen } from "../screens/CategoriesScreen";
import { ReportsScreen } from "../screens/ReportsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SendMoneyScreen } from "../screens/SendMoneyScreen";
import { useTheme } from "../context/ThemeContext";
import { DesignSystem } from "../constants/DesignSystem";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const { tabBarHeight, tabBarPaddingBottom, scaleFont, isCompact } = useResponsiveLayout();

  const iconSize = isCompact ? 22 : width >= 768 ? 26 : 24;
  const labelSize = scaleFont(isCompact ? 9 : 10);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let icon;
          if (route.name === "Home")
            icon = (
              <LayoutGrid color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />
            );
          else if (route.name === "Wallet")
            icon = <Wallet color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === "Transfers")
            icon = <Send color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === "Reports")
            icon = <PieChart color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === "Profile")
            icon = <User color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;

          return (
            <View style={styles.iconContainer}>
              {icon}
              {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? "#94A3B8" : "#64748B",
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontFamily: DesignSystem.fonts.family,
          fontSize: labelSize,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 2 : 4,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingTop: 4,
          paddingBottom: tabBarPaddingBottom,
          ...DesignSystem.shadows.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: t("tabs.home") }} />
      <Tab.Screen name="Transfers" component={SendMoneyScreen} options={{ title: t("tabs.transfers") }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: t("tabs.wallet") }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: t("tabs.reports") }} />
      <Tab.Screen name="Profile" component={SettingsScreen} options={{ title: t("tabs.profile") }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
