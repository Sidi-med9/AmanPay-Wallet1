import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import i18n from "./config";
import type { AppLocale } from "./config";
import { LANGUAGE_STORAGE_KEY } from "../constants/storageKeys";

/** App default is Arabic; English only after explicit user choice (persisted). */
function pickLocale(saved: string | null): AppLocale {
  if (saved === "en" || saved === "ar") return saved;
  return "ar";
}

/** Call once before first UI (e.g. after fonts): applies saved/device locale + RTL. */
export async function hydrateLanguageFromStorage(): Promise<AppLocale> {
  const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const lng = pickLocale(saved);
  await i18n.changeLanguage(lng);
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(lng === "ar");
  return lng;
}
