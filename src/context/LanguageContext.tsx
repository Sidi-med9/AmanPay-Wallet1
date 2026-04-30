import React, { createContext, useCallback, useContext } from "react";
import { I18nManager, DevSettings } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import i18n from "../i18n/config";
import type { AppLocale } from "../i18n/config";
import { LANGUAGE_STORAGE_KEY } from "../constants/storageKeys";

type LanguageContextValue = {
  setLanguage: (next: AppLocale) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const setLanguage = useCallback(async (next: AppLocale) => {
    if (next === i18n.language) return;
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    await i18n.changeLanguage(next);
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(next === "ar");
    try {
      if (__DEV__) {
        DevSettings.reload();
        return;
      }
      await Updates.reloadAsync();
    } catch {
      DevSettings.reload();
    }
  }, []);

  return <LanguageContext.Provider value={{ setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useSetLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useSetLanguage must be used within LanguageProvider");
  }
  return ctx.setLanguage;
}
