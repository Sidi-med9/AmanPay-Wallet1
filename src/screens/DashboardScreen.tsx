import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { getDashboardData } from '../services/amanpayApi';
import { Wallet, Send, ArrowRightLeft, Clock, Info } from 'lucide-react-native';

export const DashboardScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getDashboardData();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.appName}>{data.appName}</Text>
          <Text style={styles.slogan}>تحويلات عائلية ذكية بمحافظ موثوقة</Text>
          <Text style={styles.description}>تحويلات عائلية بين الدول العربية والإفريقية، وبين المدن محليًا</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد الرئيسي</Text>
          <Text style={styles.balanceAmount}>{data.balance.toLocaleString()} {data.currency}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Send size={24} color="#10B981" />
            <Text style={styles.statValue}>{data.lastTransfer.toLocaleString()} {data.currency}</Text>
            <Text style={styles.statLabel}>آخر تحويل</Text>
          </View>
          <View style={styles.statCard}>
            <Wallet size={24} color="#0EA5E9" />
            <Text style={styles.statValue}>{data.activeEnvelopes}</Text>
            <Text style={styles.statLabel}>المحافظ النشطة</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{data.pendingApprovals}</Text>
            <Text style={styles.statLabel}>طلبات معلقة</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Info size={24} color="#0EA5E9" style={styles.infoIcon} />
          <Text style={styles.infoText}>أرسل المال بهدف واضح، بشفافية، وثقة بين الدول والمدن.</Text>
        </View>

        <View style={styles.routesPreview}>
          <Text style={styles.routesTitle}>مسارات التحويل المتاحة</Text>
          {data.routesPreview.map((route: any, idx: number) => (
            <View key={idx} style={styles.routeItem}>
              <ArrowRightLeft size={20} color="#6B7280" />
              <Text style={styles.routeItemText}>{route.from} ← {route.to}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <PrimaryButton 
          title="إرسال تحويل جديد" 
          onPress={() => navigation.navigate('SendMoney')} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // For sticky button
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F2C59',
  },
  slogan: {
    fontSize: 16,
    color: '#0EA5E9',
    marginTop: 4,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  balanceCard: {
    backgroundColor: '#0F2C59',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#0284C7',
    fontSize: 14,
    lineHeight: 20,
  },
  routesPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  routesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  routeItemText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#4B5563',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30, // For iPhone home bar
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
