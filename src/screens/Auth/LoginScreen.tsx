import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { DesignSystem } from "../../constants/DesignSystem";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Fingerprint, Lock, Mail } from "lucide-react-native";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { ThemedMessageDialog } from "../../components/ThemedMessageDialog";
import { mapAuthErrorToDialog } from "../../utils/mapAuthError";

export function LoginScreen({ navigation }: any) {
  const { signIn, signInWithBiometric, canBiometricLogin, isLoading } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { horizontalPadding, centeredInner, scaleFont, insets, hitSlop } = useResponsiveLayout();
  const isRtl = i18n.dir() === "rtl";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const textAlign = useMemo(() => (isRtl ? "right" : "left"), [isRtl]);

  const handleLogin = async () => {
    setSubmitted(true);
    const nextErrors: { identifier?: string; password?: string } = {};
    const id = identifier.trim();
    if (!id) {
      nextErrors.identifier = t("auth.fieldRequired");
    } else if (!id.includes("@") && id.replace(/\D/g, "").length < 5) {
      nextErrors.identifier = t("auth.invalidIdentifier");
    }
    if (!password) nextErrors.password = t("auth.fieldRequired");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await signIn({ identifier: id, password });
    } catch (e) {
      const m = mapAuthErrorToDialog(e);
      const title = t(m.titleKey);
      let message = t(m.messageKey);
      if (m.messageRaw && m.messageKey === "auth.loginFailed") {
        message = `${message}\n\n${m.messageRaw}`;
      }
      setDialog({ title, message });
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await signInWithBiometric();
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "";
      if (msg === "BIOMETRIC_CANCELLED") return;
      setDialog({
        title: t("dialog.errorTitle"),
        message: t("auth.biometricLoginFailed"),
      });
    }
  };

  const ripple = Platform.OS === "android" ? { color: "rgba(0,0,0,0.06)" } : undefined;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <ThemedMessageDialog
        visible={!!dialog}
        title={dialog?.title ?? ""}
        message={dialog?.message ?? ""}
        onDismiss={() => setDialog(null)}
        variant="error"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 8 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={[centeredInner, styles.formBlock]}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={[styles.logoText, { color: colors.primary, fontSize: scaleFont(38) }]}>أمان باي</Text>
                <Text style={[styles.logoSubText, { color: colors.text, fontSize: scaleFont(22) }]}>AmanPay</Text>
              </View>
              <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(21) }]}>{t("auth.loginTitle")}</Text>
            </View>

            <View style={styles.form}>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg },
                  isRtl && styles.rowRtl,
                ]}
              >
                <Mail color={colors.primary} size={22} />
                <TextInput
                  style={[styles.input, { color: colors.text, fontSize: scaleFont(16), textAlign }]}
                  placeholder={t("auth.loginIdentifierPlaceholder")}
                  placeholderTextColor={colors.secondaryText}
                  value={identifier}
                  onChangeText={(value) => {
                    setIdentifier(value);
                    if (submitted) setErrors((prev) => ({ ...prev, identifier: undefined }));
                  }}
                  autoCapitalize="none"
                  keyboardType="default"
                  autoComplete="username"
                  textContentType="username"
                />
              </View>
              {errors.identifier ? (
                <Text style={[styles.errorText, { color: colors.danger, textAlign }]}>
                  {errors.identifier}
                </Text>
              ) : null}

              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg },
                  isRtl && styles.rowRtl,
                ]}
              >
                <Lock color={colors.primary} size={22} />
                <TextInput
                  style={[styles.input, { color: colors.text, fontSize: scaleFont(16), textAlign }]}
                  placeholder={t("auth.passwordPlaceholder")}
                  placeholderTextColor={colors.secondaryText}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (submitted) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry
                  textContentType="password"
                />
              </View>
              {errors.password ? (
                <Text style={[styles.errorText, { color: colors.danger, textAlign }]}>
                  {errors.password}
                </Text>
              ) : null}

              <PrimaryButton
                title={t("auth.signIn")}
                onPress={handleLogin}
                disabled={isLoading || !identifier.trim() || !password}
                style={styles.loginBtn}
              />

              {canBiometricLogin ? (
                <Pressable
                  onPress={handleBiometricLogin}
                  style={({ pressed }) => [
                    styles.biometricBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  android_ripple={ripple}
                  hitSlop={hitSlop}
                >
                  <Fingerprint color={colors.primary} size={18} />
                  <Text style={[styles.biometricText, { color: colors.text, fontSize: scaleFont(14) }]}>
                    {t("auth.signInWithBiometrics")}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.75 }]}
                android_ripple={ripple}
                hitSlop={hitSlop}
              >
                <Text style={[styles.forgotText, { color: colors.text, fontSize: scaleFont(14), textAlign: "center" }]}>
                  {t("auth.forgotPassword")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Register")}
                style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.85 }]}
                android_ripple={ripple}
                hitSlop={hitSlop}
              >
                <Text style={[styles.registerText, { color: colors.primary, fontSize: scaleFont(16) }]}>
                  {t("auth.createAccount")}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  formBlock: { alignSelf: "center", width: "100%" },
  header: { alignItems: "center", marginBottom: 32 },
  logoContainer: { alignItems: "center", marginBottom: 16 },
  logoText: { fontWeight: "bold" },
  logoSubText: { fontWeight: "bold", marginTop: -6 },
  title: { fontWeight: "600", marginTop: 8, textAlign: "center" },
  form: { width: "100%" },
  rowRtl: { flexDirection: "row-reverse" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    height: "100%",
    marginHorizontal: 10,
    fontWeight: "500",
  },
  loginBtn: { marginTop: 12 },
  biometricBtn: {
    marginTop: 10,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: DesignSystem.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  biometricText: { fontWeight: "600" },
  linkWrap: { alignItems: "center", marginTop: 18, paddingVertical: 8 },
  forgotText: { opacity: 0.85 },
  registerBtn: { alignItems: "center", marginTop: 8, padding: 10 },
  registerText: { fontWeight: "bold" },
  errorText: { fontSize: 12, marginTop: -6, marginBottom: 10 },
});
