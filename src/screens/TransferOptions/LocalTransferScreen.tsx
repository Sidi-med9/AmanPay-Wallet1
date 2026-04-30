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
import { lookupTransferRecipient, type RecipientLookup, verifyTransferPassword } from "../../services/amanpayApi";

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
    const available = Number(dashboard?.balance ?? 0);
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
              <User size={20} color={colors.primary} />
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
              <Banknote size={20} color={colors.primary} />
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
            title={t("transfersLocal.next")}
            onPress={handleNext}
            disabled={!receiver || !amount}
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
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputWrapper: { alignItems: "center", height: 60, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
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
});
