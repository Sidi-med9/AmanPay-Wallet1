import React from 'react';
import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DesignSystem } from '../constants/DesignSystem';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, disabled, style, icon }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { backgroundColor: colors.primary, borderRadius: DesignSystem.borderRadius.xl },
        disabled && styles.disabled, 
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, { fontFamily: DesignSystem.fonts.family }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignSystem.shadows.medium,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
