import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { Plus } from 'lucide-react-native';
import { CreateCategoryModal } from '../components/CreateCategoryModal';

export const CategoriesScreen = () => {
  const { colors } = useTheme();
  const { categories } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>إدارة التصنيفات والمحافظ</Text>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>المحافظ المتاحة</Text>

        <View style={styles.grid}>
          {categories.map(cat => (
            <View key={cat.id} style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: `${cat.color}20` }]}>
                {/* Note: In a real app we'd map string icon names to Lucide components dynamically */}
                <Text style={{ color: cat.color, fontSize: 24, fontWeight: 'bold' }}>{cat.name.charAt(0)}</Text>
              </View>
              <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
              <Text style={[styles.catDesc, { color: colors.secondaryText }]} numberOfLines={2}>{cat.description}</Text>
            </View>
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
  container: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  addBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  categoryCard: { width: '47%', padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  iconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  catName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  catDesc: { fontSize: 12, textAlign: 'center' },
});
