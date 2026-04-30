import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
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

export const SuccessScreen = ({ route, navigation }: any) => {
  const { receiver, receiverName, receiverDbUserId, amount, type, intermediaryId, transferMode, envelopeMode, envelopes } =
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
          receiver: recv,
          amount: amt,
          receiverDbUserId:
            typeof receiverDbUserId === "number" && Number.isInteger(receiverDbUserId) ? receiverDbUserId : null,
          intermediaryId: intermediaryId ?? null,
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
        <View style={styles.header}>
          <View style={[styles.checkContainer, { backgroundColor: colors.success + "15" }]}>
            <CheckCircle2 size={60} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {t("success.title")}
          </Text>
          <Text style={[styles.amountText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {parseFloat(amount).toLocaleString()} {DEFAULT_CURRENCY}
          </Text>
        </View>

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

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {type === "local" ? t("success.typeLocal") : t("success.typeIntl")}
            </Text>
            <Text style={[styles.detailLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("success.type")}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Share2 color={colors.text} size={20} />
            <Text style={[styles.actionLabel, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("success.share")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
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
  header: { alignItems: "center", marginTop: 40, marginBottom: 40 },
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
