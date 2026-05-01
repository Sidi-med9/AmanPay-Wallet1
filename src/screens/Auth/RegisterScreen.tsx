import React, { useEffect, useMemo, useState } from "react";
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
import { getMerchantCategories, type MerchantCategoryOption } from "../../services/amanpayApi";

const FALLBACK_MERCHANT_CATEGORIES: MerchantCategoryOption[] = [
  { code: "AL", displayName: "All Categories" },
  { code: "FO", displayName: "Food" },
  { code: "TR", displayName: "Transportation" },
  { code: "PC", displayName: "Personal Care" },
  { code: "HO", displayName: "Household" },
];

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
  const [accountType, setAccountType] = useState<"user" | "merchant">("user");
  const [merchantCategory, setMerchantCategory] = useState<string>("");
  const [merchantCategories, setMerchantCategories] = useState<MerchantCategoryOption[]>(FALLBACK_MERCHANT_CATEGORIES);
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    merchantCategory?: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await getMerchantCategories();
      if (!active) return;
      setMerchantCategories(rows.length ? rows : FALLBACK_MERCHANT_CATEGORIES);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRegister = async () => {
    setSubmitted(true);
    const nextErrors: { name?: string; email?: string; phone?: string; password?: string; merchantCategory?: string } =
      {};
    const nameTrimmed = name.trim();
    const emailTrimmed = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, "");
    if (nameTrimmed.length < 2) nextErrors.name = t("auth.fullNameTooShort");
    if (!emailTrimmed) nextErrors.email = t("auth.fieldRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) nextErrors.email = t("auth.invalidEmail");
    if (phone.trim() && phoneDigits.length < 5) nextErrors.phone = t("auth.invalidPhone");
    if (!password) nextErrors.password = t("auth.fieldRequired");
    else if (password.length < 8) nextErrors.password = t("auth.passwordTooShort");
    if (accountType === "merchant" && !merchantCategory) {
      nextErrors.merchantCategory = t("auth.merchantCategoryRequired");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await signUp({
        name: nameTrimmed,
        email: emailTrimmed,
        phone: phone.trim(),
        password,
        accountType,
        merchantCategory: accountType === "merchant" ? merchantCategory : undefined,
      });
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
              <Text style={[styles.accountTypeLabel, { color: colors.text, textAlign, fontFamily: DesignSystem.fonts.family }]}>
                {t("auth.accountTypeTitle")}
              </Text>
              <View style={[styles.accountTypeRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                <Pressable
                  onPress={() => {
                    setAccountType("user");
                    setMerchantCategory("");
                    if (submitted) setErrors((prev) => ({ ...prev, merchantCategory: undefined }));
                  }}
                  style={[
                    styles.accountTypeChip,
                    {
                      borderColor: accountType === "user" ? colors.primary : colors.border,
                      backgroundColor: accountType === "user" ? colors.primary + "14" : colors.card,
                    },
                  ]}
                >
                  <Text style={{ color: accountType === "user" ? colors.primary : colors.text, fontFamily: DesignSystem.fonts.family }}>
                    {t("auth.accountTypeUser")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setAccountType("merchant")}
                  style={[
                    styles.accountTypeChip,
                    {
                      borderColor: accountType === "merchant" ? colors.primary : colors.border,
                      backgroundColor: accountType === "merchant" ? colors.primary + "14" : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: accountType === "merchant" ? colors.primary : colors.text,
                      fontFamily: DesignSystem.fonts.family,
                    }}
                  >
                    {t("auth.accountTypeMerchant")}
                  </Text>
                </Pressable>
              </View>

              {accountType === "merchant" ? (
                <>
                  <Text
                    style={[
                      styles.accountTypeLabel,
                      { color: colors.text, textAlign, fontFamily: DesignSystem.fonts.family, marginTop: 6 },
                    ]}
                  >
                    {t("auth.merchantCategoryTitle")}
                  </Text>
                  <View style={[styles.accountTypeRow, { flexDirection: isRtl ? "row-reverse" : "row", flexWrap: "wrap" }]}>
                    {merchantCategories.map((cat) => {
                      const code = cat.code.toUpperCase();
                      const labelKey =
                        code === "AL"
                          ? "auth.merchantCategoryAll"
                          : code === "FO"
                          ? "auth.merchantCategoryFood"
                          : code === "TR"
                            ? "auth.merchantCategoryTransportation"
                            : code === "PC"
                              ? "auth.merchantCategoryPersonalCare"
                              : code === "HO"
                                ? "auth.merchantCategoryHousehold"
                                : null;
                      const selected = merchantCategory === code;
                      return (
                        <Pressable
                          key={cat.code}
                          onPress={() => {
                            setMerchantCategory(code);
                            if (submitted) setErrors((prev) => ({ ...prev, merchantCategory: undefined }));
                          }}
                          style={[
                            styles.categoryChip,
                            {
                              borderColor: selected ? colors.primary : colors.border,
                              backgroundColor: selected ? colors.primary + "14" : colors.card,
                            },
                          ]}
                        >
                          <Text style={{ color: selected ? colors.primary : colors.text, fontFamily: DesignSystem.fonts.family }}>
                            {labelKey ? t(labelKey) : cat.displayName || code}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {errors.merchantCategory ? (
                    <Text style={[styles.errorText, { color: colors.danger, textAlign }]}>{errors.merchantCategory}</Text>
                  ) : null}
                </>
              ) : null}

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
                onChangeText={(value) => {
                  setName(value);
                  if (submitted) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name ? <Text style={[styles.errorText, { color: colors.danger, textAlign }]}>{errors.name}</Text> : null}
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
                onChangeText={(value) => {
                  setEmail(value);
                  if (submitted) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              {errors.email ? (
                <Text style={[styles.errorText, { color: colors.danger, textAlign }]}>{errors.email}</Text>
              ) : null}
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
                onChangeText={(value) => {
                  setPhone(value);
                  if (submitted) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                keyboardType="phone-pad"
              />
              {errors.phone ? (
                <Text style={[styles.errorText, { color: colors.danger, textAlign }]}>{errors.phone}</Text>
              ) : null}
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
                onChangeText={(value) => {
                  setPassword(value);
                  if (submitted) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry
                textContentType="newPassword"
              />
              {errors.password ? (
                <Text style={[styles.errorText, { color: colors.danger, textAlign }]}>{errors.password}</Text>
              ) : null}
            </View>

            <PrimaryButton
              title={t("auth.submitRegister")}
              onPress={handleRegister}
              disabled={isLoading || Object.keys(errors).length > 0}
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
  accountTypeLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  accountTypeRow: { gap: 10, marginBottom: 12 },
  accountTypeChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flex: 1, alignItems: "center" },
  categoryChip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
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
  errorText: { fontSize: 12, marginTop: -6, marginBottom: 8 },
});
