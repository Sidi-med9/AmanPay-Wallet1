import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { DesignSystem } from "../constants/DesignSystem";
import { DEFAULT_CURRENCY } from "../constants/appDefaults";
import { PrimaryButton } from '../components/PrimaryButton';
import { ShieldAlert, ShieldCheck, Plus, CheckSquare, Square, Info, ChevronLeft, LayoutGrid } from 'lucide-react-native';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { LinearGradient } from 'expo-linear-gradient';

export const EnvelopesScreen = ({ route, navigation }: any) => {
  const { receiver, amount, type, country, intermediaryId } = route.params || {};
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const { categories, dashboard } = useWallet();
  const isRtl = i18n.dir() === "rtl";
  const textAlign = isRtl ? "right" : "left";
  const cur = dashboard?.currency ?? DEFAULT_CURRENCY;
  
  const [envelopeMode, setEnvelopeMode] = useState<'strict' | 'flexible'>('flexible');
  const [modalVisible, setModalVisible] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, string>>({});

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

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign },
            ]}
          >
            {t("envelopes.modesTitle")}
          </Text>
          <View style={[styles.modesContainer, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <TouchableOpacity 
              style={[
                styles.modeCard, 
                { backgroundColor: colors.card, borderColor: envelopeMode === 'strict' ? colors.danger : colors.border, borderRadius: DesignSystem.borderRadius.xl },
                envelopeMode === 'strict' && { ...DesignSystem.shadows.light, backgroundColor: colors.danger + '05' }
              ]}
              onPress={() => setEnvelopeMode('strict')}
            >
              <ShieldAlert color={envelopeMode === 'strict' ? colors.danger : colors.secondaryText} size={24} />
              <Text style={[styles.modeTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {t("envelopes.strictTitle")}
              </Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("envelopes.strictDesc")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.modeCard, 
                { backgroundColor: colors.card, borderColor: envelopeMode === 'flexible' ? colors.success : colors.border, borderRadius: DesignSystem.borderRadius.xl },
                envelopeMode === 'flexible' && { ...DesignSystem.shadows.light, backgroundColor: colors.success + '05' }
              ]}
              onPress={() => setEnvelopeMode('flexible')}
            >
              <ShieldCheck color={envelopeMode === 'flexible' ? colors.success : colors.secondaryText} size={24} />
              <Text style={[styles.modeTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {t("envelopes.flexTitle")}
              </Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("envelopes.flexDesc")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
              <Plus color={colors.primary} size={18} />
              <Text style={[styles.addBtnText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>
                {t("envelopes.createWallet")}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontFamily: DesignSystem.fonts.family, marginTop: 0, textAlign },
              ]}
            >
              {t("envelopes.allocationTitle")}
            </Text>
          </View>

          {categories.map((cat) => {
            const isSelected = allocations[cat.id] !== undefined;
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
                    <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{cat.name}</Text>
                    <View style={[styles.catIcon, { backgroundColor: cat.color + '15' }]}>
                      <Text style={{ color: cat.color, fontWeight: 'bold' }}>{cat.name.charAt(0)}</Text>
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
          <PrimaryButton title={t("envelopes.confirm")} onPress={handleConfirm} disabled={!isValid} style={{ height: 60 }} />
        </View>
      </KeyboardAvoidingView>

      <CreateCategoryModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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
  modesContainer: { gap: 16, marginBottom: 32 },
  modeCard: { flex: 1, padding: 20, borderWidth: 1, alignItems: 'center' },
  modeTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  modeDesc: { fontSize: 11, textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtnText: { fontSize: 14, fontWeight: 'bold' },
  categoryCard: { padding: 16, borderWidth: 1, marginBottom: 16 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catLeft: { width: 40 },
  catRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  catIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 16, fontWeight: 'bold' },
  amountWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  amountInput: { flex: 1, height: 44, fontSize: 20, fontWeight: 'bold' },
  currencyLabel: { fontSize: 14, fontWeight: '600', width: 50 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
});
