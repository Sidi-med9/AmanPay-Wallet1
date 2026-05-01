import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { DesignSystem } from "../constants/DesignSystem";
import { TrendingUp, TrendingDown, Calendar, ChevronRight, FileDown, ArrowUpRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

type UiTransaction = {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  date: string;
  status?: string;
  outgoing?: boolean;
  transferMode?: "normal" | "envelope";
};

function escapeHtml(value: string): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeFilePart(value: string): string {
  return String(value ?? "")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "-");
}

export const ReportsScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { reports, transactions } = useWallet();
  const cur = t("common.currency");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("all");
  const [downloading, setDownloading] = useState(false);
  const months = useMemo(
    () => [t("reports.m1"), t("reports.m2"), t("reports.m3"), t("reports.m4"), t("reports.m5"), t("reports.m6")],
    [t, i18n.language]
  );

  const monthOptions = useMemo(() => {
    const tx = (transactions ?? []) as UiTransaction[];
    const keys = new Set<string>();
    for (const row of tx) {
      const d = new Date(row.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      keys.add(key);
    }
    const sorted = [...keys].sort((a, b) => (a > b ? -1 : 1));
    return [
      { key: "all", label: t("reports.monthAll") },
      ...sorted.map((key) => {
        const [year, month] = key.split("-");
        const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
          i18n.language.startsWith("ar") ? "ar-SA" : "en-US",
          { month: "long", year: "numeric" }
        );
        return { key, label };
      }),
    ];
  }, [transactions, i18n.language, t]);

  const selectedMonthLabel = monthOptions.find((m) => m.key === selectedMonthKey)?.label ?? t("reports.monthAll");

  const filteredTransactions = useMemo(() => {
    const tx = (transactions ?? []) as UiTransaction[];
    if (selectedMonthKey === "all") return tx;
    return tx.filter((row) => {
      const d = new Date(row.date);
      if (Number.isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === selectedMonthKey;
    });
  }, [transactions, selectedMonthKey]);

  const monthStats = useMemo(() => {
    let totalSent = 0;
    let totalReceived = 0;
    let envelopeCount = 0;
    for (const row of filteredTransactions) {
      const amount = Number(row.amount) || 0;
      if (row.outgoing) totalSent += amount;
      else totalReceived += amount;
      if (row.transferMode === "envelope") envelopeCount += 1;
    }
    return {
      totalSent,
      totalReceived,
      transfersCount: filteredTransactions.length,
      envelopeCount,
    };
  }, [filteredTransactions]);

  if (!reports) return null;
  const chartSentColor = isDark ? "#60A5FA" : "#2563EB";
  const chartReceivedColor = isDark ? "#34D399" : "#059669";
  const chartOtherColor = isDark ? "#FBBF24" : "#D97706";

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const rowsHtml = filteredTransactions
        .map((tx) => {
          const who = tx.outgoing ? `${tx.sender} → ${tx.receiver}` : `${tx.sender} → ${tx.receiver}`;
          const amount = `${tx.outgoing ? "-" : "+"}${Number(tx.amount || 0).toFixed(2)} ${escapeHtml(tx.currency || cur)}`;
          const mode = tx.transferMode === "envelope" ? t("reports.modeEnvelope") : t("reports.modeNormal");
          const date = new Date(tx.date).toLocaleDateString(i18n.language.startsWith("ar") ? "ar-SA" : "en-US");
          return `<tr>
            <td>${escapeHtml(tx.id)}</td>
            <td>${escapeHtml(who)}</td>
            <td>${escapeHtml(mode)}</td>
            <td>${escapeHtml(amount)}</td>
            <td>${escapeHtml(date)}</td>
          </tr>`;
        })
        .join("");
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color:#0f172a; }
              .brand { display:flex; align-items:center; gap:10px; margin-bottom: 10px; }
              .brand-mark { width:34px; height:34px; border-radius:17px; background:#0ea5e9; color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; }
              .brand-name { font-size:16px; font-weight:800; color:#0f172a; }
              .brand-sub { font-size:11px; color:#64748b; margin-top:2px; }
              h1 { margin: 0 0 8px 0; font-size: 24px; }
              .meta { margin-bottom: 14px; color:#475569; }
              .cards { display:flex; gap:10px; margin: 16px 0; }
              .card { border:1px solid #cbd5e1; border-radius:10px; padding:10px 12px; min-width:170px; }
              .k { font-size:12px; color:#64748b; }
              .v { font-size:18px; font-weight:700; color:#0f172a; margin-top:4px; }
              table { width:100%; border-collapse: collapse; margin-top: 12px; }
              th, td { border:1px solid #e2e8f0; padding:8px; font-size:12px; text-align:left; }
              th { background:#f8fafc; }
            </style>
          </head>
          <body>
            <div class="brand">
              <div class="brand-mark">AP</div>
              <div>
                <div class="brand-name">AmanPay</div>
                <div class="brand-sub">${escapeHtml(t("reports.brandSubtitle"))}</div>
              </div>
            </div>
            <h1>${escapeHtml(t("reports.title"))}</h1>
            <div class="meta">${escapeHtml(t("reports.monthLabel"))}: ${escapeHtml(selectedMonthLabel)}</div>
            <div class="cards">
              <div class="card"><div class="k">${escapeHtml(t("reports.totalSent"))}</div><div class="v">${monthStats.totalSent.toFixed(2)} ${escapeHtml(cur)}</div></div>
              <div class="card"><div class="k">${escapeHtml(t("reports.totalReceived"))}</div><div class="v">${monthStats.totalReceived.toFixed(2)} ${escapeHtml(cur)}</div></div>
              <div class="card"><div class="k">${escapeHtml(t("reports.transactionsCount"))}</div><div class="v">${monthStats.transfersCount}</div></div>
            </div>
            <h2>${escapeHtml(t("reports.transactionsSectionTitle"))}</h2>
            <table>
              <thead>
                <tr>
                  <th>${escapeHtml(t("reports.colRef"))}</th>
                  <th>${escapeHtml(t("reports.colParties"))}</th>
                  <th>${escapeHtml(t("reports.colType"))}</th>
                  <th>${escapeHtml(t("reports.colAmount"))}</th>
                  <th>${escapeHtml(t("reports.colDate"))}</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || `<tr><td colspan="5">${escapeHtml(t("reports.noTransactions"))}</td></tr>`}
              </tbody>
            </table>
          </body>
        </html>
      `;
      if (Platform.OS === "web") {
        // Web: open browser print dialog (user can "Save as PDF")
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      const now = new Date();
      const reportWord = sanitizeFilePart(t("reports.fileWord"));
      const monthWord = sanitizeFilePart(
        selectedMonthKey === "all" ? t("reports.monthAll") : selectedMonthLabel
      );
      const yearWord = sanitizeFilePart(
        selectedMonthKey === "all" ? String(now.getFullYear()) : selectedMonthKey.split("-")[0] || String(now.getFullYear())
      );
      const appName = "AmanPay";
      const fileName = `${reportWord}-${monthWord}-${yearWord}-${appName}.pdf`;
      const targetUri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: targetUri });

      const openPrompt = () =>
        new Promise<"share" | "open" | "cancel">((resolve) => {
          Alert.alert(
            t("reports.pdfReadyTitle"),
            t("reports.pdfReadyMessage", { fileName }),
            [
              { text: t("common.cancel"), style: "cancel", onPress: () => resolve("cancel") },
              { text: t("reports.openOption"), onPress: () => resolve("open") },
              { text: t("reports.shareOption"), onPress: () => resolve("share") },
            ],
            { cancelable: true, onDismiss: () => resolve("cancel") }
          );
        });

      const action = await openPrompt();
      const canShare = await Sharing.isAvailableAsync();
      if (action === "share" && canShare) {
        await Sharing.shareAsync(targetUri, {
          mimeType: "application/pdf",
          dialogTitle: t("reports.sharePdfTitle"),
          UTI: "com.adobe.pdf",
        });
        return;
      }
      if (action === "open") {
        // Opens native print/open flow where user can also save as PDF.
        await Print.printAsync({ uri: targetUri });
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? `${t("reports.pdfFailed")}\n\n${err.message}` : t("reports.pdfFailed");
      Alert.alert(t("common.error"), message);
    } finally {
      setDownloading(false);
    }
  };

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
                {selectedMonthLabel}
              </Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsRow}>
            {monthOptions.map((option) => {
              const selected = option.key === selectedMonthKey;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => setSelectedMonthKey(option.key)}
                  style={[
                    styles.monthChip,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary + "18" : colors.card,
                    },
                  ]}
                >
                  <Text style={{ color: selected ? colors.primary : colors.text, fontFamily: DesignSystem.fonts.family }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <LinearGradient
            colors={isDark ? ["#111827", "#1F2937"] : ["#EFF6FF", "#F0F9FF"]}
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
              {monthStats.totalSent.toLocaleString()} {cur}
            </Text>
            <View style={styles.trendRow}>
              <ArrowUpRight size={14} color={colors.success} />
              <Text style={[styles.trendText, { color: colors.success }]}>{t("reports.trendUp")}</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={isDark ? ["#0B1F1A", "#132A24"] : ["#ECFDF5", "#F7FEF9"]}
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
              {monthStats.totalReceived.toLocaleString()} {cur}
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
              <View style={[styles.legendDot, { backgroundColor: chartSentColor }]} />
              <Text style={[styles.legendText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.legendSent")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: chartReceivedColor }]} />
              <Text style={[styles.legendText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("reports.legendReceived")}
              </Text>
            </View>
          </View>

          <View style={styles.mockBarChart}>
            {[40, 60, 45, 75, 50, 85].map((h, i) => (
              <View key={i} style={styles.barGroup}>
                <View style={[styles.bar, { height: h, backgroundColor: chartSentColor, borderRadius: 4 }]} />
                <View style={[styles.bar, { height: h * 0.7, backgroundColor: chartReceivedColor, borderRadius: 4 }]} />
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
                <View style={[styles.catDot, { backgroundColor: chartSentColor }]} />
                <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("reports.foodPct")}
                </Text>
              </View>
              <View style={styles.catItem}>
                <View style={[styles.catDot, { backgroundColor: chartReceivedColor }]} />
                <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("reports.eduPct")}
                </Text>
              </View>
              <View style={styles.catItem}>
                <View style={[styles.catDot, { backgroundColor: chartOtherColor }]} />
                <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("reports.otherPct")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDownloadPdf}
          disabled={downloading}
          style={[styles.downloadBtn, { backgroundColor: colors.primary, borderRadius: DesignSystem.borderRadius.xl, opacity: downloading ? 0.7 : 1 }]}
        >
          <FileDown color="#FFF" size={20} />
          <Text style={[styles.downloadText, { color: "#FFF", fontFamily: DesignSystem.fonts.family }]}>
            {downloading ? t("reports.downloadingPdf") : t("reports.downloadReport")}
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
  monthsRow: { gap: 8, marginTop: 10, paddingHorizontal: 2 },
  monthChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
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
