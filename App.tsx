import React, { useEffect, useState } from "react";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { WalletProvider } from "./src/context/WalletContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_600SemiBold, Rubik_700Bold } from "@expo-google-fonts/rubik";
import { hydrateLanguageFromStorage } from "./src/i18n/hydrateLanguage";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Rubik: Rubik_400Regular,
    "Rubik-Medium": Rubik_500Medium,
    "Rubik-SemiBold": Rubik_600SemiBold,
    "Rubik-Bold": Rubik_700Bold,
  });
  const [bootReady, setBootReady] = useState(false);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    let cancelled = false;
    (async () => {
      try {
        if (fontError) {
          console.warn("Font loading failed, continuing app boot:", fontError);
        }
        await hydrateLanguageFromStorage();
      } catch (e) {
        console.warn("Boot language hydration failed:", e);
      } finally {
        if (!cancelled) {
          setBootReady(true);
          try {
            await SplashScreen.hideAsync();
          } catch {
            // Ignore splash hide failures so app can still render.
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fontsLoaded, fontError]);

  if ((!fontsLoaded && !fontError) || !bootReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <WalletProvider>
              <StatusBarContent />
              <RootNavigator />
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const StatusBarContent = () => {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
};
