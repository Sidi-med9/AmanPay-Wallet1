import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { StepIndicator } from '../components/StepIndicator';
import { EnvelopeCard } from '../components/EnvelopeCard';
import { getTransferData } from '../services/amanpayApi';
import { ShieldCheck } from 'lucide-react-native';

export const EnvelopesScreen = ({ navigation }: any) => {
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
        <StepIndicator currentStep={3} totalSteps={4} title="الخطوة 3: التوجيه الذكي للمال" />

        <View style={styles.totalAmountContainer}>
          <Text style={styles.totalAmountLabel}>إجمالي المبلغ المراد توجيهه</Text>
          <Text style={styles.totalAmountValue}>{data.amount.toLocaleString()} {data.currency}</Text>
        </View>

        <View style={styles.infoCard}>
          <ShieldCheck size={24} color="#10B981" style={styles.infoIcon} />
          <Text style={styles.infoText}>المحافظ الموثوقة تساعد المستلم على إدارة المال حسب الهدف، وتمنح المرسل شفافية وثقة أكبر.</Text>
        </View>

        <Text style={styles.sectionTitle}>تقسيم المحافظ (Trust Envelopes)</Text>

        {data.envelopes.map((env: any, idx: number) => (
          <EnvelopeCard key={idx} envelope={env} />
        ))}

      </ScrollView>

      <View style={styles.bottomNav}>
        <PrimaryButton 
          title="تأكيد التحويل" 
          onPress={() => navigation.navigate('Success')} 
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
  totalAmountContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#0F2C59',
    padding: 20,
    borderRadius: 16,
  },
  totalAmountLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmountValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5', // Light green
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#047857',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2C59',
    marginBottom: 16,
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
