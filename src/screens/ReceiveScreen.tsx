import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { Copy, Share2, QrCode } from 'lucide-react-native';

export const ReceiveScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>استلام الأموال</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            امسح رمز الاستجابة السريعة (QR) أو شارك الرابط لاستلام الأموال فوراً.
          </Text>

          <View style={[styles.qrPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <QrCode size={120} color={colors.primary} />
          </View>

          <Text style={[styles.idLabel, { color: colors.secondaryText }]}>معرف أمان باي (AmanPay ID)</Text>
          <View style={[styles.idBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.idValue, { color: colors.text }]}>{user?.id}</Text>
            <TouchableOpacity>
              <Copy size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.idLabel, { color: colors.secondaryText, marginTop: 16 }]}>رقم الهاتف</Text>
          <View style={[styles.idBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.idValue, { color: colors.text }]}>{user?.phone}</Text>
            <TouchableOpacity>
              <Copy size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.actions}>
          <PrimaryButton 
            title="مشاركة رابط الدفع" 
            onPress={() => {}} 
            style={{ marginBottom: 16 }}
          />
          <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { color: colors.text }]}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  card: { padding: 24, borderRadius: 20, borderWidth: 1, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  qrPlaceholder: { width: 200, height: 200, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  idLabel: { fontSize: 12, alignSelf: 'flex-start', marginBottom: 8 },
  idBox: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  idValue: { fontSize: 16, fontWeight: 'bold' },
  actions: { marginTop: 32 },
  backBtn: { height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 12, borderWidth: 1 },
  backBtnText: { fontSize: 16, fontWeight: 'bold' },
});
