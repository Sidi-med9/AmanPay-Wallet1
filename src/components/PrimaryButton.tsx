import React from "react";
import { Pressable, Text, StyleSheet, StyleProp, ViewStyle, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { DesignSystem, MIN_TOUCH_TARGET } from "../constants/DesignSystem";
import { getClampedFontScale } from "../hooks/useResponsiveLayout";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, disabled, style, icon }) => {
  const { colors } = useTheme();
  const labelSize = Math.round(18 / getClampedFontScale());

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderRadius: DesignSystem.borderRadius.xl,
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
      android_ripple={{ color: "rgba(255,255,255,0.22)" }}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, { fontFamily: DesignSystem.fonts.family, fontSize: labelSize }]}>{title}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH_TARGET + 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    ...DesignSystem.shadows.medium,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
