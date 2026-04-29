import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { BarChart2, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react-native';

export const ReportsScreen = () => {
  const { colors } = useTheme();
  const { reports, transactions } = useWallet();

  if (!reports) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={[styles.title, { color: colors.text }]}>نظرة عامة</Text>
        
        <View style={styles.grid}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <TrendingDown color={colors.success} size={24} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{reports.totalReceived} MRU</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>إجمالي المستلم</Text>
          </View>
          
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
              <TrendingUp color={colors.danger} size={24} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{reports.totalSent} MRU</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>إجمالي المرسل</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
              <RefreshCcw color="#FF9800" size={24} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{reports.transfersCount}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>عدد العمليات</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
              <BarChart2 color="#2196F3" size={24} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{reports.totalFees} MRU</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>إجمالي الرسوم</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>سجل التحويلات الكامل</Text>
        {transactions.map((trx, idx) => (
          <View key={trx.id || idx} style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.trxDetails}>
              <Text style={[styles.trxName, { color: colors.text }]}>{trx.receiver || trx.sender}</Text>
              <Text style={[styles.trxType, { color: colors.secondaryText }]}>{trx.type === 'local' ? 'محلي' : 'دولي'} • {trx.transferMode === 'envelope' ? 'ظرف أمان' : 'عادي'}</Text>
            </View>
            <View style={styles.trxAmountContainer}>
              <Text style={[styles.trxAmount, { color: trx.amount > 0 ? colors.text : colors.success }]}>
                {trx.amount} MRU
              </Text>
              <Text style={[styles.trxDate, { color: colors.secondaryText }]}>
                {new Date(trx.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  grid: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  trxDetails: { flex: 1 },
  trxName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  trxType: { fontSize: 12 },
  trxAmountContainer: { alignItems: 'flex-end' },
  trxAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  trxDate: { fontSize: 12 },
});
