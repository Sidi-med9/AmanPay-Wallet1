import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { Wallet, CreditCard, ShieldCheck, ShieldAlert, Plus } from 'lucide-react-native';
import { CreateCategoryModal } from '../components/CreateCategoryModal';

export const WalletScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { dashboard, categories } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);

  if (!dashboard) return null;

  const envelopes = dashboard.envelopes || [];
  const totalEnvelopeBalance = envelopes.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={[styles.card, { backgroundColor: colors.primary }]}>
          <Text style={styles.cardLabel}>إجمالي رصيد المحفظة</Text>
          <Text style={styles.cardValue}>{dashboard.balance.toLocaleString()} {dashboard.currency}</Text>
          
          <View style={styles.balanceSplit}>
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>الرصيد العادي</Text>
              <Text style={styles.splitValue}>{(dashboard.balance - totalEnvelopeBalance).toLocaleString()}</Text>
            </View>
            <View style={styles.splitDivider} />
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>المحافظ الذكية</Text>
              <Text style={styles.splitValue}>{totalEnvelopeBalance.toLocaleString()}</Text>
            </View>
          </View>
          
          <Wallet color="rgba(255,255,255,0.15)" size={140} style={styles.bgIcon} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>البطاقات المرتبطة</Text>
        
        <View style={[styles.creditCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CreditCard color={colors.primary} size={32} />
          <View style={styles.ccInfo}>
            <Text style={[styles.ccName, { color: colors.text }]}>البطاقة المصرفية الموريتانية</Text>
            <Text style={[styles.ccNumber, { color: colors.secondaryText }]}>**** **** **** 4892</Text>
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>المحافظ الذكية (Envelopes)</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
            <Plus color={colors.primary} size={20} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>محفظة جديدة</Text>
          </TouchableOpacity>
        </View>

        {envelopes.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Wallet color={colors.secondaryText} size={48} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>لا توجد محافظ نشطة حتى الآن</Text>
            <Text style={[styles.emptySubText, { color: colors.secondaryText }]}>قم بإنشاء محفظة جديدة أو استلم أموالاً مخصصة لمحفظة لتبدأ.</Text>
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
              <Text style={styles.createBtnText}>إنشاء محفظة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          envelopes.map((env: any, index: number) => {
            const cat = categories.find(c => c.id === env.categoryId);
            if (!cat) return null;

            return (
              <View key={`${env.categoryId}-${index}`} style={[styles.envelopeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={{ color: cat.color, fontWeight: 'bold', fontSize: 20 }}>{cat.name.charAt(0)}</Text>
                </View>
                <View style={styles.envInfo}>
                  <Text style={[styles.envName, { color: colors.text }]}>{cat.name}</Text>
                  <View style={styles.modeRow}>
                    {env.mode === 'strict' ? (
                      <ShieldAlert color={colors.danger} size={14} />
                    ) : (
                      <ShieldCheck color={colors.success} size={14} />
                    )}
                    <Text style={[styles.envMode, { color: colors.secondaryText }]}>
                      {env.mode === 'strict' ? 'صارم' : 'مرن'}
                    </Text>
                  </View>
                </View>
                <View style={styles.envBalanceWrap}>
                  <Text style={[styles.envBalance, { color: colors.text }]}>{env.balance.toLocaleString()}</Text>
                  <Text style={[styles.envCurrency, { color: colors.secondaryText }]}>{dashboard.currency}</Text>
                </View>
              </View>
            );
          })
        )}

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
  container: { padding: 20, paddingBottom: 100 },
  card: { borderRadius: 20, padding: 24, marginBottom: 32, overflow: 'hidden' },
  cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 8 },
  cardValue: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
  balanceSplit: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 12 },
  splitItem: { flex: 1 },
  splitLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 },
  splitValue: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  splitDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 12 },
  bgIcon: { position: 'absolute', bottom: -20, right: -20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center' },
  addBtnText: { fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
  creditCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  ccInfo: { marginLeft: 16 },
  ccName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  ccNumber: { fontSize: 14, letterSpacing: 2 },
  envelopeCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 16 },
  envInfo: { flex: 1 },
  envName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  envMode: { fontSize: 12 },
  envBalanceWrap: { alignItems: 'flex-end' },
  envBalance: { fontSize: 18, fontWeight: 'bold' },
  envCurrency: { fontSize: 12, marginTop: 2 },
  emptyState: { padding: 32, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderStyle: 'dashed' },
  emptyText: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  emptySubText: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  createBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
