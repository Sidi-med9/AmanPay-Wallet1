import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { DesignSystem } from "../constants/DesignSystem";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { MapPin, Globe, ChevronLeft, ChevronRight } from "lucide-react-native";

export const SendMoneyScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { horizontalPadding, centeredInner, scaleFont, insets } = useResponsiveLayout();
  const ripple = Platform.OS === "android" ? { color: "rgba(0,0,0,0.06)" } : undefined;
  const isRtl = i18n.dir() === "rtl";
  const rowMain = useMemo(() => (isRtl ? "row-reverse" : "row") as "row" | "row-reverse", [isRtl]);
  const chevronEdge = useMemo(() => (isRtl ? { right: 18 } : { left: 18 }), [isRtl]);
  const Chevron = isRtl ? ChevronRight : ChevronLeft;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollInner,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
            flexGrow: 1,
            justifyContent: "center",
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[centeredInner, { alignSelf: "center" }]}>
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colors.text, fontFamily: DesignSystem.fonts.family, fontSize: scaleFont(23) },
              ]}
            >
              {t("sendMoney.title")}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: DesignSystem.borderRadius.xxl,
                opacity: pressed ? 0.95 : 1,
                flexDirection: rowMain,
              },
            ]}
            onPress={() => navigation.navigate("LocalTransfer")}
            android_ripple={ripple}
            accessibilityRole="button"
            accessibilityLabel={t("sendMoney.localA11y")}
          >
            <View style={[styles.cardContent, { flexDirection: rowMain }]}>
              <View style={[styles.textContainer, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.text,
                      fontFamily: DesignSystem.fonts.family,
                      fontSize: scaleFont(17),
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("sendMoney.localTitle")}
                </Text>
                <Text
                  style={[
                    styles.cardDesc,
                    {
                      color: colors.secondaryText,
                      fontFamily: DesignSystem.fonts.family,
                      fontSize: scaleFont(14),
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("sendMoney.localDesc")}
                </Text>
              </View>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + "15", marginHorizontal: 16 }]}>
                <MapPin size={28} color={colors.primary} />
              </View>
            </View>
            <Chevron color={colors.secondaryText} size={22} style={[styles.chevron, chevronEdge]} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: DesignSystem.borderRadius.xxl,
                opacity: pressed ? 0.95 : 1,
                flexDirection: rowMain,
              },
            ]}
            onPress={() => navigation.navigate("InternationalTransfer")}
            android_ripple={ripple}
            accessibilityRole="button"
            accessibilityLabel={t("sendMoney.intlA11y")}
          >
            <View style={[styles.cardContent, { flexDirection: rowMain }]}>
              <View style={[styles.textContainer, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.text,
                      fontFamily: DesignSystem.fonts.family,
                      fontSize: scaleFont(17),
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("sendMoney.intlTitle")}
                </Text>
                <Text
                  style={[
                    styles.cardDesc,
                    {
                      color: colors.secondaryText,
                      fontFamily: DesignSystem.fonts.family,
                      fontSize: scaleFont(14),
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("sendMoney.intlDesc")}
                </Text>
              </View>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + "15", marginHorizontal: 16 }]}>
                <Globe size={28} color={colors.primary} />
              </View>
            </View>
            <Chevron color={colors.secondaryText} size={22} style={[styles.chevron, chevronEdge]} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollInner: {},
  header: { marginBottom: 28 },
  title: { fontWeight: "bold", textAlign: "center" },
  card: {
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    ...DesignSystem.shadows.medium,
    alignItems: "center",
    minHeight: 96,
  },
  cardContent: { flex: 1, alignItems: "center" },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  textContainer: { flex: 1, minWidth: 0 },
  cardTitle: { fontWeight: "bold", marginBottom: 6 },
  cardDesc: { lineHeight: 20 },
  chevron: { position: "absolute", top: "50%", marginTop: -11 },
});
