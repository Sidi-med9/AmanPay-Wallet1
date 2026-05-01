import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { DesignSystem } from "../constants/DesignSystem";
import { DEFAULT_CURRENCY } from "../constants/appDefaults";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { Plus, ArrowUpRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { moveFlexibleWalletToMain } from "../services/amanpayApi";

export const WalletScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { dashboard, categories, refreshData } = useWallet();
  const [selectedEnvelope, setSelectedEnvelope] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { horizontalPadding, centeredInner, insets } = useResponsiveLayout();
  const isRtl = i18n.dir() === "rtl";

  const currency = dashboard?.currency ?? DEFAULT_CURRENCY;

  if (!dashboard) return null;

  const envelopes = dashboard.envelopes || [];
  const totalEnvelopeBalance = envelopes.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0);
  const mainBalance = Number(dashboard.mainBalance ?? dashboard.balance ?? 0);
  const regularBalance = mainBalance;

  const closeActionModal = () => {
    if (actionLoading) return;
    setSelectedEnvelope(null);
  };

  const getWalletBalances = (env: any) => {
    const dynamicAmount = Number(env?.dynamicBalance || 0);
    const strictAmount = Number(env?.strictBalance || 0);
    return {
      dynamicAmount,
      strictAmount,
      isEmpty: dynamicAmount <= 0 && strictAmount <= 0,
    };
  };

  const getCategoryMeta = (categoryId: string) => {
    switch (categoryId) {
      case "food":
        return { label: t("envelopes.categoryFood"), icon: "🍽️" };
      case "transportation":
        return { label: t("envelopes.categoryTransportation"), icon: "🚌" };
      case "personal_care":
        return { label: t("envelopes.categoryPersonalCare"), icon: "💗" };
      case "household":
        return { label: t("envelopes.categoryHousehold"), icon: "🏠" };
      default:
        return { label: categoryId, icon: "🏷️" };
    }
  };

  const handleMoveFlexible = async () => {
    if (!selectedEnvelope) return;
    const amount = Number(selectedEnvelope.dynamicBalance || 0);
    if (amount <= 0) {
      Alert.alert(t("common.error"), t("wallet.noFlexibleBalance"));
      return;
    }
    try {
      setActionLoading(true);
      await moveFlexibleWalletToMain(selectedEnvelope.categoryId, amount);
      await refreshData();
      setSelectedEnvelope(null);
      Alert.alert(t("common.success"), t("wallet.flexibleMoved"));
    } catch {
      Alert.alert(t("common.error"), t("wallet.flexibleMoveFailed"));
    } finally {
      setActionLoading(false);
    }
  };

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
          <View style={[styles.header, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <View style={styles.backBtnPlaceholder} />
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
                {mainBalance.toLocaleString()} {currency}
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
              const categoryMeta = getCategoryMeta(env.categoryId);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    const state = getWalletBalances(env);
                    if (state.isEmpty) return;
                    setSelectedEnvelope(env);
                  }}
                  style={[styles.envItem, { backgroundColor: isDark ? "#0C182B" : "#FFF", borderColor: colors.border }]}
                  disabled={getWalletBalances(env).isEmpty}
                >
                  <View style={[styles.envTop, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
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
                      {cat.description || (getWalletBalances(env).isEmpty ? t("wallet.emptyWallet") : t("wallet.tapToManage"))}
                    </Text>
                  </View>
                  <View style={[styles.envMain, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                    <View style={[styles.envTextCol, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
                      <Text style={[styles.envName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{categoryMeta.label}</Text>
                      <Text style={[styles.envAmount, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                        {env.balance.toLocaleString()} {currency}
                      </Text>
                      <Text style={[styles.envAmount, { color: colors.success, fontFamily: DesignSystem.fonts.family }]}>
                        {t("wallet.flexibleLabel")}: {(env.dynamicBalance || 0).toLocaleString()} {currency}
                      </Text>
                      <Text style={[styles.envAmount, { color: colors.danger, fontFamily: DesignSystem.fonts.family }]}>
                        {t("wallet.strictLabel")}: {(env.strictBalance || 0).toLocaleString()} {currency}
                      </Text>
                    </View>
                    <View style={[styles.envIconWrap, { backgroundColor: (cat?.color || colors.primary) + "25" }]}>
                      <Text style={styles.categoryEmoji}>{categoryMeta.icon}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={!!selectedEnvelope} transparent animationType="fade" onRequestClose={closeActionModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeActionModal} />
          <View style={[styles.actionSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.actionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("wallet.manageWallet")}
            </Text>
            <Text style={[styles.actionSubtitle, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("wallet.manageWalletSubtitle")}
            </Text>
            {Number(selectedEnvelope?.dynamicBalance || 0) > 0 ? (
              <TouchableOpacity
                disabled={actionLoading}
                onPress={handleMoveFlexible}
                style={[styles.actionBtn, { backgroundColor: colors.success + "20", borderColor: colors.success }]}
              >
                <Text style={[styles.actionBtnText, { color: colors.success }]}>{t("wallet.moveFlexibleToMain")}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.actionSubtitle, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("wallet.strictWalletLockedHint")}
              </Text>
            )}
            <TouchableOpacity disabled={actionLoading} onPress={closeActionModal} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.secondaryText }]}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1 },
  header: { justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  backBtnPlaceholder: { width: 32 },
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
  categoryEmoji: { fontSize: 22 },
  emptyState: { padding: 32, alignItems: "center", borderRadius: 20, borderWidth: 1, borderStyle: "dashed" },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  actionSheet: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  actionTitle: { fontSize: 18, fontWeight: "700" },
  actionSubtitle: { fontSize: 13 },
  actionBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  actionBtnText: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { textAlign: "center", fontSize: 14, fontWeight: "600" },
});
