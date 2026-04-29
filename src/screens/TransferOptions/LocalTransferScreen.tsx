import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Wallet, Folder } from 'lucide-react-native';

export const LocalTransferScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
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
        <ScrollView contentContainerStyle={styles.container}>
          
          <Text style={[styles.label, { color: colors.text }]}>رقم هاتف أو معرف المستلم</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="@ahmed or +222..."
            placeholderTextColor={colors.secondaryText}
            value={receiver}
            onChangeText={setReceiver}
          />

          <Text style={[styles.label, { color: colors.text }]}>المبلغ (MRU)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="0.00"
            placeholderTextColor={colors.secondaryText}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={[styles.label, { color: colors.text, marginTop: 24 }]}>طريقة التحويل</Text>
          
          <TouchableOpacity 
            style={[styles.modeCard, mode === 'normal' && { borderColor: colors.primary, backgroundColor: 'rgba(0,188,212,0.05)' }, { backgroundColor: colors.card, borderColor: mode === 'normal' ? colors.primary : colors.border }]}
            onPress={() => setMode('normal')}
          >
            <Wallet size={24} color={mode === 'normal' ? colors.primary : colors.secondaryText} />
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, { color: mode === 'normal' ? colors.primary : colors.text }]}>تحويل عادي</Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText }]}>يستلم المبلغ في رصيده المتاح مباشرة</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeCard, mode === 'envelope' && { borderColor: colors.primary, backgroundColor: 'rgba(0,188,212,0.05)' }, { backgroundColor: colors.card, borderColor: mode === 'envelope' ? colors.primary : colors.border }]}
            onPress={() => setMode('envelope')}
          >
            <Folder size={24} color={mode === 'envelope' ? colors.primary : colors.secondaryText} />
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, { color: mode === 'envelope' ? colors.primary : colors.text }]}>محافظ الأمان (Envelopes)</Text>
              <Text style={[styles.modeDesc, { color: colors.secondaryText }]}>قسّم المبلغ لمصاريف محددة (أكل، دراسة..)</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton title="التالي" onPress={handleNext} disabled={!receiver || !amount} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { height: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 20, fontSize: 16, textAlign: 'right' },
  modeCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 16 },
  modeText: { marginLeft: 16, flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  modeDesc: { fontSize: 12, lineHeight: 18 },
  footer: { padding: 20, paddingBottom: 40 },
});
