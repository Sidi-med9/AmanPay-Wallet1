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
import { Lock, Mail } from "lucide-react-native";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { ThemedMessageDialog } from "../../components/ThemedMessageDialog";
import { mapAuthErrorToDialog } from "../../utils/mapAuthError";

export function LoginScreen({ navigation }: any) {
  const { signIn, isLoading } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { horizontalPadding, centeredInner, scaleFont, insets, hitSlop } = useResponsiveLayout();
  const isRtl = i18n.dir() === "rtl";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);

  const textAlign = useMemo(() => (isRtl ? "right" : "left"), [isRtl]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) return;
    try {
      await signIn({ identifier: identifier.trim(), password });
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
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="default"
                  autoComplete="username"
                  textContentType="username"
                />
              </View>

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
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="password"
                />
              </View>

              <PrimaryButton
                title={t("auth.signIn")}
                onPress={handleLogin}
                disabled={isLoading || !identifier.trim() || !password}
                style={styles.loginBtn}
              />

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
  linkWrap: { alignItems: "center", marginTop: 18, paddingVertical: 8 },
  forgotText: { opacity: 0.85 },
  registerBtn: { alignItems: "center", marginTop: 8, padding: 10 },
  registerText: { fontWeight: "bold" },
});
