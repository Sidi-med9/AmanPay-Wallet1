import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { LoginScreen } from "../screens/Auth/LoginScreen";
import { RegisterScreen } from "../screens/Auth/RegisterScreen";
import { useTheme } from "../context/ThemeContext";

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const isRtl = i18n.dir() === "rtl";
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.navbar },
        headerTintColor: colors.text,
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerLeft: () =>
          navigation.canGoBack() ? (
            <Pressable onPress={navigation.goBack} hitSlop={12} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
              {isRtl ? <ChevronRight color={colors.text} size={22} /> : <ChevronLeft color={colors.text} size={22} />}
            </Pressable>
          ) : null,
      })}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t("auth.registerTitle") }} />
    </Stack.Navigator>
  );
}
