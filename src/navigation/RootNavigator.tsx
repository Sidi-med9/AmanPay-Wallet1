import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { SendMoneyScreen } from "../screens/SendMoneyScreen";
import { LocalTransferScreen } from "../screens/TransferOptions/LocalTransferScreen";
import { InternationalTransferScreen } from "../screens/TransferOptions/InternationalTransferScreen";
import { ReceiveScreen } from "../screens/ReceiveScreen";
import { EnvelopesScreen } from "../screens/EnvelopesScreen";
import { SuccessScreen } from "../screens/SuccessScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { ONBOARDING_DONE_KEY } from "../constants/storageKeys";
import { useTheme } from "../context/ThemeContext";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
        setOnboardingSeen(seen === "1");
      } catch (e) {
        console.warn("Onboarding flag read failed:", e);
        setOnboardingSeen(false);
      }
    })();
  }, []);

  if (onboardingSeen == null) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={!user ? (onboardingSeen ? "Auth" : "Onboarding") : "Main"}
      >
        {!user ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Group
              screenOptions={({ navigation }) => ({
                headerShown: true,
                headerStyle: { backgroundColor: colors.navbar },
                headerTintColor: colors.text,
                headerTitleAlign: "center",
                headerShadowVisible: false,
                headerBackTitleVisible: false,
                headerLeft: () =>
                  navigation.canGoBack() ? (
                    <Pressable
                      onPress={navigation.goBack}
                      hitSlop={12}
                      style={{ paddingHorizontal: 6, paddingVertical: 4 }}
                    >
                      {isRtl ? <ChevronRight color={colors.text} size={22} /> : <ChevronLeft color={colors.text} size={22} />}
                    </Pressable>
                  ) : null,
              })}
            >
              <Stack.Screen name="SendMoney" component={SendMoneyScreen} options={{ title: t("sendMoney.title") }} />
              <Stack.Screen name="ReceiveMoney" component={ReceiveScreen} options={{ title: t("receive.title") }} />
              <Stack.Screen name="LocalTransfer" component={LocalTransferScreen} options={{ title: t("transfersLocal.title") }} />
              <Stack.Screen
                name="InternationalTransfer"
                component={InternationalTransferScreen}
                options={{ title: t("transfersIntl.title") }}
              />
              <Stack.Screen name="Envelopes" component={EnvelopesScreen} options={{ title: t("wallet.envelopes") }} />
              <Stack.Screen name="Success" component={SuccessScreen} options={{ title: t("success.title"), headerShown: false }} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
