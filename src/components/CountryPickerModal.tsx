import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { X, Search } from 'lucide-react-native';

export interface CountryData {
  name: string;
  flag: string;
  code: string;
  currency: string;
}

export const COUNTRIES: CountryData[] = [
  { name: 'موريتانيا (Mauritania)', flag: '🇲🇷', code: '+222', currency: 'MRU' },
  { name: 'السنغال (Senegal)', flag: '🇸🇳', code: '+221', currency: 'XOF' },
  { name: 'المغرب (Morocco)', flag: '🇲🇦', code: '+212', currency: 'MAD' },
  { name: 'الجزائر (Algeria)', flag: '🇩🇿', code: '+213', currency: 'DZD' },
  { name: 'تونس (Tunisia)', flag: '🇹🇳', code: '+216', currency: 'TND' },
  { name: 'مالي (Mali)', flag: '🇲🇱', code: '+223', currency: 'XOF' },
  { name: 'كوت ديفوار (Ivory Coast)', flag: '🇨🇮', code: '+225', currency: 'XOF' },
  { name: 'مصر (Egypt)', flag: '🇪🇬', code: '+20', currency: 'EGP' },
  { name: 'الإمارات (UAE)', flag: '🇦🇪', code: '+971', currency: 'AED' },
  { name: 'السعودية (Saudi Arabia)', flag: '🇸🇦', code: '+966', currency: 'SAR' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryData) => void;
}

export const CountryPickerModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.includes(searchQuery)
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>اختر دولة الوجهة</Text>
          <TouchableOpacity onPress={onClose}>
            <X color={colors.secondaryText} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color={colors.secondaryText} size={20} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="ابحث عن دولة..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code + item.name}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.countryItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <View style={styles.countryInfo}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
              </View>
              <View style={styles.countryDetails}>
                <Text style={[styles.countryCode, { color: colors.secondaryText }]}>{item.code}</Text>
                <View style={[styles.currencyBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.currencyText}>{item.currency}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  searchContainer: { padding: 16, position: 'relative' },
  searchIcon: { position: 'absolute', left: 28, top: 32, zIndex: 1 },
  searchInput: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 40, fontSize: 16 },
  countryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  countryInfo: { flexDirection: 'row', alignItems: 'center' },
  flag: { fontSize: 24, marginRight: 12 },
  countryName: { fontSize: 16, fontWeight: '500' },
  countryDetails: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countryCode: { fontSize: 16 },
  currencyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  currencyText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});
