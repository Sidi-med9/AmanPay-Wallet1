import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { DesignSystem } from "../constants/DesignSystem";
import { DEFAULT_CURRENCY } from "../constants/appDefaults";
import { PrimaryButton } from '../components/PrimaryButton';
import { ShieldAlert, ShieldCheck, CheckSquare, Square } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ENVELOPE_CATEGORY_OPTIONS = [
  { id: "food", color: "#F59E0B", nameKey: "envelopes.categoryFood" },
  { id: "transportation", color: "#10B981", nameKey: "envelopes.categoryTransportation" },
  { id: "personal_care", color: "#EC4899", nameKey: "envelopes.categoryPersonalCare" },
  { id: "household", color: "#6366F1", nameKey: "envelopes.categoryHousehold" },
] as const;

export const EnvelopesScreen = ({ route, navigation }: any) => {
  const { receiver, amount, type, country, intermediaryId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const textAlign = isRtl ? "right" : "left";
  const cur = DEFAULT_CURRENCY;
  
  const [envelopeMode, setEnvelopeMode] = useState<'strict' | 'flexible'>('flexible');
  const [allocations, setAllocations] = useState<Record<string, string>>({});

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "food":
        return "🍽️";
      case "transportation":
        return "🚌";
      case "personal_care":
        return "💗";
      case "household":
      default:
        return "🏠";
    }
  };

  const toggleCategory = (categoryId: string) => {
    setAllocations(prev => {
      const newAllocations = { ...prev };
      if (newAllocations[categoryId] !== undefined) {
        delete newAllocations[categoryId];
      } else {
        newAllocations[categoryId] = '';
      }
      return newAllocations;
    });
  };

  const updateAmount = (categoryId: string, val: string) => {
    setAllocations(prev => ({ ...prev, [categoryId]: val }));
  };

  const totalAmount = parseFloat(amount) || 0;
  const totalAllocated = Object.values(allocations).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const remaining = totalAmount - totalAllocated;
  const hasSelected = Object.keys(allocations).length > 0;
  const hasZeroOrEmpty = Object.values(allocations).some(val => !val || parseFloat(val) <= 0);
  const isExactMatch = Math.abs(totalAmount - totalAllocated) < 0.01;
  const isValid = hasSelected && isExactMatch && !hasZeroOrEmpty;

  const handleConfirm = () => {
    const envelopesArray = Object.keys(allocations).map(id => ({
      categoryId: id,
      amount: allocations[id]
    }));

    navigation.navigate('Success', {
      receiver,
      amount,
      type,
      country,
      intermediaryId,
      transferMode: 'envelope',
      envelopeMode,
      envelopes: envelopesArray
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <LinearGradient
            colors={isDark ? ['#1E293B', '#0F172A'] : [colors.primary, '#0097A7']}
            style={[styles.summaryCard, { borderRadius: DesignSystem.borderRadius.xxl }]}
          >
            <Text style={[styles.summaryLabel, { fontFamily: DesignSystem.fonts.family }]}>{t("envelopes.totalAvailable")}</Text>
            <Text style={[styles.summaryValue, { fontFamily: DesignSystem.fonts.family }]}>
              {totalAmount.toLocaleString()} {cur}
            </Text>
            <View style={styles.remainingRow}>
              <View style={[styles.remainingBadge, { backgroundColor: remaining < 0 ? colors.danger : "rgba(255,255,255,0.2)" }]}>
                <Text style={[styles.remainingText, { fontFamily: DesignSystem.fonts.family }]}>
                  {remaining === 0
                    ? t("envelopes.fullyDistributed")
                    : t("envelopes.remaining", { amount: remaining.toLocaleString(), currency: cur })}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View
            style={[
              styles.quickStatsRow,
              {
                flexDirection: isRtl ? "row-reverse" : "row",
              },
            ]}
          >
            <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.quickStatLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("envelopes.allocationTitle")}
              </Text>
              <Text style={[styles.quickStatValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {Object.keys(allocations).length}
              </Text>
            </View>
            <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.quickStatLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("envelopes.totalAvailable")}
              </Text>
              <Text style={[styles.quickStatValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {totalAllocated.toLocaleString()} / {totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign },
            ]}
          >
            {t("envelopes.modesTitle")}
          </Text>
          <Text style={[styles.modesHint, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
            {t("envelopes.modeChooseHint")}
          </Text>
          <View style={[styles.modeToggleWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                envelopeMode === "strict" && { backgroundColor: colors.danger + "18", borderColor: colors.danger },
              ]}
              onPress={() => setEnvelopeMode("strict")}
            >
              <ShieldAlert size={16} color={envelopeMode === "strict" ? colors.danger : colors.secondaryText} />
              <Text
                style={[
                  styles.modeToggleText,
                  { color: envelopeMode === "strict" ? colors.danger : colors.secondaryText, fontFamily: DesignSystem.fonts.family },
                ]}
              >
                {t("envelopes.strictTitle")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeToggleBtn,
                envelopeMode === "flexible" && { backgroundColor: colors.success + "18", borderColor: colors.success },
              ]}
              onPress={() => setEnvelopeMode("flexible")}
            >
              <ShieldCheck size={16} color={envelopeMode === "flexible" ? colors.success : colors.secondaryText} />
              <Text
                style={[
                  styles.modeToggleText,
                  { color: envelopeMode === "flexible" ? colors.success : colors.secondaryText, fontFamily: DesignSystem.fonts.family },
                ]}
              >
                {t("envelopes.flexTitle")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.modeExplainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modeExplainTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
              {envelopeMode === "strict" ? t("envelopes.strictTitle") : t("envelopes.flexTitle")}
            </Text>
            <Text style={[styles.modeExplainDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
              {envelopeMode === "strict" ? t("envelopes.strictDesc") : t("envelopes.flexDesc")}
            </Text>
            <View
              style={[
                styles.modePill,
                {
                  backgroundColor: envelopeMode === "strict" ? colors.danger + "14" : colors.success + "14",
                  alignSelf: isRtl ? "flex-end" : "flex-start",
                },
              ]}
            >
              <Text
                style={[
                  styles.modePillText,
                  {
                    color: envelopeMode === "strict" ? colors.danger : colors.success,
                    fontFamily: DesignSystem.fonts.family,
                  },
                ]}
              >
                {envelopeMode === "strict" ? t("envelopes.strictRule") : t("envelopes.flexRule")}
              </Text>
            </View>
          </View>

          <View style={styles.headerRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontFamily: DesignSystem.fonts.family, marginTop: 0, textAlign },
              ]}
            >
              {t("envelopes.allocationTitle")}
            </Text>
          </View>

          {ENVELOPE_CATEGORY_OPTIONS.map((cat) => {
            const isSelected = allocations[cat.id] !== undefined;
            const categoryIcon = getCategoryIcon(cat.id);
            return (
              <View 
                key={cat.id} 
                style={[
                  styles.categoryCard, 
                  { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border, borderRadius: DesignSystem.borderRadius.xl },
                  isSelected && DesignSystem.shadows.light
                ]}
              >
                <TouchableOpacity style={styles.catHeader} onPress={() => toggleCategory(cat.id)}>
                  <View style={styles.catLeft}>
                    {isSelected ? <CheckSquare color={colors.primary} size={22} /> : <Square color={colors.secondaryText} size={22} />}
                  </View>
                  <View style={styles.catRight}>
                    <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                      {t(cat.nameKey)}
                    </Text>
                    <View style={[styles.catIcon, { backgroundColor: cat.color + '25' }]}>
                      <Text style={styles.catEmoji}>{categoryIcon}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {isSelected && (
                  <View style={[styles.amountWrapper, { borderTopColor: colors.border }]}>
                    <Text style={[styles.currencyLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                      {cur}
                    </Text>
                    <TextInput
                      style={[styles.amountInput, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}
                      value={allocations[cat.id]}
                      onChangeText={(val) => updateAmount(cat.id, val)}
                      keyboardType="numeric"
                      placeholder={t("envelopes.amountPlaceholder")}
                      placeholderTextColor={colors.secondaryText}
                    />
                  </View>
                )}
              </View>
            );
          })}

        </ScrollView>
        <View style={styles.footer}>
          {!isValid ? (
            <Text style={[styles.footerHint, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
              {t("envelopes.remaining", { amount: remaining.toLocaleString(), currency: cur })}
            </Text>
          ) : null}
          <PrimaryButton title={t("envelopes.confirm")} onPress={handleConfirm} disabled={!isValid} style={{ height: 60 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 120 },
  summaryCard: { padding: 24, alignItems: 'center', marginBottom: 32, ...DesignSystem.shadows.medium },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  summaryValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  remainingRow: { marginTop: 12 },
  remainingBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  remainingText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, marginTop: 8, textAlign: 'right' },
  modesHint: { fontSize: 12, marginTop: -6, marginBottom: 12 },
  quickStatsRow: { gap: 12, marginBottom: 20 },
  quickStatCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 12 },
  quickStatLabel: { fontSize: 12, marginBottom: 4 },
  quickStatValue: { fontSize: 16, fontWeight: "700" },
  modeToggleWrap: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  modeToggleBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  modeToggleText: { fontSize: 12, fontWeight: "700" },
  modeExplainCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 28 },
  modeExplainTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  modeExplainDesc: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  modePill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  modePillText: { fontSize: 10, fontWeight: "700" },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 },
  categoryCard: { padding: 16, borderWidth: 1, marginBottom: 16 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catLeft: { width: 40 },
  catRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  catIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catEmoji: { fontSize: 20 },
  catName: { fontSize: 16, fontWeight: 'bold' },
  amountWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  amountInput: { flex: 1, height: 44, fontSize: 20, fontWeight: 'bold' },
  currencyLabel: { fontSize: 14, fontWeight: '600', width: 50 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
  footerHint: { textAlign: "center", fontSize: 12, marginBottom: 8 },
});
