/** Minimum touch target (dp) — WCAG-style comfort */
export const MIN_TOUCH_TARGET = 44;

export const DesignSystem = {
  animation: {
    fast: 150,
    normal: 280,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 5,
    },
  },
  fonts: {
    family: "Rubik",
  },
};
