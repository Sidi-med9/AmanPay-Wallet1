import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DesignSystem } from '../constants/DesignSystem';
import { Wallet, Send, ArrowDownLeft, Eye, EyeOff, Clock, ChevronLeft, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const DashboardScreen = ({ navigation }: any) => {
  const { dashboard, transactions, isLoading, categories } = useWallet();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  
  const [balanceVisible, setBalanceVisible] = useState(true);

  if (isLoading || !dashboard || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontFamily: DesignSystem.fonts.family }}>جاري التحميل...</Text>
      </View>
    );
  }

  const recentTransactions = transactions.slice(0, 5);
  const activeEnvelopes = dashboard.envelopes || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>مرحباً، {user.name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={[styles.avatarBorder, { borderColor: colors.primary }]}>
              <Image source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#E0F2FE', '#F0FDFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.balanceCard, { borderRadius: DesignSystem.borderRadius.xxl }]}
        >
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>إجمالي الرصيد</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? <EyeOff color={isDark ? '#fff' : colors.primary} size={20} /> : <Eye color={isDark ? '#fff' : colors.primary} size={20} />}
            </TouchableOpacity>
          </View>
          <Text style={[styles.balanceAmount, { color: isDark ? '#FFF' : colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {balanceVisible ? `${dashboard.balance.toLocaleString()} ${dashboard.currency}` : '••••••••'}
          </Text>
          
          {/* Main Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]} 
              onPress={() => navigation.navigate('Transfers')}
            >
              <Send color="#FFF" size={20} />
              <Text style={[styles.actionText, { color: '#FFF', fontFamily: DesignSystem.fonts.family }]}>إرسال</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,210,211,0.1)' }]} 
              onPress={() => navigation.navigate('ReceiveMoney')}
            >
              <ArrowDownLeft color={colors.primary} size={20} />
              <Text style={[styles.actionText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>استلام</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Active Envelopes Horizontal Scroll */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>المظاريف النشطة</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
            <Text style={[styles.viewAllText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>المزيد</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.envelopesScroll}>
          {activeEnvelopes.length > 0 ? activeEnvelopes.map((env: any, idx: number) => {
            const cat = categories.find(c => c.id === env.categoryId);
            return (
              <View key={idx} style={[styles.envCard, { backgroundColor: colors.card, borderRadius: DesignSystem.borderRadius.xl, borderColor: colors.border }]}>
                <View style={styles.envHeader}>
                  <Text style={[styles.envName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{cat?.name || 'محفظة'}</Text>
                  <View style={[styles.envIcon, { backgroundColor: (cat?.color || colors.primary) + '20' }]}>
                    <Text style={{ color: cat?.color || colors.primary, fontWeight: 'bold' }}>{cat?.name?.charAt(0)}</Text>
                  </View>
                </View>
                <View style={styles.envProgressContainer}>
                  <View style={[styles.envProgressBar, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                    <View style={[styles.envProgressFill, { backgroundColor: cat?.color || colors.primary, width: '70%' }]} />
                  </View>
                </View>
                <Text style={[styles.envBalance, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{env.balance} {dashboard.currency}</Text>
              </View>
            );
          }) : (
            <TouchableOpacity 
              style={[styles.envCard, styles.emptyEnvCard, { backgroundColor: colors.card, borderRadius: DesignSystem.borderRadius.xl, borderColor: colors.border, borderStyle: 'dashed' }]}
              onPress={() => navigation.navigate('Categories')}
            >
              <Plus color={colors.secondaryText} size={24} />
              <Text style={[styles.emptyEnvText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>إضافة محفظة</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>التحويلات الأخيرة</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
            <Text style={[styles.viewAllText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>الكل</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((trx, idx) => (
          <TouchableOpacity key={trx.id || idx} style={[styles.transactionItem, { backgroundColor: colors.card, borderRadius: DesignSystem.borderRadius.xl, borderColor: colors.border }]}>
            <View style={[styles.trxIcon, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              {trx.sender === user.name ? (
                <Send size={18} color={colors.primary} />
              ) : (
                <ArrowDownLeft size={18} color={colors.success} />
              )}
            </View>
            <View style={styles.trxContent}>
              <Text style={[styles.trxTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                {trx.sender === user.name ? trx.receiver : trx.sender}
              </Text>
              <Text style={[styles.trxDate, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {new Date(trx.date).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <View style={styles.trxAmountCol}>
              <Text style={[styles.trxAmountText, { color: trx.sender === user.name ? colors.text : colors.success, fontFamily: DesignSystem.fonts.family }]}>
                {trx.sender === user.name ? '-' : '+'}{trx.amount} {trx.currency}
              </Text>
              {trx.status && (
                <View style={[styles.statusBadge, { backgroundColor: trx.status === 'مكتمل' ? colors.success + '20' : '#F59E0B20' }]}>
                  <Text style={[styles.statusText, { color: trx.status === 'مكتمل' ? colors.success : '#F59E0B', fontFamily: DesignSystem.fonts.family }]}>{trx.status}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerText: { flex: 1 },
  greeting: { fontSize: 16, fontWeight: '500' },
  avatarBorder: { borderWidth: 2, borderRadius: 28, padding: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  balanceCard: { padding: 24, marginBottom: 24, ...DesignSystem.shadows.medium },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  balanceLabel: { fontSize: 16, fontWeight: '500' },
  balanceAmount: { fontSize: 34, fontWeight: 'bold', marginBottom: 24 },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, height: 50, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 16, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAllText: { fontSize: 14, fontWeight: '600' },
  envelopesScroll: { paddingBottom: 8 },
  envCard: { width: 160, padding: 16, marginRight: 16, borderWidth: 1, ...DesignSystem.shadows.light },
  emptyEnvCard: { justifyContent: 'center', alignItems: 'center', height: 120 },
  emptyEnvText: { marginTop: 8, fontSize: 14, fontWeight: '500' },
  envHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  envName: { fontSize: 16, fontWeight: '600' },
  envIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  envProgressContainer: { marginBottom: 12 },
  envProgressBar: { height: 6, borderRadius: 3, width: '100%', overflow: 'hidden' },
  envProgressFill: { height: '100%', borderRadius: 3 },
  envBalance: { fontSize: 14, fontWeight: '700' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderWidth: 1, ...DesignSystem.shadows.light },
  trxIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  trxContent: { flex: 1 },
  trxTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  trxDate: { fontSize: 12 },
  trxAmountCol: { alignItems: 'flex-end' },
  trxAmountText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
});
