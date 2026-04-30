import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { DesignSystem } from "../constants/DesignSystem";
import { TrendingUp, TrendingDown, Calendar, ChevronRight, FileDown, ArrowUpRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export const ReportsScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { reports } = useWallet();
  const cur = t("common.currency");
  const months = useMemo(
    () => [t("reports.m1"), t("reports.m2"), t("reports.m3"), t("reports.m4"), t("reports.m5"), t("reports.m6")],
    [t, i18n.language]
  );

  if (!reports) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {t("reports.title")}
          </Text>
          <View style={styles.headerRow}>
            <View style={[styles.datePicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Calendar size={18} color={colors.secondaryText} />
              <Text style={[styles.dateText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.date")}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <LinearGradient
            colors={isDark ? ["#0C182B", "#1E293B"] : ["#E0F2FE", "#F0FDFA"]}
            style={[styles.statCard, { borderRadius: DesignSystem.borderRadius.xl, borderColor: colors.border }]}
          >
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: colors.primary + "20" }]}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.totalSent")}
              </Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {reports.totalSent.toLocaleString()} {cur}
            </Text>
            <View style={styles.trendRow}>
              <ArrowUpRight size={14} color={colors.success} />
              <Text style={[styles.trendText, { color: colors.success }]}>{t("reports.trendUp")}</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ["#0C182B", "#1E293B"] : ["#ECFDF5", "#F0FDF4"]}
            style={[styles.statCard, { borderRadius: DesignSystem.borderRadius.xl, borderColor: colors.border }]}
          >
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: colors.success + "20" }]}>
                <TrendingDown size={20} color={colors.success} />
              </View>
              <Text style={[styles.statLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.totalReceived")}
              </Text>
            </View>
            <Text style={[styles.statValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {reports.totalReceived.toLocaleString()} {cur}
            </Text>
            <View style={styles.trendRow}>
              <ArrowUpRight size={14} color={colors.success} />
              <Text style={[styles.trendText, { color: colors.success }]}>{t("reports.trendUpShort")}</Text>
            </View>
          </LinearGradient>
        </ScrollView>

        <View
          style={[
            styles.chartContainer,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xxl },
          ]}
        >
          <Text style={[styles.chartTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {t("reports.chartTitle")}
          </Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.legendText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.legendSent")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.legendReceived")}
              </Text>
            </View>
          </View>

          <View style={styles.mockBarChart}>
            {[40, 60, 45, 75, 50, 85].map((h, i) => (
              <View key={i} style={styles.barGroup}>
                <View style={[styles.bar, { height: h, backgroundColor: colors.primary, borderRadius: 4 }]} />
                <View style={[styles.bar, { height: h * 0.7, backgroundColor: colors.success, borderRadius: 4 }]} />
              </View>
            ))}
          </View>
          <View style={styles.chartLabels}>
            {months.map((m, i) => (
              <Text key={i} style={[styles.labelMonth, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {m}
              </Text>
            ))}
          </View>
        </View>

        <View
          style={[
            styles.categorySection,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xxl },
          ]}
        >
          <View style={styles.catHeader}>
            <Text style={[styles.catTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("reports.categoryUsage")}
            </Text>
            <ChevronRight color={colors.secondaryText} size={20} />
          </View>

          <View style={styles.mockDonutContainer}>
            <View style={[styles.mockDonut, { borderColor: colors.primary }]}>
              <View
                style={[
                  styles.donutSegment,
                  { borderTopColor: colors.success, transform: [{ rotate: "45deg" }] },
                ]}
              />
              <Text style={[styles.donutCenterText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.donutLabel")}
              </Text>
            </View>
            <View style={styles.catList}>
              <View style={styles.catItem}>
                <View style={[styles.catDot, { backgroundColor: "#3B82F6" }]} />
                <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("reports.foodPct")}
                </Text>
              </View>
              <View style={styles.catItem}>
                <View style={[styles.catDot, { backgroundColor: "#10B981" }]} />
                <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("reports.eduPct")}
                </Text>
              </View>
              <View style={styles.catItem}>
                <View style={[styles.catDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("reports.otherPct")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: colors.primary, borderRadius: DesignSystem.borderRadius.xl }]}>
          <FileDown color="#FFF" size={20} />
          <Text style={[styles.downloadText, { color: "#FFF", fontFamily: DesignSystem.fonts.family }]}>
            {t("reports.downloadReport")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "center", width: "100%" },
  datePicker: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, gap: 8 },
  dateText: { fontSize: 14, fontWeight: "600" },
  statsScroll: { paddingBottom: 8, gap: 16 },
  statCard: { width: 220, padding: 20, borderWidth: 1, ...DesignSystem.shadows.light },
  statHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  statLabel: { fontSize: 14, fontWeight: "500" },
  statValue: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  trendText: { fontSize: 10, fontWeight: "bold" },
  chartContainer: { padding: 20, marginBottom: 20, borderWidth: 1, ...DesignSystem.shadows.light },
  chartTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  chartLegend: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 20 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
  mockBarChart: { height: 120, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 10 },
  barGroup: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  bar: { width: 12 },
  chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  labelMonth: { fontSize: 10 },
  categorySection: { padding: 20, marginBottom: 24, borderWidth: 1, ...DesignSystem.shadows.light },
  catHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  catTitle: { fontSize: 16, fontWeight: "bold" },
  mockDonutContainer: { flexDirection: "row", alignItems: "center", gap: 24 },
  mockDonut: { width: 100, height: 100, borderRadius: 50, borderWidth: 10, justifyContent: "center", alignItems: "center" },
  donutSegment: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "transparent",
  },
  donutCenterText: { fontSize: 18, fontWeight: "bold" },
  catList: { flex: 1, gap: 12 },
  catItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: 13, fontWeight: "500" },
  downloadBtn: { height: 60, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, ...DesignSystem.shadows.medium },
  downloadText: { fontSize: 18, fontWeight: "bold" },
});
