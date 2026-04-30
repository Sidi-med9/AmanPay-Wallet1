import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";
import { useTheme } from "../context/ThemeContext";
import { PrimaryButton } from "../components/PrimaryButton";
import { DesignSystem } from "../constants/DesignSystem";
import { LANGUAGE_STORAGE_KEY, ONBOARDING_DONE_KEY } from "../constants/storageKeys";

export function OnboardingScreen({ navigation }: any) {
  const { t, i18n: i18next } = useTranslation();
  const { colors } = useTheme();
  const isRtl = i18next.dir() === "rtl";
  const pulse = useRef(new Animated.Value(0)).current;
  const sendA = useRef(new Animated.Value(0)).current;
  const sendB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(sendA, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sendA, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.delay(260),
        Animated.timing(sendB, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sendB, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [sendA, sendB]);

  const setLang = async (next: "ar" | "en") => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    await i18n.changeLanguage(next);
  };

  const continueToAuth = async () => {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, "1");
    navigation.replace("Auth");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.brand, { color: colors.primary }]}>AmanPay</Text>

        <Animated.View
          style={[
            styles.hero,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }),
            },
          ]}
        >
          <View style={[styles.wallet, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <View style={[styles.walletSlot, { backgroundColor: colors.primary + "25" }]} />
            <View style={[styles.walletLabel, { backgroundColor: colors.primary }]} />
          </View>
          <View style={[styles.wallet, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <View style={[styles.walletSlot, { backgroundColor: colors.success + "25" }]} />
            <View style={[styles.walletLabel, { backgroundColor: colors.success }]} />
          </View>

          <Animated.View
            style={[
              styles.token,
              {
                backgroundColor: colors.warning,
                transform: [
                  { translateX: sendA.interpolate({ inputRange: [0, 1], outputRange: [0, -62] }) },
                  { translateY: sendA.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
                  { scale: sendA.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 0.95, 0.7] }) },
                ],
                opacity: sendA.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.token,
              {
                backgroundColor: colors.primary,
                transform: [
                  { translateX: sendB.interpolate({ inputRange: [0, 1], outputRange: [0, 62] }) },
                  { translateY: sendB.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
                  { scale: sendB.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 0.95, 0.7] }) },
                ],
                opacity: sendB.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              },
            ]}
          />
        </Animated.View>

        <Text style={[styles.title, { color: colors.text, textAlign: isRtl ? "right" : "left" }]}>
          {t("onboarding.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText, textAlign: isRtl ? "right" : "left" }]}>
          {t("onboarding.subtitle")}
        </Text>

        <View style={[styles.langRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
          <PrimaryButton title={t("settings.arabic")} onPress={() => setLang("ar")} style={styles.langBtn} />
          <PrimaryButton title={t("settings.english")} onPress={() => setLang("en")} style={styles.langBtn} />
        </View>

        <PrimaryButton title={t("onboarding.cta")} onPress={continueToAuth} style={styles.cta} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  brand: { fontSize: 34, fontWeight: "800", textAlign: "center", marginBottom: 18 },
  hero: {
    height: 160,
    borderRadius: DesignSystem.borderRadius.xxl,
    borderWidth: 1,
    marginBottom: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 14,
    position: "relative",
    ...DesignSystem.shadows.medium,
  },
  wallet: {
    width: 90,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  walletSlot: {
    width: 46,
    height: 10,
    borderRadius: 999,
    marginBottom: 10,
  },
  walletLabel: {
    width: 34,
    height: 6,
    borderRadius: 999,
  },
  token: {
    position: "absolute",
    top: 50,
    width: 16,
    height: 16,
    borderRadius: 999,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 23, marginBottom: 26 },
  langRow: { gap: 10, marginBottom: 18 },
  langBtn: { flex: 1 },
  cta: { marginTop: 8 },
});
