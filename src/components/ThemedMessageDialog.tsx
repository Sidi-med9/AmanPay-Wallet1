import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { DesignSystem } from "../constants/DesignSystem";
import { AlertCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  variant?: "error" | "info";
};

/**
 * In-app message modal aligned with theme (replaces system Alert for auth/errors).
 */
export function ThemedMessageDialog({
  visible,
  title,
  message,
  onDismiss,
  variant = "error",
}: Props) {
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isRtl = i18n.dir() === "rtl";
  const cardMax = Math.min(400, width - 40);

  const accent = variant === "error" ? colors.danger : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityRole="button">
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              maxWidth: cardMax,
              marginBottom: insets.bottom + 16,
              marginTop: insets.top + 24,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.iconCircle, { backgroundColor: accent + (isDark ? "28" : "18") }]}>
            <AlertCircle color={accent} size={28} strokeWidth={2.2} />
          </View>
          <Text
            style={[
              styles.title,
              { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign: isRtl ? "right" : "left" },
            ]}
            accessibilityRole="header"
          >
            {title}
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: colors.secondaryText,
                fontFamily: DesignSystem.fonts.family,
                textAlign: isRtl ? "right" : "left",
              },
            ]}
          >
            {message}
          </Text>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
                borderRadius: DesignSystem.borderRadius.lg,
              },
            ]}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            accessibilityRole="button"
            accessibilityLabel={t("dialog.ok")}
          >
            <Text style={[styles.buttonText, { fontFamily: DesignSystem.fonts.family }]}>{t("dialog.ok")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    borderRadius: DesignSystem.borderRadius.xxl,
    borderWidth: 1,
    padding: 24,
    ...DesignSystem.shadows.medium,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    width: "100%",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    width: "100%",
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
