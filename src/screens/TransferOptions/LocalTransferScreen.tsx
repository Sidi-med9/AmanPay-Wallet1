import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { DesignSystem } from '../../constants/DesignSystem';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Wallet, Folder, User, Banknote, ChevronRight } from 'lucide-react-native';

export const LocalTransferScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'normal' | 'envelope'>('normal');

  const handleNext = () => {
    if (mode === 'envelope') {
      navigation.navigate('Envelopes', { receiver, amount, type: 'local' });
    } else {
      navigation.navigate('Success', { receiver, amount, type: 'local', transferMode: 'normal' });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>تحويل محلي</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>المستلم</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg }]}>
              <User size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}
                placeholder="رقم الهاتف أو المعرف..."
                placeholderTextColor={colors.secondaryText}
                value={receiver}
                onChangeText={setReceiver}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>المبلغ (MRU)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg }]}>
              <Banknote size={20} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}
                placeholder="0.00"
                placeholderTextColor={colors.secondaryText}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                textAlign="right"
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>طريقة التحويل</Text>
          
          <TouchableOpacity 
            style={[
              styles.modeCard, 
              { backgroundColor: colors.card, borderColor: mode === 'normal' ? colors.primary : colors.border, borderRadius: DesignSystem.borderRadius.xl },
              mode === 'normal' && { ...DesignSystem.shadows.light, backgroundColor: isDark ? '#0C182B' : '#F0FDFA' }
            ]}
            onPress={() => setMode('normal')}
          >
            <View style={[styles.iconBox, { backgroundColor: mode === 'normal' ? colors.primary + '15' : colors.border }]}>
              <Wallet size={22} color={mode === 'normal' ? colors.primary : colors.secondaryText} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>تحويل عادي</Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>يستلم المبلغ في رصيده المتاح مباشرة</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.modeCard, 
              { backgroundColor: colors.card, borderColor: mode === 'envelope' ? colors.primary : colors.border, borderRadius: DesignSystem.borderRadius.xl },
              mode === 'envelope' && { ...DesignSystem.shadows.light, backgroundColor: isDark ? '#0C182B' : '#F0FDFA' }
            ]}
            onPress={() => setMode('envelope')}
          >
            <View style={[styles.iconBox, { backgroundColor: mode === 'envelope' ? colors.primary + '15' : colors.border }]}>
              <Folder size={22} color={mode === 'envelope' ? colors.primary : colors.secondaryText} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>محافظ الأمان (Envelopes)</Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>قسّم المبلغ لمصاريف محددة (أكل، دراسة..)</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton 
            title="متابعة" 
            onPress={handleNext} 
            disabled={!receiver || !amount} 
            style={{ height: 60 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 20, fontWeight: 'bold' },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'right' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 60, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
  input: { flex: 1, height: '100%', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 24, marginBottom: 16, textAlign: 'right' },
  modeCard: { flexDirection: 'row-reverse', alignItems: 'center', padding: 20, borderWidth: 1, marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modeText: { flex: 1, marginRight: 16 },
  modeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' },
  modeDesc: { fontSize: 12, lineHeight: 18, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
});
