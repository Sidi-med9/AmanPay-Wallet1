import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Wallet, Send, ArrowDownLeft, Eye, EyeOff, Clock, ChevronLeft } from 'lucide-react-native';

export const DashboardScreen = ({ navigation }: any) => {
  const { dashboard, transactions, isLoading } = useWallet();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [balanceVisible, setBalanceVisible] = useState(true);

  if (isLoading || !dashboard || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>جاري التحميل...</Text>
      </View>
    );
  }

  const recentTransactions = transactions.slice(0, 3);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.greeting, { color: colors.secondaryText }]}>مرحباً بك،</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Montant total actuel</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? <EyeOff color="#fff" size={20} /> : <Eye color="#fff" size={20} />}
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {balanceVisible ? `${dashboard.balance.toLocaleString()} ${dashboard.currency}` : '••••••••'}
          </Text>
          
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SendMoney')}>
              <Send color={colors.primary} size={20} />
              <Text style={[styles.actionText, { color: colors.primary }]}>إرسال</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ReceiveMoney')}>
              <ArrowDownLeft color={colors.primary} size={20} />
              <Text style={[styles.actionText, { color: colors.primary }]}>استلام</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Wallet size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{dashboard.activeEnvelopes}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>محافظ نشطة</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Clock size={24} color="#F59E0B" />
            <Text style={[styles.statValue, { color: colors.text }]}>{dashboard.pendingApprovals}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>طلبات معلقة</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>أحدث التحويلات</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((trx, idx) => (
            <View key={trx.id || idx} style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.trxIconContainer}>
                {trx.sender === user.name ? (
                  <Send size={20} color={colors.danger} />
                ) : (
                  <ArrowDownLeft size={20} color={colors.success} />
                )}
              </View>
              <View style={styles.trxDetails}>
                <Text style={[styles.trxName, { color: colors.text }]}>
                  {trx.sender === user.name ? trx.receiver : trx.sender}
                </Text>
                <Text style={[styles.trxType, { color: colors.secondaryText }]}>
                  {trx.transferMode === 'envelope' ? 'ظرف أمان' : 'تحويل عادي'}
                </Text>
              </View>
              <View style={styles.trxAmountContainer}>
                <Text style={[styles.trxAmount, { color: trx.sender === user.name ? colors.text : colors.success }]}>
                  {trx.sender === user.name ? '-' : '+'}{trx.amount} {trx.currency}
                </Text>
                <Text style={[styles.trxDate, { color: colors.secondaryText }]}>
                  {new Date(trx.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerText: { flex: 1 },
  greeting: { fontSize: 14 },
  userName: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  balanceCard: { borderRadius: 20, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginBottom: 24 },
  cardActions: { flexDirection: 'row', gap: 16 },
  actionButton: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 16, fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 14, marginTop: 4 },
  historySection: { marginTop: 8 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  historyTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAllText: { fontSize: 14, fontWeight: 'bold' },
  transactionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  trxIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  trxDetails: { flex: 1 },
  trxName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  trxType: { fontSize: 12 },
  trxAmountContainer: { alignItems: 'flex-end' },
  trxAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  trxDate: { fontSize: 12 },
});
