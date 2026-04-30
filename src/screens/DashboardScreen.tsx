import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { DesignSystem } from "../constants/DesignSystem";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { Wallet, Send, ArrowDownLeft, Eye, EyeOff, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { isTrxCompleted } from "../utils/trxStatus";

export const DashboardScreen = ({ navigation }: any) => {
  const { dashboard, transactions, isLoading, categories } = useWallet();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [balanceVisible, setBalanceVisible] = useState(true);
  const {
    scrollContentMaxWidth,
    centeredInner,
    balanceHeroFont,
    sectionTitleSize,
    envelopeCardWidth,
    hitSlop,
    scaleFont,
    insets,
  } = useResponsiveLayout();

  if (isLoading || !dashboard || !user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top + 24 }]}>
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={t("common.loading")} />
          <Text
            style={[
              styles.loadingText,
              { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family },
            ]}
          >
            {t("common.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const recentTransactions = transactions.slice(0, 5);
  const activeEnvelopes = dashboard.envelopes || [];

  const ripple = Platform.OS === "android" ? { color: "rgba(0,0,0,0.06)" } : undefined;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollOuter, scrollContentMaxWidth]}
      >
        <View style={centeredInner}>
          <View style={[styles.header, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <View style={styles.headerText}>
              <Text
                style={[
                  styles.greeting,
                  {
                    color: colors.secondaryText,
                    fontFamily: DesignSystem.fonts.family,
                    fontSize: scaleFont(16),
                    textAlign: isRtl ? "right" : "left",
                  },
                ]}
              >
                {t("dashboard.greeting", { name: user.name.split(" ")[0] })}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate("Profile")}
              hitSlop={hitSlop}
              accessibilityRole="button"
              accessibilityLabel={t("dashboard.profileA11y")}
              android_ripple={ripple}
              style={({ pressed }) => [pressed && Platform.OS === "ios" && { opacity: 0.85 }]}
            >
              <View style={[styles.avatarBorder, { borderColor: colors.primary }]}>
                <Image
                  source={{ uri: user.avatar || "https://via.placeholder.com/150" }}
                  style={styles.avatar}
                />
              </View>
            </Pressable>
          </View>

          <LinearGradient
            colors={isDark ? ["#1E293B", "#0F172A"] : ["#E0F2FE", "#F0FDFA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.balanceCard, { borderRadius: DesignSystem.borderRadius.xxl }]}
          >
            <View style={[styles.balanceHeader, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
              <Text
                style={[
                  styles.balanceLabel,
                  {
                    color: isDark ? "rgba(255,255,255,0.7)" : colors.secondaryText,
                    fontFamily: DesignSystem.fonts.family,
                    fontSize: scaleFont(15),
                    textAlign: isRtl ? "right" : "left",
                  },
                ]}
              >
                {t("dashboard.totalBalance")}
              </Text>
              <Pressable
                onPress={() => setBalanceVisible(!balanceVisible)}
                hitSlop={hitSlop}
                accessibilityRole="button"
                accessibilityLabel={balanceVisible ? t("dashboard.hideBalanceA11y") : t("dashboard.showBalanceA11y")}
                android_ripple={ripple}
              >
                {balanceVisible ? (
                  <EyeOff color={isDark ? "#fff" : colors.primary} size={22} />
                ) : (
                  <Eye color={isDark ? "#fff" : colors.primary} size={22} />
                )}
              </Pressable>
            </View>
            <Text
              style={[
                styles.balanceAmount,
                {
                  color: isDark ? "#FFF" : colors.text,
                  fontFamily: DesignSystem.fonts.family,
                  fontSize: balanceHeroFont,
                },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {balanceVisible
                ? `${dashboard.balance.toLocaleString()} ${dashboard.currency}`
                : "••••••••"}
            </Text>

            <View style={styles.cardActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() => navigation.navigate("Transfers")}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                accessibilityRole="button"
                accessibilityLabel={t("dashboard.send")}
              >
                <Send color="#FFF" size={20} />
                <Text style={[styles.actionText, { fontFamily: DesignSystem.fonts.family, fontSize: scaleFont(16) }]}>
                  {t("dashboard.send")}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,210,211,0.12)" },
                  pressed && { opacity: 0.88 },
                ]}
                onPress={() => navigation.navigate("ReceiveMoney")}
                android_ripple={ripple}
                accessibilityRole="button"
                accessibilityLabel={t("dashboard.receive")}
              >
                <ArrowDownLeft color={colors.primary} size={20} />
                <Text style={[styles.actionText, { color: colors.primary, fontFamily: DesignSystem.fonts.family, fontSize: scaleFont(16) }]}>
                  {t("dashboard.receive")}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>

          <View style={[styles.sectionHeader, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontFamily: DesignSystem.fonts.family, fontSize: sectionTitleSize },
              ]}
            >
              {t("dashboard.activeEnvelopes")}
            </Text>
            <Pressable onPress={() => navigation.navigate("Wallet")} hitSlop={hitSlop} android_ripple={ripple}>
              <Text style={[styles.viewAllText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>
                {t("dashboard.more")}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.envelopesScroll}
            decelerationRate="fast"
          >
            {activeEnvelopes.length > 0 ? (
              activeEnvelopes.map((env: any, idx: number) => {
                const cat = categories.find((c) => c.id === env.categoryId);
                return (
                  <View
                    key={idx}
                    style={[
                      styles.envCard,
                      { width: envelopeCardWidth, backgroundColor: colors.card, borderColor: colors.border },
                      { borderRadius: DesignSystem.borderRadius.xl },
                    ]}
                  >
                    <View style={styles.envHeader}>
                      <Text
                        style={[styles.envName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}
                        numberOfLines={1}
                      >
                        {cat?.name || t("dashboard.defaultEnvelope")}
                      </Text>
                      <View style={[styles.envIcon, { backgroundColor: (cat?.color || colors.primary) + "22" }]}>
                        <Text style={{ color: cat?.color || colors.primary, fontWeight: "bold" }}>
                          {cat?.name?.charAt(0)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.envProgressContainer}>
                      <View style={[styles.envProgressBar, { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
                        <View
                          style={[
                            styles.envProgressFill,
                            { backgroundColor: cat?.color || colors.primary, width: "70%" },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.envBalance, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                      {env.balance} {dashboard.currency}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Pressable
                style={[
                  styles.envCard,
                  styles.emptyEnvCard,
                  { width: envelopeCardWidth, backgroundColor: colors.card, borderColor: colors.border },
                  { borderRadius: DesignSystem.borderRadius.xl },
                ]}
                onPress={() => navigation.navigate("Categories")}
                android_ripple={ripple}
              >
                <Plus color={colors.secondaryText} size={24} />
                <Text style={[styles.emptyEnvText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                  {t("dashboard.addWallet")}
                </Text>
              </Pressable>
            )}
          </ScrollView>

          <View style={[styles.sectionHeader, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontFamily: DesignSystem.fonts.family, fontSize: sectionTitleSize },
              ]}
            >
              {t("dashboard.recentTransfers")}
            </Text>
            <Pressable onPress={() => navigation.navigate("Reports")} hitSlop={hitSlop} android_ripple={ripple}>
              <Text style={[styles.viewAllText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>
                {t("dashboard.all")}
              </Text>
            </Pressable>
          </View>

          {recentTransactions.map((trx, idx) => {
            const sentByMe =
              typeof trx.outgoing === "boolean" ? trx.outgoing : trx.sender === user.name;
            const dateLoc = i18n.language.startsWith("ar") ? "ar-SA" : "en-US";
            const done = isTrxCompleted(trx.status);
            return (
            <Pressable
              key={trx.id || idx}
              style={({ pressed }) => [
                styles.transactionItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: DesignSystem.borderRadius.xl,
                  opacity: pressed ? 0.92 : 1,
                  flexDirection: isRtl ? "row-reverse" : "row",
                },
              ]}
              android_ripple={ripple}
            >
              <View style={[styles.trxIcon, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                {sentByMe ? (
                  <Send size={18} color={colors.primary} />
                ) : (
                  <ArrowDownLeft size={18} color={colors.success} />
                )}
              </View>
              <View style={styles.trxContent}>
                <Text
                  style={[styles.trxTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign: isRtl ? "right" : "left" }]}
                  numberOfLines={1}
                >
                  {sentByMe ? trx.receiver : trx.sender}
                </Text>
                <Text style={[styles.trxDate, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign: isRtl ? "right" : "left" }]}>
                  {new Date(trx.date).toLocaleDateString(dateLoc)}
                </Text>
              </View>
              <View style={[styles.trxAmountCol, { alignItems: isRtl ? "flex-start" : "flex-end" }]}>
                <Text
                  style={[
                    styles.trxAmountText,
                    {
                      color: sentByMe ? colors.text : colors.success,
                      fontFamily: DesignSystem.fonts.family,
                      textAlign: isRtl ? "left" : "right",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {sentByMe ? "-" : "+"}
                  {trx.amount} {trx.currency}
                </Text>
                {trx.status && (
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: done ? colors.success + "22" : "#F59E0B22" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: done ? colors.success : "#F59E0B", fontFamily: DesignSystem.fonts.family },
                      ]}
                    >
                      {done ? t("common.statusCompleted") : t("common.statusPending")}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollOuter: { flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 15, marginTop: 4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerText: { flex: 1, paddingEnd: 12 },
  greeting: { fontWeight: "500" },
  avatarBorder: { borderWidth: 2, borderRadius: 28, padding: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  balanceCard: { padding: 22, marginBottom: 22, ...DesignSystem.shadows.medium },
  balanceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  balanceLabel: { fontWeight: "500" },
  balanceAmount: { fontWeight: "bold", marginBottom: 20, flexWrap: "wrap" },
  cardActions: { flexDirection: "row", gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionText: { fontWeight: "bold" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 6 },
  sectionTitle: { fontWeight: "bold" },
  viewAllText: { fontSize: 14, fontWeight: "600" },
  envelopesScroll: { paddingBottom: 10, flexDirection: "row" },
  envCard: { padding: 14, marginEnd: 12, borderWidth: 1, ...DesignSystem.shadows.light },
  emptyEnvCard: { justifyContent: "center", alignItems: "center", minHeight: 120 },
  emptyEnvText: { marginTop: 8, fontSize: 14, fontWeight: "500" },
  envHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  envName: { fontSize: 15, fontWeight: "600", flex: 1, marginEnd: 8 },
  envIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  envProgressContainer: { marginBottom: 10 },
  envProgressBar: { height: 6, borderRadius: 3, width: "100%", overflow: "hidden" },
  envProgressFill: { height: "100%", borderRadius: 3 },
  envBalance: { fontSize: 14, fontWeight: "700" },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    ...DesignSystem.shadows.light,
  },
  trxIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginEnd: 12 },
  trxContent: { flex: 1, minWidth: 0 },
  trxTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  trxDate: { fontSize: 12 },
  trxAmountCol: { alignItems: "flex-end", maxWidth: "38%" },
  trxAmountText: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "bold" },
});
