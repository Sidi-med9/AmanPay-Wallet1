import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { StepIndicator } from '../components/StepIndicator';
import { createTransfer } from '../services/amanpayApi';
import { CheckCircle, Hash, User, Banknote, Map, ShieldCheck } from 'lucide-react-native';

export const SuccessScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const submitTransfer = async () => {
      // Simulate payload
      const result = await createTransfer({ amount: 6000 });
      setData(result);
      setLoading(false);
    };
    submitTransfer();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>جاري معالجة التحويل...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StepIndicator currentStep={4} totalSteps={4} title="الخطوة 4: التأكيد والإيصال" />

        <View style={styles.successHeader}>
          <CheckCircle size={64} color="#10B981" />
          <Text style={styles.successTitle}>{data.message}</Text>
          <Text style={styles.successStatus}>{data.status}</Text>
        </View>

        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <View style={styles.iconContainer}><Hash size={20} color="#6B7280" /></View>
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>رقم العملية</Text>
              <Text style={styles.receiptValue}>{data.transactionId}</Text>
            </View>
          </View>

          <View style={styles.receiptRow}>
            <View style={styles.iconContainer}><User size={20} color="#6B7280" /></View>
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>المستلم</Text>
              <Text style={styles.receiptValue}>{data.receiver}</Text>
            </View>
          </View>

          <View style={styles.receiptRow}>
            <View style={styles.iconContainer}><Banknote size={20} color="#6B7280" /></View>
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>المبلغ الإجمالي</Text>
              <Text style={styles.receiptAmount}>{data.amount.toLocaleString()} {data.currency}</Text>
            </View>
          </View>

          <View style={styles.receiptRow}>
            <View style={styles.iconContainer}><Map size={20} color="#6B7280" /></View>
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>المسار</Text>
              <Text style={styles.receiptValue}>{data.route}</Text>
            </View>
          </View>

          <View style={styles.receiptRow}>
            <View style={styles.iconContainer}><ShieldCheck size={20} color="#6B7280" /></View>
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>نوع التحويل</Text>
              <Text style={styles.receiptValue}>{data.transferType}</Text>
            </View>
          </View>

          <View style={[styles.receiptRow, styles.noBorder]}>
            <View style={styles.iconContainer}><ShieldCheck size={20} color="#6B7280" /></View>
            <View style={styles.receiptContent}>
              <Text style={styles.receiptLabel}>المحافظ المنشأة</Text>
              <Text style={styles.receiptValue}>{data.envelopesCreated} محافظ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <PrimaryButton 
          title="العودة إلى لوحة التحكم" 
          onPress={() => navigation.navigate('Dashboard')} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#10B981', // Green background for success
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // For sticky button
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  successStatus: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  noBorder: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  receiptContent: {
    flex: 1,
  },
  receiptLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  receiptValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
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
