import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { DesignSystem } from '../constants/DesignSystem';
import { Plus, ChevronRight } from 'lucide-react-native';
import { CreateCategoryModal } from '../components/CreateCategoryModal';

export const CategoriesScreen = () => {
  const { colors, isDark } = useTheme();
  const { categories } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>إدارة المحافظ</Text>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
            onPress={() => setModalVisible(true)}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryCard, 
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl },
                DesignSystem.shadows.light
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: cat.color + '15' }]}>
                <Text style={{ color: cat.color, fontSize: 24, fontWeight: 'bold' }}>{cat.name.charAt(0)}</Text>
              </View>
              <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{cat.name}</Text>
              <Text style={[styles.catDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]} numberOfLines={2}>{cat.description || 'لا يوجد وصف'}</Text>
              <View style={[styles.badge, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                <Text style={[styles.badgeText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>نشط</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <CreateCategoryModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 22, fontWeight: 'bold' },
  addBtn: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', ...DesignSystem.shadows.medium },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 16 },
  categoryCard: { width: '47%', padding: 20, borderWidth: 1, alignItems: 'center' },
  iconBox: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  catName: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  catDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16, height: 32, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
});
