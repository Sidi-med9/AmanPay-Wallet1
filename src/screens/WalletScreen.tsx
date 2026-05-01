import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { DesignSystem } from "../constants/DesignSystem";
import { DEFAULT_CURRENCY } from "../constants/appDefaults";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { Plus, ArrowUpRight } from "lucide-react-native";
import { CreateCategoryModal } from "../components/CreateCategoryModal";
import { LinearGradient } from "expo-linear-gradient";

export const WalletScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { dashboard, categories } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);
  const { horizontalPadding, centeredInner, insets } = useResponsiveLayout();
  const isRtl = i18n.dir() === "rtl";

  const currency = dashboard?.currency ?? DEFAULT_CURRENCY;

  if (!dashboard) return null;

  const envelopes = dashboard.envelopes || [];
  const totalEnvelopeBalance = envelopes.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0);
  const regularBalance = dashboard.balance - totalEnvelopeBalance;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: Math.max(100, insets.bottom + 80),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[centeredInner, { alignSelf: "center" }]}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("wallet.headerTitle")}
            </Text>
            <Image
              source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
              style={styles.miniAvatar}
            />
          </View>

          <View style={[styles.mainCard, { backgroundColor: isDark ? "#0C182B" : "#FFF", borderColor: colors.border }]}>
            <Text style={[styles.mainLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("wallet.totalBalance")}
            </Text>
            <View style={styles.balanceRow}>
              <Text style={[styles.mainBalance, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {dashboard.balance.toLocaleString()} {currency}
              </Text>
              <View style={styles.trendContainer}>
                <ArrowUpRight color={colors.success} size={16} />
                <Text style={[styles.trendText, { color: colors.success }]}>{t("wallet.trendPercent")}</Text>
              </View>
            </View>
            <Text style={[styles.weekText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("wallet.weekLine")}
            </Text>
          </View>

          <View style={[styles.subBalancesRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <View style={[styles.subBalanceCard, { backgroundColor: isDark ? "#0C182B" : "#FFF", borderColor: colors.border }]}>
              <Text style={[styles.subLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("wallet.envelopeTotal")}
              </Text>
              <Text style={[styles.subValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {totalEnvelopeBalance.toLocaleString()} {currency}
              </Text>
            </View>
            <View style={[styles.subBalanceCard, { backgroundColor: isDark ? "#0C182B" : "#FFF", borderColor: colors.border }]}>
              <Text style={[styles.subLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("wallet.regularBalance")}
              </Text>
              <Text style={[styles.subValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {regularBalance.toLocaleString()} {currency}
              </Text>
            </View>
          </View>

          <View style={[styles.sectionHeader, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("wallet.linkedCards")}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.cardsScroll, { flexDirection: isRtl ? "row-reverse" : "row" }]}
          >
            <LinearGradient
              colors={["#00D2D3", "#0097A7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ccCard, { borderRadius: DesignSystem.borderRadius.xl }]}
            >
              <View style={styles.ccHeader}>
                <Text style={styles.ccType}>AmanPay Visa</Text>
                <View style={styles.ccCircle} />
              </View>
              <Text style={styles.ccNumber}>0541 **** **** 8976</Text>
              <Text style={styles.ccHolder}>Ahmad Ali</Text>
            </LinearGradient>

            <TouchableOpacity style={[styles.addCardBtn, { borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl }]}>
              <Plus color={colors.secondaryText} size={24} />
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.sectionHeader, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("wallet.envelopes")}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addEnvelopeBtn}>
              <Plus color={colors.primary} size={18} />
              <Text style={[styles.addEnvelopeText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>
                {t("wallet.new")}
              </Text>
            </TouchableOpacity>
          </View>

          {envelopes.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("wallet.emptyEnvelopes")}
              </Text>
            </View>
          ) : (
            envelopes.map((env: any, index: number) => {
              const cat = categories.find((c) => c.id === env.categoryId);
              if (!cat) return null;

              return (
                <View key={index} style={[styles.envItem, { backgroundColor: isDark ? "#0C182B" : "#FFF", borderColor: colors.border }]}>
                  <View style={[styles.envTop, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: env.mode === "strict" ? colors.danger + "22" : colors.success + "22",
                          position: "relative",
                          top: 0,
                          left: 0,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: env.mode === "strict" ? colors.danger : colors.success },
                        ]}
                      >
                        {env.mode === "strict" ? t("wallet.strict") : t("wallet.flexible")}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.envSub,
                        {
                          color: colors.secondaryText,
                          textAlign: isRtl ? "right" : "left",
                          fontFamily: DesignSystem.fonts.family,
                        },
                      ]}
                    >
                      {cat.description || ""}
                    </Text>
                  </View>
                  <View style={[styles.envMain, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                    <View style={[styles.envTextCol, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
                      <Text style={[styles.envName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{cat.name}</Text>
                      <Text style={[styles.envAmount, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                        {env.balance.toLocaleString()} {currency}
                      </Text>
                    </View>
                    <View style={[styles.envIconWrap, { backgroundColor: (cat.color || colors.primary) + "15" }]}>
                      <Text style={{ color: cat.color || colors.primary, fontSize: 18 }}>{cat.name.charAt(0)}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <CreateCategoryModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  headerSpacer: { width: 36, height: 36 },
  headerTitle: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  miniAvatar: { width: 36, height: 36, borderRadius: 18 },
  mainCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, ...DesignSystem.shadows.light },
  mainLabel: { fontSize: 14, marginBottom: 8, textAlign: "center" },
  balanceRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
  mainBalance: { fontSize: 32, fontWeight: "bold" },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: { fontSize: 12, fontWeight: "bold", marginLeft: 2 },
  weekText: { fontSize: 12, textAlign: "center", marginTop: 8 },
  subBalancesRow: { gap: 12, marginBottom: 24 },
  subBalanceCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, ...DesignSystem.shadows.light },
  subLabel: { fontSize: 12, marginBottom: 4 },
  subValue: { fontSize: 16, fontWeight: "bold" },
  sectionHeader: { justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  cardsScroll: { paddingBottom: 8 },
  ccCard: { width: 260, height: 160, padding: 20, marginHorizontal: 8, justifyContent: "space-between" },
  ccHeader: { flexDirection: "row", justifyContent: "space-between" },
  ccType: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  ccCircle: { width: 40, height: 24, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)" },
  ccNumber: { color: "#FFF", fontSize: 18, letterSpacing: 2, fontWeight: "500" },
  ccHolder: { color: "#FFF", fontSize: 14, opacity: 0.9 },
  addCardBtn: { width: 60, height: 160, borderWidth: 1, borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
  addEnvelopeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addEnvelopeText: { fontSize: 14, fontWeight: "bold" },
  envItem: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    ...DesignSystem.shadows.light,
  },
  envTop: { justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  envSub: { flex: 1, marginHorizontal: 8, fontSize: 12 },
  envMain: { flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" },
  envTextCol: { flex: 1, marginEnd: 16 },
  envName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  envAmount: { fontSize: 14 },
  envIconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  emptyState: { padding: 32, alignItems: "center", borderRadius: 20, borderWidth: 1, borderStyle: "dashed" },
  emptyText: { fontSize: 14 },
});
