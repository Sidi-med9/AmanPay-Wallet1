import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { DesignSystem } from "../../constants/DesignSystem";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { ThemedMessageDialog } from "../../components/ThemedMessageDialog";
import { mapRegisterErrorToDialog } from "../../utils/mapAuthError";

export function RegisterScreen({ navigation }: any) {
  const { signUp, isLoading } = useAuth();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { horizontalPadding, centeredInner, scaleFont, insets, hitSlop } = useResponsiveLayout();
  const isRtl = i18n.dir() === "rtl";
  const textAlign = useMemo(() => (isRtl ? "right" : "left"), [isRtl]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    if (password.length < 8) {
      setDialog({ title: t("auth.passwordTooShortTitle"), message: t("auth.passwordTooShort") });
      return;
    }
    try {
      await signUp({ name, email, phone, password });
    } catch (e) {
      const m = mapRegisterErrorToDialog(e);
      const title = t(m.titleKey);
      let message = t(m.messageKey);
      if (m.messageRaw && m.messageKey === "auth.registerFailed") {
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
          <View style={[centeredInner, styles.block]}>
            <Text style={[styles.title, { color: colors.text, fontSize: scaleFont(26) }]}>
              {t("auth.registerTitle")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText, fontSize: scaleFont(15) }]}>
              {t("auth.registerSubtitle")}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    fontSize: scaleFont(16),
                    textAlign,
                  },
                ]}
                placeholder={t("auth.fullName")}
                placeholderTextColor={colors.secondaryText}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    fontSize: scaleFont(16),
                    textAlign,
                  },
                ]}
                placeholder={t("auth.emailPlaceholder")}
                placeholderTextColor={colors.secondaryText}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    fontSize: scaleFont(16),
                    textAlign,
                  },
                ]}
                placeholder={t("auth.phone")}
                placeholderTextColor={colors.secondaryText}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    fontSize: scaleFont(16),
                    textAlign,
                  },
                ]}
                placeholder={t("auth.passwordHint")}
                placeholderTextColor={colors.secondaryText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            <PrimaryButton
              title={t("auth.submitRegister")}
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.button}
            />

            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.85 }]}
              hitSlop={hitSlop}
              android_ripple={ripple}
            >
              <Text style={[styles.linkText, { color: colors.primary, fontSize: scaleFont(15) }]}>
                {t("auth.hasAccount")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingTop: 8 },
  block: { alignSelf: "center", width: "100%" },
  title: { fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  subtitle: { marginBottom: 24, textAlign: "center", lineHeight: 22 },
  inputContainer: { marginBottom: 8 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  button: { marginTop: 8, marginBottom: 8 },
  linkButton: { alignItems: "center", padding: 12 },
  linkText: { fontWeight: "600", textAlign: "center" },
});
