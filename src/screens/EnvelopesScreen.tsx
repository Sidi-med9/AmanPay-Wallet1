import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ShieldAlert, ShieldCheck, Plus, CheckSquare, Square } from 'lucide-react-native';
import { CreateCategoryModal } from '../components/CreateCategoryModal';

export const EnvelopesScreen = ({ route, navigation }: any) => {
  const { receiver, amount, type, country, intermediaryId } = route.params || {};
  const { colors } = useTheme();
  const { categories } = useWallet();
  
  const [envelopeMode, setEnvelopeMode] = useState<'strict' | 'flexible'>('flexible');
  const [modalVisible, setModalVisible] = useState(false);
  
  // State for selected categories and their amounts
  // Map of categoryId to amount string
  const [allocations, setAllocations] = useState<Record<string, string>>({});

  const toggleCategory = (categoryId: string) => {
    setAllocations(prev => {
      const newAllocations = { ...prev };
      if (newAllocations[categoryId] !== undefined) {
        delete newAllocations[categoryId];
      } else {
        newAllocations[categoryId] = ''; // Start empty
      }
      return newAllocations;
    });
  };

  const updateAmount = (categoryId: string, val: string) => {
    setAllocations(prev => ({
      ...prev,
      [categoryId]: val
    }));
  };

  const totalAmount = parseFloat(amount) || 0;
  
  // Calculate total allocated
  const totalAllocated = Object.values(allocations).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const remaining = totalAmount - totalAllocated;
  const hasSelected = Object.keys(allocations).length > 0;
  const hasZeroOrEmpty = Object.values(allocations).some(val => !val || parseFloat(val) <= 0);
  
  // Floating point math can be tricky, so let's allow a tiny epsilon difference
  const isExactMatch = Math.abs(totalAmount - totalAllocated) < 0.01;

  const isValid = hasSelected && isExactMatch && !hasZeroOrEmpty;

  const handleConfirm = () => {
    // Format the allocations array for the success screen
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={[styles.totalAmountContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.totalAmountLabel}>إجمالي المبلغ المتاح للتوزيع</Text>
          <Text style={styles.totalAmountValue}>{amount || '0'} MRU</Text>
          <Text style={styles.remainingValue}>
            المتبقي: {remaining >= 0 ? remaining : 0} MRU
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>طريقة عمل المحافظ</Text>
        <View style={styles.modesContainer}>
          <TouchableOpacity 
            style={[styles.modeCard, { backgroundColor: colors.card, borderColor: envelopeMode === 'strict' ? colors.danger : colors.border }]}
            onPress={() => setEnvelopeMode('strict')}
          >
            <ShieldAlert color={envelopeMode === 'strict' ? colors.danger : colors.secondaryText} size={24} />
            <Text style={[styles.modeTitle, { color: envelopeMode === 'strict' ? colors.danger : colors.text }]}>صارم (Strict)</Text>
            <Text style={[styles.modeDesc, { color: colors.secondaryText }]}>لا يمكن للمستلم استخدام المبلغ خارج هذا التصنيف.</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeCard, { backgroundColor: colors.card, borderColor: envelopeMode === 'flexible' ? colors.success : colors.border }]}
            onPress={() => setEnvelopeMode('flexible')}
          >
            <ShieldCheck color={envelopeMode === 'flexible' ? colors.success : colors.secondaryText} size={24} />
            <Text style={[styles.modeTitle, { color: envelopeMode === 'flexible' ? colors.success : colors.text }]}>مرن (Flexible)</Text>
            <Text style={[styles.modeDesc, { color: colors.secondaryText }]}>يمكن للمستلم نقل المبلغ لرصيده العادي عند الحاجة.</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>توزيع المحافظ المتاحة</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
            <Plus color={colors.primary} size={20} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>إنشاء محفظة جديدة</Text>
          </TouchableOpacity>
        </View>

        {/* Validation Messages */}
        <View style={styles.validationBox}>
          {!hasSelected && (
            <Text style={[styles.validationText, { color: colors.danger }]}>الرجاء اختيار محفظة واحدة على الأقل.</Text>
          )}
          {hasSelected && !isExactMatch && (
            <Text style={[styles.validationText, { color: colors.secondaryText }]}>
              {remaining > 0 
                ? `المبلغ المتبقي للتوزيع: ${remaining} MRU` 
                : `لقد تجاوزت إجمالي التحويل بـ ${Math.abs(remaining)} MRU`}
            </Text>
          )}
          {hasSelected && isExactMatch && !hasZeroOrEmpty && (
            <Text style={[styles.validationText, { color: colors.success }]}>تم توزيع المبلغ بنجاح.</Text>
          )}
        </View>

        {categories.map((cat) => {
          const isSelected = allocations[cat.id] !== undefined;
          
          return (
            <View key={cat.id} style={[styles.categoryRow, { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border }]}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleCategory(cat.id)}>
                {isSelected ? (
                  <CheckSquare color={colors.primary} size={24} />
                ) : (
                  <Square color={colors.secondaryText} size={24} />
                )}
                <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={{ color: cat.color, fontWeight: 'bold' }}>{cat.name.charAt(0)}</Text>
                </View>
                <View style={styles.catInfo}>
                  <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                  {cat.description ? (
                    <Text style={[styles.catDesc, { color: colors.secondaryText }]} numberOfLines={1}>{cat.description}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              {isSelected && (
                <TextInput
                  style={[styles.amountInput, { color: colors.text, borderColor: colors.border }]}
                  value={allocations[cat.id]}
                  onChangeText={(val) => updateAmount(cat.id, val)}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.secondaryText}
                />
              )}
            </View>
          );
        })}

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <PrimaryButton 
          title="تأكيد التوزيع والمتابعة" 
          onPress={handleConfirm} 
          disabled={!isValid}
        />
      </View>

      <CreateCategoryModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  totalAmountContainer: { alignItems: 'center', marginBottom: 20, padding: 20, borderRadius: 16 },
  totalAmountLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  totalAmountValue: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  remainingValue: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
  modesContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modeCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  modeTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  modeDesc: { fontSize: 12, textAlign: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center' },
  addBtnText: { fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
  validationBox: { marginBottom: 16 },
  validationText: { fontSize: 14, fontWeight: '500' },
  categoryRow: { flexDirection: 'column', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginHorizontal: 12 },
  catInfo: { flex: 1 },
  catName: { fontSize: 16, fontWeight: 'bold' },
  catDesc: { fontSize: 12, marginTop: 2 },
  amountInput: { height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, textAlign: 'right', marginTop: 12, fontSize: 16 },
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
