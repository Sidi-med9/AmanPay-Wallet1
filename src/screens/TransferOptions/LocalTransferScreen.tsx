import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { DesignSystem } from "../../constants/DesignSystem";
import { DEFAULT_CURRENCY } from "../../constants/appDefaults";
import { TRANSFER_AUTH_MODE_KEY } from "../../constants/storageKeys";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Wallet, Folder, User, Banknote } from "lucide-react-native";
import { ThemedMessageDialog } from "../../components/ThemedMessageDialog";
import { getMyCategoryWallets, lookupTransferRecipient, type RecipientLookup, verifyTransferPassword } from "../../services/amanpayApi";
import { LinearGradient } from "expo-linear-gradient";

type LocalAuthModule = {
  hasHardwareAsync: () => Promise<boolean>;
  isEnrolledAsync: () => Promise<boolean>;
  authenticateAsync: (options: {
    promptMessage: string;
    cancelLabel?: string;
    fallbackLabel?: string;
  }) => Promise<{ success: boolean }>;
};

const getLocalAuth = (): LocalAuthModule | null => {
  try {
    return require("expo-local-authentication") as LocalAuthModule;
  } catch {
    return null;
  }
};

export const LocalTransferScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { dashboard } = useWallet();
  const isRtl = i18n.dir() === "rtl";
  const textAlign = isRtl ? "right" : "left";
  const rowRev = isRtl ? "row-reverse" : "row";
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "biometric">("password");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [mode, setMode] = useState<"normal" | "envelope">("normal");
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);
  const [resolvedRecipientName, setResolvedRecipientName] = useState<string | null>(null);
  const [resolvedRecipient, setResolvedRecipient] = useState<RecipientLookup | null>(null);
  const [resolvingRecipient, setResolvingRecipient] = useState(false);
  const [paymentSource, setPaymentSource] = useState<"main" | "category_wallet">("main");
  const [merchantCategoryWalletOption, setMerchantCategoryWalletOption] = useState<{
    available: boolean;
    categoryId: string;
    categoryLabel: string;
    totalAmount: number;
  } | null>(null);
  const availableMainBalance = Number(dashboard?.mainBalance ?? dashboard?.balance ?? 0);

  const mapMerchantCategoryCodeToWalletCategory = (code?: string | null): { id: string; label: string } | null => {
    const normalized = (code ?? "").trim().toUpperCase();
    if (normalized === "AL" || normalized === "ALL") return { id: "general", label: t("auth.merchantCategoryAll") };
    if (normalized === "FO") return { id: "food", label: t("envelopes.categoryFood") };
    if (normalized === "TR") return { id: "transportation", label: t("envelopes.categoryTransportation") };
    if (normalized === "PC") return { id: "personal_care", label: t("envelopes.categoryPersonalCare") };
    if (normalized === "HO") return { id: "household", label: t("envelopes.categoryHousehold") };
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        const localAuth = getLocalAuth();
        if (!localAuth) {
          setBiometricAvailable(false);
          setAuthMode("password");
          return;
        }
        const [hasHardware, enrolled, storedMode] = await Promise.all([
          localAuth.hasHardwareAsync(),
          localAuth.isEnrolledAsync(),
          AsyncStorage.getItem(TRANSFER_AUTH_MODE_KEY),
        ]);
        const available = hasHardware && enrolled;
        setBiometricAvailable(available);
        setAuthMode(available && storedMode === "biometric" ? "biometric" : "password");
      } catch {
        setBiometricAvailable(false);
        setAuthMode("password");
      }
    })();
  }, []);

  const continueTransfer = () => {
    if (mode === "envelope") {
      navigation.navigate("Envelopes", { receiver: receiver.trim(), amount, type: "local", receiverName: resolvedRecipientName });
    } else {
      navigation.navigate("Success", {
        receiver: receiver.trim(),
        receiverName: resolvedRecipientName,
        receiverDbUserId: resolvedRecipient?.dbUserId ?? null,
        amount,
        type: "local",
        transferMode: "normal",
        paymentSource,
      });
    }
  };

  const confirmWithPassword = async () => {
    if (!password.trim()) {
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.passwordRequired") });
      return;
    }
    setConfirming(true);
    try {
      const ok = await verifyTransferPassword(user?.email || user?.phone || "", password);
      if (!ok) {
        setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.badPassword") });
        return;
      }
      setConfirmVisible(false);
      setPassword("");
      continueTransfer();
    } finally {
      setConfirming(false);
    }
  };

  const confirmWithBiometric = async () => {
    if (!biometricAvailable) {
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.biometricUnavailable") });
      return;
    }
    setConfirming(true);
    try {
      const localAuth = getLocalAuth();
      if (!localAuth) {
        setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.biometricUnavailable") });
        return;
      }
      const result = await localAuth.authenticateAsync({
        promptMessage: t("transfersLocal.biometricPrompt"),
        cancelLabel: t("common.cancel"),
        fallbackLabel: t("transfersLocal.usePassword"),
      });
      if (!result.success) return;
      setConfirmVisible(false);
      setPassword("");
      continueTransfer();
    } finally {
      setConfirming(false);
    }
  };

  const handleNext = async () => {
    const amountNum = Number.parseFloat(amount);
    const available = Number(dashboard?.mainBalance ?? dashboard?.balance ?? 0);
    if (!receiver.trim() || !amount.trim()) {
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.fillReceiverAmount") });
      return;
    }
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.invalidAmount") });
      return;
    }
    if (amountNum > available) {
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.insufficientBalance") });
      return;
    }
    setResolvingRecipient(true);
    const lookup = await lookupTransferRecipient(receiver.trim());
    setResolvingRecipient(false);
    if (!lookup) {
      setResolvedRecipient(null);
      setResolvedRecipientName(null);
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.recipientNotFound") });
      return;
    }
    if (String(user?.dbUserId ?? "") === String(lookup.dbUserId)) {
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.recipientSelf") });
      return;
    }
    if (mode === "envelope" && (lookup.role ?? "").toLowerCase() === "merchant") {
      setDialog({ title: t("dialog.errorTitle"), message: t("transfersLocal.recipientMerchantEnvelopeBlocked") });
      return;
    }
    let nextMerchantOption: {
      available: boolean;
      categoryId: string;
      categoryLabel: string;
      totalAmount: number;
    } | null = null;
    if (mode === "normal" && (lookup.role ?? "").toLowerCase() === "merchant") {
      const merchantWalletCategory = mapMerchantCategoryCodeToWalletCategory(lookup.merchantCategory);
      if (merchantWalletCategory) {
        const rows = await getMyCategoryWallets();
        const row = rows.find((r) => r.category === merchantWalletCategory.id);
        const totalWalletAmount = (Number.parseFloat(row?.dynamicBalance ?? "0") || 0) + (Number.parseFloat(row?.strictBalance ?? "0") || 0);
        if (totalWalletAmount >= amountNum) {
          nextMerchantOption = {
            available: true,
            categoryId: merchantWalletCategory.id,
            categoryLabel: merchantWalletCategory.label,
            totalAmount: totalWalletAmount,
          };
        }
      }
    }
    setMerchantCategoryWalletOption(nextMerchantOption);
    setPaymentSource("main");
    setResolvedRecipient(lookup);
    setResolvedRecipientName(lookup.fullName || lookup.email);
    setConfirmVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedMessageDialog
        visible={!!dialog}
        title={dialog?.title ?? ""}
        message={dialog?.message ?? ""}
        onDismiss={() => setDialog(null)}
        variant="error"
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("transfersLocal.title")}
            </Text>
          </View>

          <LinearGradient
            colors={isDark ? ["#0B1F1A", "#132A24"] : ["#ECFDF5", "#F7FEF9"]}
            style={[styles.balanceInfoCard, { borderRadius: DesignSystem.borderRadius.xl }]}
          >
            <Text
              style={[
                styles.balanceInfoLabel,
                { fontFamily: DesignSystem.fonts.family, color: isDark ? "rgba(236,254,255,0.75)" : "#334155" },
              ]}
            >
              {t("wallet.regularBalance")}
            </Text>
            <Text
              style={[
                styles.balanceInfoValue,
                { fontFamily: DesignSystem.fonts.family, color: isDark ? "#ECFEFF" : "#0F172A" },
              ]}
            >
              {availableMainBalance.toLocaleString()} {DEFAULT_CURRENCY}
            </Text>
          </LinearGradient>

          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
              {t("transfersLocal.receiver")}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: DesignSystem.borderRadius.lg,
                  flexDirection: rowRev as "row" | "row-reverse",
                },
              ]}
            >
              <View style={[styles.inputIconWrap, { backgroundColor: colors.primary + "12" }]}>
                <User size={18} color={colors.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}
                placeholder={t("transfersLocal.receiverPh")}
                placeholderTextColor={colors.secondaryText}
                value={receiver}
                onChangeText={(value) => {
                  setReceiver(value);
                  setResolvedRecipient(null);
                  setResolvedRecipientName(null);
                }}
              />
            </View>
            <Text style={[styles.lookupHint, { color: colors.secondaryText, textAlign, fontFamily: DesignSystem.fonts.family }]}>
              {resolvingRecipient ? t("transfersLocal.recipientResolving") : t("transfersLocal.recipientLookupHint")}
            </Text>
            {resolvedRecipient ? (
              <View
                style={[
                  styles.recipientCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary,
                    borderRadius: DesignSystem.borderRadius.lg,
                  },
                ]}
              >
                <View style={styles.recipientHeader}>
                  <Text style={[styles.recipientBadge, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>
                    {t("transfersLocal.recipientResolved")}
                  </Text>
                </View>
                <Text style={[styles.recipientName, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                  {resolvedRecipient.fullName}
                </Text>
                <Text
                  style={[styles.recipientMeta, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}
                >
                  {resolvedRecipient.referenceId} • {resolvedRecipient.phone || resolvedRecipient.email}
                </Text>
                {resolvedRecipient.merchantCategory ? (
                  <Text
                    style={[styles.recipientMeta, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}
                  >
                    {t("transfersLocal.recipientCategory")}: {resolvedRecipient.merchantCategory}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
              {t("transfersLocal.amountLabel", { currency: DEFAULT_CURRENCY })}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: DesignSystem.borderRadius.lg,
                  flexDirection: rowRev as "row" | "row-reverse",
                },
              ]}
            >
              <View style={[styles.inputIconWrap, { backgroundColor: colors.primary + "12" }]}>
                <Banknote size={18} color={colors.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}
                placeholder="0.00"
                placeholderTextColor={colors.secondaryText}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
            {t("transfersLocal.modeTitle")}
          </Text>

          <TouchableOpacity
            style={[
              styles.modeCard,
              {
                backgroundColor: colors.card,
                borderColor: mode === "normal" ? colors.primary : colors.border,
                borderRadius: DesignSystem.borderRadius.xl,
                flexDirection: rowRev as "row" | "row-reverse",
              },
              mode === "normal" && { ...DesignSystem.shadows.light, backgroundColor: isDark ? "#0C182B" : "#F0FDFA" },
            ]}
            onPress={() => setMode("normal")}
          >
            <View style={[styles.iconBox, { backgroundColor: mode === 'normal' ? colors.primary + '15' : colors.border }]}>
              <Wallet size={22} color={mode === 'normal' ? colors.primary : colors.secondaryText} />
            </View>
            <View style={[styles.modeText, isRtl ? { marginRight: 16, marginLeft: 0 } : { marginLeft: 16, marginRight: 0 }]}>
              <Text style={[styles.modeTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                {t("transfersLocal.normalTitle")}
              </Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                {t("transfersLocal.normalDesc")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeCard,
              {
                backgroundColor: colors.card,
                borderColor: mode === "envelope" ? colors.primary : colors.border,
                borderRadius: DesignSystem.borderRadius.xl,
                flexDirection: rowRev as "row" | "row-reverse",
              },
              mode === "envelope" && { ...DesignSystem.shadows.light, backgroundColor: isDark ? "#0C182B" : "#F0FDFA" },
            ]}
            onPress={() => setMode("envelope")}
          >
            <View style={[styles.iconBox, { backgroundColor: mode === 'envelope' ? colors.primary + '15' : colors.border }]}>
              <Folder size={22} color={mode === 'envelope' ? colors.primary : colors.secondaryText} />
            </View>
            <View style={[styles.modeText, isRtl ? { marginRight: 16, marginLeft: 0 } : { marginLeft: 16, marginRight: 0 }]}>
              <Text style={[styles.modeTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                {t("transfersLocal.envelopeTitle")}
              </Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                {t("transfersLocal.envelopeDesc")}
              </Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            title={resolvingRecipient ? t("transfersLocal.recipientResolving") : t("transfersLocal.next")}
            onPress={handleNext}
            disabled={!receiver || !amount || resolvingRecipient}
            style={{ height: 60 }}
          />
        </View>
      </KeyboardAvoidingView>
      <Modal visible={confirmVisible} animationType="fade" transparent onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
              {t("transfersLocal.confirmTitle")}
            </Text>
            <Text style={[styles.modalDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
              {t("transfersLocal.confirmSubtitle")}
            </Text>
            {resolvedRecipientName ? (
              <Text style={[styles.modalDesc, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                {t("transfersLocal.recipientName")}: {resolvedRecipientName}
              </Text>
            ) : null}
            {merchantCategoryWalletOption?.available ? (
              <View style={styles.paymentSourceWrap}>
                <Text style={[styles.modalDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                  {t("transfersLocal.merchantPaymentSourceTitle")}
                </Text>
                <View style={[styles.paymentSourceRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                  <TouchableOpacity
                    onPress={() => setPaymentSource("main")}
                    style={[
                      styles.paymentSourceChip,
                      {
                        borderColor: paymentSource === "main" ? colors.primary : colors.border,
                        backgroundColor: paymentSource === "main" ? colors.primary + "14" : colors.background,
                      },
                    ]}
                  >
                    <Text style={{ color: paymentSource === "main" ? colors.primary : colors.text }}>
                      {t("transfersLocal.payWithMainWallet")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPaymentSource("category_wallet")}
                    style={[
                      styles.paymentSourceChip,
                      {
                        borderColor: paymentSource === "category_wallet" ? colors.primary : colors.border,
                        backgroundColor: paymentSource === "category_wallet" ? colors.primary + "14" : colors.background,
                      },
                    ]}
                  >
                    <Text style={{ color: paymentSource === "category_wallet" ? colors.primary : colors.text }}>
                      {t("transfersLocal.payWithCategoryWallet", {
                        category: merchantCategoryWalletOption.categoryLabel,
                        amount: merchantCategoryWalletOption.totalAmount.toLocaleString(),
                        currency: DEFAULT_CURRENCY,
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {authMode === "biometric" ? (
              <PrimaryButton
                title={t("transfersLocal.confirmByBiometric")}
                onPress={confirmWithBiometric}
                loading={confirming}
                style={{ height: 54, marginTop: 8 }}
              />
            ) : null}

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign,
                  borderRadius: DesignSystem.borderRadius.lg,
                },
              ]}
              placeholder={t("auth.passwordPlaceholder")}
              placeholderTextColor={colors.secondaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <PrimaryButton
              title={authMode === "biometric" ? t("transfersLocal.usePassword") : t("transfersLocal.confirmPasswordBtn")}
              onPress={confirmWithPassword}
              loading={confirming}
              style={{ height: 54 }}
            />

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmVisible(false)} disabled={confirming}>
              <Text style={[styles.cancelText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 20, fontWeight: 'bold' },
  balanceInfoCard: { paddingVertical: 14, paddingHorizontal: 16, marginBottom: 20 },
  balanceInfoLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  balanceInfoValue: { fontSize: 22, color: "#FFF", fontWeight: "700" },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputWrapper: { alignItems: "center", height: 60, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
  inputIconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  input: { flex: 1, height: '100%', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 24, marginBottom: 16 },
  modeCard: { alignItems: "center", padding: 20, borderWidth: 1, marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modeText: { flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  modeDesc: { fontSize: 12, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  modalCard: { borderWidth: 1, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  modalDesc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  modalInput: { height: 56, borderWidth: 1, paddingHorizontal: 16, fontSize: 16, marginVertical: 12 },
  cancelBtn: { paddingVertical: 10, alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "600" },
  lookupHint: { fontSize: 12, marginTop: 8 },
  recipientCard: { marginTop: 10, borderWidth: 1, padding: 12 },
  recipientHeader: { marginBottom: 4 },
  recipientBadge: { fontSize: 12, fontWeight: "700" },
  recipientName: { fontSize: 16, fontWeight: "700" },
  recipientMeta: { marginTop: 2, fontSize: 12 },
  paymentSourceWrap: { marginBottom: 10 },
  paymentSourceRow: { gap: 10 },
  paymentSourceChip: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9 },
});
