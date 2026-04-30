import { useMemo } from "react";
import { useWindowDimensions, Platform, PixelRatio } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type LayoutBreakpoint = "compact" | "regular" | "expanded";

/**
 * Screen-aware layout for padding, typography, tab bar, and max content width.
 */
export function useResponsiveLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const shortest = Math.min(width, height);
    const isLandscape = width > height;
    const breakpoint: LayoutBreakpoint =
      width < 380 ? "compact" : width >= 768 ? "expanded" : "regular";

    const horizontalPadding = Math.round(Math.min(28, Math.max(14, width * 0.055)));
    const readableMaxWidth = Math.min(560, width - horizontalPadding * 2);

    const balanceHeroFont = Math.round(Math.min(40, Math.max(24, width * 0.09)));
    const sectionTitleSize = breakpoint === "compact" ? 16 : breakpoint === "expanded" ? 20 : 18;
    const envelopeCardWidth = Math.round(
      Math.min(190, Math.max(136, Math.min(width * 0.44, readableMaxWidth * 0.48)))
    );

    const fontScaleClamped = Math.min(Math.max(fontScale || 1, 0.85), 1.35);
    const scaleFont = (px: number) => Math.round((px / fontScaleClamped) * Math.min(fontScaleClamped, 1.08));

    const tabBarBase = Platform.OS === "ios" ? 52 : 56;
    const tabBarPaddingBottom = Math.max(insets.bottom, Platform.OS === "android" ? 8 : 6);
    const tabBarHeight = tabBarBase + tabBarPaddingBottom + 10;

    const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
    const minTouchTarget = 44;

    return {
      width,
      height,
      fontScale: fontScale || 1,
      insets,
      shortest,
      isLandscape,
      breakpoint,
      isCompact: breakpoint === "compact",
      isExpanded: breakpoint === "expanded",
      isTablet: width >= 768,
      horizontalPadding,
      readableMaxWidth,
      balanceHeroFont,
      sectionTitleSize,
      envelopeCardWidth,
      scaleFont,
      tabBarHeight,
      tabBarPaddingBottom,
      hitSlop,
      minTouchTarget,
      /** Use on ScrollView contentContainerStyle for centered column on tablets */
      scrollContentMaxWidth: {
        paddingHorizontal: horizontalPadding,
        paddingBottom: Math.max(96, insets.bottom + 72),
        alignItems: width >= 600 ? ("center" as const) : undefined,
      },
      /** Inner wrapper so content does not stretch edge-to-edge on wide phones */
      centeredInner: {
        width: "100%" as const,
        maxWidth: readableMaxWidth,
      },
    };
  }, [width, height, fontScale, insets]);
}

/** Sync font scaling for components that cannot use the hook */
export function getClampedFontScale(): number {
  const fs = PixelRatio.getFontScale();
  return Math.min(Math.max(fs, 0.85), 1.35);
}
