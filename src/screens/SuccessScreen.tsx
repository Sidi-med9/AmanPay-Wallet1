import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { DesignSystem } from "../constants/DesignSystem";
import { isApiConfigured } from "../config/api";
import { lookupTransferRecipient, recordTransferFromSuccess } from "../services/amanpayApi";
import { DEFAULT_CURRENCY } from "../constants/appDefaults";
import { TRX_STATUS_COMPLETED } from "../utils/trxStatus";
import { PrimaryButton } from "../components/PrimaryButton";
import { ThemedMessageDialog } from "../components/ThemedMessageDialog";
import { CheckCircle2, Download, Share2, Copy } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

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

export const SuccessScreen = ({ route, navigation }: any) => {
  const {
    receiver,
    receiverName,
    receiverDbUserId,
    amount,
    type,
    intermediaryId,
    transferMode,
    envelopeMode,
    envelopes,
    paymentSource,
  } =
    route.params || {};
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { addTransaction, intermediaries, refreshData } = useWallet();
  const { user } = useAuth();
  const dateLoc = i18n.language.startsWith("ar") ? "ar-SA" : "en-US";

  const [loading, setLoading] = useState(true);
  const [trxId, setTrxId] = useState("");
  const [displayReceiver, setDisplayReceiver] = useState(String(receiverName || receiver || ""));
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);
  const [transferFailed, setTransferFailed] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  const buildReceipt = async (): Promise<string> => {
    if (receiptUri) return receiptUri;
    const txDate = new Date();
    const transferTypeLabel = type === "local" ? t("transfersLocal.title") : t("success.typeIntl");
    const amountValue = `${parseFloat(amount).toFixed(2)} ${DEFAULT_CURRENCY}`;
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#f1f5f9; margin:0; padding:24px; color:#0f172a; }
            .sheet { max-width: 760px; margin:0 auto; background:#ffffff; border:1px solid #dbeafe; border-radius:20px; overflow:hidden; }
            .hero { background: linear-gradient(135deg, #0ea5e9, #2563eb); color:#fff; padding:22px 24px 26px 24px; }
            .brand { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
            .brand-left { display:flex; align-items:center; gap:10px; }
            .logo { width:36px; height:36px; border-radius:18px; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; }
            .brand-name { font-weight:800; font-size:17px; }
            .receipt-tag { font-size:12px; padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.2); }
            .title { font-size:24px; font-weight:800; margin:0 0 6px 0; }
            .subtitle { font-size:13px; opacity:0.9; margin:0; }
            .amount-card { margin-top:16px; background:rgba(255,255,255,0.16); border:1px solid rgba(255,255,255,0.28); border-radius:14px; padding:12px 14px; }
            .amount-label { font-size:12px; opacity:0.9; margin-bottom:4px; }
            .amount-value { font-size:29px; font-weight:800; letter-spacing:0.3px; }
            .content { padding:22px 24px; }
            .status-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
            .status { display:inline-flex; align-items:center; gap:8px; font-size:12px; color:#166534; background:#dcfce7; border:1px solid #86efac; border-radius:999px; padding:6px 10px; font-weight:700; }
            .status-dot { width:8px; height:8px; border-radius:4px; background:#16a34a; }
            .date { font-size:12px; color:#64748b; }
            .grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
            .cell { border:1px solid #e2e8f0; border-radius:12px; padding:10px 12px; background:#f8fafc; min-height:72px; }
            .k { color:#64748b; font-size:11px; text-transform:uppercase; letter-spacing:0.45px; margin-bottom:6px; }
            .v { color:#0f172a; font-size:15px; font-weight:700; line-height:1.3; word-break:break-word; }
            .full { grid-column:1 / -1; }
            .footer { border-top:1px dashed #cbd5e1; margin-top:16px; padding-top:12px; display:flex; justify-content:space-between; gap:10px; }
            .foot-note { font-size:11px; color:#64748b; }
            .foot-brand { font-size:12px; color:#0f172a; font-weight:700; }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="hero">
              <div class="brand">
                <div class="brand-left">
                  <div class="logo">AP</div>
                  <div class="brand-name">AmanPay</div>
                </div>
                <div class="receipt-tag">${escapeHtml(t("success.receiptTag"))}</div>
              </div>
              <h1 class="title">${escapeHtml(t("success.title"))}</h1>
              <p class="subtitle">${escapeHtml(t("success.receiptSubtitle"))}</p>
              <div class="amount-card">
                <div class="amount-label">${escapeHtml(t("reports.colAmount"))}</div>
                <div class="amount-value">${escapeHtml(amountValue)}</div>
              </div>
            </div>
            <div class="content">
              <div class="status-row">
                <div class="status"><span class="status-dot"></span>${escapeHtml(t("common.statusCompleted"))}</div>
                <div class="date">${escapeHtml(t("success.date"))}: ${escapeHtml(txDate.toLocaleDateString(dateLoc))}</div>
              </div>
              <div class="grid">
                <div class="cell full">
                  <div class="k">${escapeHtml(t("success.receiver"))}</div>
                  <div class="v">${escapeHtml(displayReceiver)}</div>
                </div>
                <div class="cell">
                  <div class="k">${escapeHtml(t("success.type"))}</div>
                  <div class="v">${escapeHtml(transferTypeLabel)}</div>
                </div>
                <div class="cell">
                  <div class="k">${escapeHtml(t("success.trxId"))}</div>
                  <div class="v">${escapeHtml(trxId)}</div>
                </div>
              </div>
              <div class="footer">
                <div class="foot-note">${escapeHtml(t("success.receiptFooterNote"))}</div>
                <div class="foot-brand">AmanPay</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    if (Platform.OS === "web") {
      await Print.printAsync({ html });
      return "";
    }
    const { uri } = await Print.printToFileAsync({ html });
    const now = new Date();
    const fileName = `${sanitizeFilePart(t("success.receiptFileWord"))}-${sanitizeFilePart(
      String(now.getMonth() + 1).padStart(2, "0")
    )}-${sanitizeFilePart(String(now.getFullYear()))}-AmanPay.pdf`;
    const targetUri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}${fileName}`;
    await FileSystem.copyAsync({ from: uri, to: targetUri });
    setReceiptUri(targetUri);
    return targetUri;
  };

  const handleShare = async () => {
    try {
      const uri = await buildReceipt();
      if (Platform.OS === "web") return;
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert(t("common.error"), t("success.receiptShareUnavailable"));
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: t("success.share"),
      });
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("success.receiptFailed"));
    }
  };

  const handleDownload = async () => {
    try {
      const uri = await buildReceipt();
      if (Platform.OS === "web") return;
      await Print.printAsync({ uri });
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("success.receiptFailed"));
    }
  };

  useEffect(() => {
    const processTransfer = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const amt = String(amount ?? "0");
      const recv = String(receiver ?? "");

      let newTrxId = "AMN-" + Math.floor(Math.random() * 1000000);

      if (isApiConfigured()) {
        const recipient = await lookupTransferRecipient(recv);
        if (recipient?.fullName) {
          setDisplayReceiver(recipient.fullName);
        }
        const r = await recordTransferFromSuccess({
          type: type ?? "local",
          transferMode,
          envelopeMode,
          envelopes,
          receiver: recv,
          amount: amt,
          receiverDbUserId:
            typeof receiverDbUserId === "number" && Number.isInteger(receiverDbUserId) ? receiverDbUserId : null,
          intermediaryId: intermediaryId ?? null,
          paymentSource: paymentSource === "category_wallet" ? "category_wallet" : "main",
        });
        newTrxId = r.id;
        if (r.recorded) {
          setDisplayReceiver(r.receiverName || String(receiverName || recv));
          await refreshData();
        } else {
          setTransferFailed(true);
          setDialog({
            title: t("dialog.errorTitle"),
            message: r.errorMessage || "Transfer failed and was not saved. Please retry.",
          });
          setLoading(false);
          return;
        }
      } else {
        await addTransaction({
          id: newTrxId,
          type,
          sender: user?.name,
          receiver: recv,
          amount: parseFloat(amt),
          currency: DEFAULT_CURRENCY,
          date: new Date().toISOString(),
          status: TRX_STATUS_COMPLETED,
          outgoing: true,
          transferMode,
          envelopeMode,
          intermediary: intermediaryId
            ? intermediaries.find((i) => String(i.id) === String(intermediaryId))?.name
            : null,
        });
      }

      setTrxId(newTrxId);
      setLoading(false);
    };
    processTransfer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on success
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
          {t("success.processing")}
        </Text>
      </View>
    );
  }

  if (transferFailed) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedMessageDialog
          visible={!!dialog}
          title={dialog?.title ?? ""}
          message={dialog?.message ?? ""}
          onDismiss={() => setDialog(null)}
          variant="error"
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.successTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {t("success.failedTitle")}
          </Text>
          <Text
            style={[
              styles.loadingText,
              { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign: "center" },
            ]}
          >
            {t("success.failedDescription")}
          </Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            title={t("success.backToTransfer")}
            onPress={() => navigation.goBack()}
            style={{ height: 60 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedMessageDialog
        visible={!!dialog}
        title={dialog?.title ?? ""}
        message={dialog?.message ?? ""}
        onDismiss={() => {
          setDialog(null);
          navigation.goBack();
        }}
        variant="error"
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDark ? ["#0F172A", "#1E293B"] : ["#ECFDF5", "#F0FDFA"]}
          style={[styles.headerCard, { borderRadius: DesignSystem.borderRadius.xxl }]}
        >
          <View style={[styles.checkContainer, { backgroundColor: colors.success + "15" }]}>
            <CheckCircle2 size={60} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {t("success.title")}
          </Text>
          <Text style={[styles.amountText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {parseFloat(amount).toLocaleString()} {DEFAULT_CURRENCY}
          </Text>
        </LinearGradient>

        <View
          style={[
            styles.detailsCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xxl },
          ]}
        >
          <View style={styles.detailRow}>
            <Text style={[styles.detailValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {displayReceiver}
            </Text>
            <Text style={[styles.detailLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("success.receiver")}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {new Date().toLocaleDateString(dateLoc)}
            </Text>
            <Text style={[styles.detailLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("success.date")}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <TouchableOpacity style={styles.copyBtn}>
              <Copy size={14} color={colors.primary} />
              <Text style={[styles.detailValue, { color: colors.text, fontFamily: DesignSystem.fonts.family, marginRight: 8 }]}>
                {trxId}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.detailLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("success.trxId")}
            </Text>
          </View>

        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Share2 color={colors.text} size={20} />
            <Text style={[styles.actionLabel, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("success.share")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownload}
            style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Download color={colors.text} size={20} />
            <Text style={[styles.actionLabel, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("success.download")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title={t("success.done")} onPress={() => navigation.navigate("Main")} style={{ height: 60 }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: "500" },
  scrollContent: { padding: 24, paddingBottom: 120 },
  headerCard: { alignItems: "center", marginTop: 16, marginBottom: 24, paddingVertical: 24, paddingHorizontal: 16 },
  checkContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  amountText: { fontSize: 36, fontWeight: "bold" },
  detailsCard: { padding: 24, borderWidth: 1, ...DesignSystem.shadows.light },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 16, fontWeight: "600" },
  divider: { height: 1, width: "100%" },
  copyBtn: { flexDirection: "row", alignItems: "center" },
  actionsRow: { flexDirection: "row", gap: 16, marginTop: 24 },
  secondaryAction: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  actionLabel: { fontSize: 16, fontWeight: "600" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
});
