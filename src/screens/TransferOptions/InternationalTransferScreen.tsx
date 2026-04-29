import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../context/WalletContext';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Globe, Building, CheckCircle2, ChevronDown } from 'lucide-react-native';
import { CountryPickerModal, CountryData, COUNTRIES } from '../../components/CountryPickerModal';

export const InternationalTransferScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { intermediaries } = useWallet();
  
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[1]); // Default Senegal
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedIntermediary, setSelectedIntermediary] = useState<string | null>(null);
  
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    // Automatically prefix phone number with country code if empty or starts with plus
    if (!receiver || receiver.startsWith('+')) {
      setReceiver(`${country.code} `);
    }
  };

  const handleNext = () => {
    navigation.navigate('Envelopes', { 
      receiver, 
      amount, 
      country: selectedCountry.name, 
      intermediaryId: selectedIntermediary, 
      type: 'international' 
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={[styles.label, { color: colors.text }]}>الدولة الوجهة</Text>
        <TouchableOpacity 
          style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setPickerVisible(true)}
        >
          <Globe color={colors.secondaryText} size={20} />
          <Text style={[styles.inputText, { color: colors.text }]}>
            {selectedCountry.flag} {selectedCountry.name}
          </Text>
          <ChevronDown color={colors.secondaryText} size={20} />
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>رقم هاتف المستلم</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder={`${selectedCountry.code} 00000000`}
          placeholderTextColor={colors.secondaryText}
          value={receiver}
          onChangeText={setReceiver}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.text }]}>المبلغ ({selectedCountry.currency})</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="0.00"
          placeholderTextColor={colors.secondaryText}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>اختيار الوكيل (Intermediary)</Text>
        
        {intermediaries.map(int => (
          <TouchableOpacity 
            key={int.id}
            style={[
              styles.agentCard, 
              { backgroundColor: colors.card, borderColor: selectedIntermediary === int.id ? colors.primary : colors.border },
              selectedIntermediary === int.id && { backgroundColor: 'rgba(0,188,212,0.05)' }
            ]}
            onPress={() => setSelectedIntermediary(int.id)}
          >
            <View style={styles.agentHeader}>
              <Building color={selectedIntermediary === int.id ? colors.primary : colors.secondaryText} size={24} />
              <View style={styles.agentInfo}>
                <Text style={[styles.agentName, { color: selectedIntermediary === int.id ? colors.primary : colors.text }]}>{int.name}</Text>
                <Text style={[styles.agentFee, { color: colors.secondaryText }]}>الرسوم: {int.fee} • المدة: {int.speed}</Text>
              </View>
              {selectedIntermediary === int.id && <CheckCircle2 color={colors.primary} size={24} />}
            </View>
            <View style={styles.tagsRow}>
              {int.tags.map((tag: string, idx: number) => (
                <View key={idx} style={[styles.tag, { backgroundColor: colors.border }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <PrimaryButton 
          title="متابعة للمحافظ الوثوقة" 
          onPress={handleNext} 
          disabled={!receiver || !amount || !selectedIntermediary} 
        />
      </View>

      <CountryPickerModal 
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleCountrySelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 20 },
  inputText: { flex: 1, fontSize: 16, marginLeft: 12, textAlign: 'right' },
  input: { height: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 20, fontSize: 16, textAlign: 'right' },
  agentCard: { padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 12 },
  agentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  agentInfo: { flex: 1, marginLeft: 16 },
  agentName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  agentFee: { fontSize: 12 },
  tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginLeft: 40 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: 'bold' },
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
