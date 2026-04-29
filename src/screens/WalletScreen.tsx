import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { DesignSystem } from '../constants/DesignSystem';
import { Wallet, CreditCard, ShieldCheck, ShieldAlert, Plus, ChevronRight, ArrowUpRight } from 'lucide-react-native';
import { CreateCategoryModal } from '../components/CreateCategoryModal';
import { LinearGradient } from 'expo-linear-gradient';

export const WalletScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { dashboard, categories } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);

  if (!dashboard) return null;

  const envelopes = dashboard.envelopes || [];
  const totalEnvelopeBalance = envelopes.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0);
  const regularBalance = dashboard.balance - totalEnvelopeBalance;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>محفظة AmanPay والمغلفات</Text>
          <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.miniAvatar} />
        </View>

        {/* Main Balance Card */}
        <View style={[styles.mainCard, { backgroundColor: isDark ? '#0C182B' : '#FFF', borderColor: colors.border }]}>
          <Text style={[styles.mainLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>إجمالي الرصيد</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.mainBalance, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{dashboard.balance.toLocaleString()} {dashboard.currency}</Text>
            <View style={styles.trendContainer}>
              <ArrowUpRight color={colors.success} size={16} />
              <Text style={[styles.trendText, { color: colors.success }]}>3.5%</Text>
            </View>
          </View>
          <Text style={[styles.weekText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>%٣.٥ هذا الأسبوع</Text>
        </View>

        {/* Sub Balances */}
        <View style={styles.subBalancesRow}>
          <View style={[styles.subBalanceCard, { backgroundColor: isDark ? '#0C182B' : '#FFF', borderColor: colors.border }]}>
            <Text style={[styles.subLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>إجمالي رصيد المغلفات</Text>
            <Text style={[styles.subValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{totalEnvelopeBalance.toLocaleString()} {dashboard.currency}</Text>
          </View>
          <View style={[styles.subBalanceCard, { backgroundColor: isDark ? '#0C182B' : '#FFF', borderColor: colors.border }]}>
            <Text style={[styles.subLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>الرصيد العادي</Text>
            <Text style={[styles.subValue, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{regularBalance.toLocaleString()} {dashboard.currency}</Text>
          </View>
        </View>

        {/* Linked Cards */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>البطاقات المرتبطة</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
          <LinearGradient
            colors={['#00D2D3', '#0097A7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.ccCard, { borderRadius: DesignSystem.borderRadius.xl }]}
          >
            <View style={styles.ccHeader}>
              <Text style={styles.ccType}>AmanPay Visa</Text>
              <View style={styles.ccCircle} />
            </View>
            <Text style={styles.ccNumber}>٠٥٤١ **** **** ٨٩٧٦</Text>
            <Text style={styles.ccHolder}>أحمد علي</Text>
          </LinearGradient>
          
          <TouchableOpacity style={[styles.addCardBtn, { borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl }]}>
            <Plus color={colors.secondaryText} size={24} />
          </TouchableOpacity>
        </ScrollView>

        {/* Envelopes Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>المغلفات</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addEnvelopeBtn}>
            <Plus color={colors.primary} size={18} />
            <Text style={[styles.addEnvelopeText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>جديد</Text>
          </TouchableOpacity>
        </View>

        {envelopes.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>لا توجد مغلفات نشطة</Text>
          </View>
        ) : (
          envelopes.map((env: any, index: number) => {
            const cat = categories.find(c => c.id === env.categoryId);
            if (!cat) return null;

            return (
              <View key={index} style={[styles.envItem, { backgroundColor: isDark ? '#0C182B' : '#FFF', borderColor: colors.border }]}>
                <View style={[styles.badge, { backgroundColor: env.mode === 'strict' ? colors.danger : colors.success }]}>
                  <Text style={styles.badgeText}>{env.mode === 'strict' ? 'صارم' : 'مرن'}</Text>
                </View>
                <View style={styles.envMain}>
                  <View style={styles.envTextCol}>
                    <Text style={[styles.envName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{cat.name}</Text>
                    <Text style={[styles.envAmount, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>{env.balance.toLocaleString()} {dashboard.currency}</Text>
                  </View>
                  <View style={[styles.envIconWrap, { backgroundColor: (cat.color || colors.primary) + '15' }]}>
                    <Text style={{ color: cat.color || colors.primary, fontSize: 18 }}>{cat.name.charAt(0)}</Text>
                  </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  miniAvatar: { width: 36, height: 36, borderRadius: 18 },
  mainCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16, ...DesignSystem.shadows.light },
  mainLabel: { fontSize: 14, marginBottom: 8, textAlign: 'center' },
  balanceRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  mainBalance: { fontSize: 32, fontWeight: 'bold' },
  trendContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  trendText: { fontSize: 12, fontWeight: 'bold', marginLeft: 2 },
  weekText: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  subBalancesRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  subBalanceCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, ...DesignSystem.shadows.light },
  subLabel: { fontSize: 12, marginBottom: 4 },
  subValue: { fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  cardsScroll: { paddingBottom: 8 },
  ccCard: { width: 260, height: 160, padding: 20, marginRight: 16, justifyContent: 'space-between' },
  ccHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  ccType: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  ccCircle: { width: 40, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
  ccNumber: { color: '#FFF', fontSize: 18, letterSpacing: 2, fontWeight: '500' },
  ccHolder: { color: '#FFF', fontSize: 14, opacity: 0.9 },
  addCardBtn: { width: 60, height: 160, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addEnvelopeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addEnvelopeText: { fontSize: 14, fontWeight: 'bold' },
  envItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, ...DesignSystem.shadows.light },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, position: 'absolute', left: 16 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  envMain: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  envTextCol: { alignItems: 'flex-end', marginRight: 16 },
  envName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  envAmount: { fontSize: 14 },
  envIconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  emptyState: { padding: 32, alignItems: 'center', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  emptyText: { fontSize: 14 },
});
