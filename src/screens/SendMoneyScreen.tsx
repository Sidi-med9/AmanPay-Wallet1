import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { StepIndicator } from '../components/StepIndicator';
import { getTransferData } from '../services/amanpayApi';
import { User, FileText, Banknote } from 'lucide-react-native';

export const SendMoneyScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getTransferData();
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
        <StepIndicator currentStep={1} totalSteps={4} title="الخطوة 1: تفاصيل المستلم" />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>معلومات التحويل</Text>
          
          <View style={styles.row}>
            <View style={styles.iconBox}><User size={20} color="#0EA5E9" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>المرسل</Text>
              <Text style={styles.value}>{data.sender}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconBox}><User size={20} color="#10B981" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>المستلم</Text>
              <Text style={styles.value}>{data.receiver}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconBox}><Banknote size={20} color="#F59E0B" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>المبلغ</Text>
              <Text style={styles.amountValue}>{data.amount.toLocaleString()} {data.currency}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconBox}><FileText size={20} color="#6B7280" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>الغرض</Text>
              <Text style={styles.value}>{data.purpose}</Text>
            </View>
          </View>

          <View style={[styles.row, styles.noBorder]}>
            <View style={styles.iconBox}><FileText size={20} color="#6B7280" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>طريقة التسليم</Text>
              <Text style={styles.value}>{data.delivery}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <PrimaryButton 
          title="متابعة" 
          onPress={() => navigation.navigate('Route')} 
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2C59',
    marginBottom: 20,
  },
  row: {
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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2C59',
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
