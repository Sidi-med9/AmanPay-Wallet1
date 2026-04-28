import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { StepIndicator } from '../components/StepIndicator';
import { RouteCard } from '../components/RouteCard';
import { getTransferData } from '../services/amanpayApi';

export const RouteScreen = ({ navigation }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<'international' | 'local'>('international');

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
        <StepIndicator currentStep={2} totalSteps={4} title="الخطوة 2: اختيار الشبكة الأنسب" />

        <Text style={styles.sectionTitle}>مسارات التحويل المتاحة</Text>
        
        <RouteCard
          route={data.selectedRoute}
          selected={selectedRoute === 'international'}
          onSelect={() => setSelectedRoute('international')}
          isInternational={true}
        />

        <RouteCard
          route={data.localRoute}
          selected={selectedRoute === 'local'}
          onSelect={() => setSelectedRoute('local')}
          isInternational={false}
        />

      </ScrollView>

      <View style={styles.bottomNav}>
        <PrimaryButton 
          title="المتابعة لتقسيم المحافظ" 
          onPress={() => navigation.navigate('Envelopes')} 
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
