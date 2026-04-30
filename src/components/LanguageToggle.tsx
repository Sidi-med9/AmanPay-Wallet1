import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useSetLanguage } from "../context/LanguageContext";
import { DesignSystem } from "../constants/DesignSystem";
import type { AppLocale } from "../i18n/config";

type Props = { compact?: boolean };

export function LanguageToggle({ compact }: Props) {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const setLanguage = useSetLanguage();
  const [busy, setBusy] = useState(false);

  const pick = async (next: AppLocale) => {
    if (next === i18n.language || busy) return;
    setBusy(true);
    try {
      await setLanguage(next);
    } finally {
      setBusy(false);
    }
  };

  const active = (lng: AppLocale) => i18n.language === lng;

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      {busy ? <ActivityIndicator color={colors.primary} style={styles.spinner} /> : null}
      <Pressable
        onPress={() => pick("ar")}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: active("ar") ? colors.primary : isDark ? "#1E293B" : "#F1F5F9",
            borderColor: active("ar") ? colors.primary : colors.border,
            opacity: pressed ? 0.88 : 1,
          },
        ]}
        android_ripple={{ color: "rgba(0,0,0,0.08)" }}
        accessibilityRole="button"
        accessibilityLabel={t("settings.arabic")}
      >
        <Text style={[styles.pillText, { color: active("ar") ? "#FFF" : colors.text }]}>{t("settings.arabic")}</Text>
      </Pressable>
      <Pressable
        onPress={() => pick("en")}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: active("en") ? colors.primary : isDark ? "#1E293B" : "#F1F5F9",
            borderColor: active("en") ? colors.primary : colors.border,
            opacity: pressed ? 0.88 : 1,
          },
        ]}
        android_ripple={{ color: "rgba(0,0,0,0.08)" }}
        accessibilityRole="button"
        accessibilityLabel={t("settings.english")}
      >
        <Text style={[styles.pillText, { color: active("en") ? "#FFF" : colors.text }]}>{t("settings.english")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  compact: { transform: [{ scale: 0.92 }] },
  spinner: { marginRight: 4 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    minWidth: 72,
    alignItems: "center",
  },
  pillText: { fontFamily: DesignSystem.fonts.family, fontWeight: "700", fontSize: 13 },
});
