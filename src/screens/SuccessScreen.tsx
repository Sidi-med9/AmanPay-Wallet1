import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { CheckCircle, Hash, User, Banknote, Map, ShieldCheck, Download, Share2 } from 'lucide-react-native';

export const SuccessScreen = ({ route, navigation }: any) => {
  const { receiver, amount, type, country, intermediaryId, transferMode, envelopeMode, envelopes } = route.params || {};
  const { colors } = useTheme();
  const { addTransaction, intermediaries } = useWallet();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [trxId, setTrxId] = useState('');

  useEffect(() => {
    const processTransfer = async () => {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newTrxId = "TRX-" + Math.floor(Math.random() * 100000) + "-AMN";
      setTrxId(newTrxId);
      
      // Add transaction to context
      addTransaction({
        id: newTrxId,
        type,
        sender: user?.name,
        receiver,
        amount: parseFloat(amount),
        currency: 'MRU',
        date: new Date().toISOString(),
        status: 'مكتمل',
        transferMode,
        envelopeMode,
        intermediary: intermediaryId ? intermediaries.find(i => i.id === intermediaryId)?.name : null
      });

      setLoading(false);
    };
    processTransfer();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>جاري معالجة التحويل...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.success }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>
        
        <View style={styles.successHeader}>
          <CheckCircle size={80} color={colors.success} />
          <Text style={[styles.successTitle, { color: colors.text }]}>تم التحويل بنجاح</Text>
          <Text style={[styles.successStatus, { color: colors.success }]}>مكتمل</Text>
        </View>

        <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.receiptRow, { borderBottomColor: colors.border }]}>
            <View style={styles.iconContainer}><Hash size={20} color={colors.secondaryText} /></View>
            <View style={styles.receiptContent}>
              <Text style={[styles.receiptLabel, { color: colors.secondaryText }]}>رقم العملية</Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>{trxId}</Text>
            </View>
          </View>

          <View style={[styles.receiptRow, { borderBottomColor: colors.border }]}>
            <View style={styles.iconContainer}><User size={20} color={colors.secondaryText} /></View>
            <View style={styles.receiptContent}>
              <Text style={[styles.receiptLabel, { color: colors.secondaryText }]}>المرسل إليه</Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>{receiver}</Text>
            </View>
          </View>

          <View style={[styles.receiptRow, { borderBottomColor: colors.border }]}>
            <View style={styles.iconContainer}><Banknote size={20} color={colors.secondaryText} /></View>
            <View style={styles.receiptContent}>
              <Text style={[styles.receiptLabel, { color: colors.secondaryText }]}>المبلغ الإجمالي</Text>
              <Text style={[styles.receiptAmount, { color: colors.success }]}>{amount} MRU</Text>
            </View>
          </View>

          <View style={[styles.receiptRow, { borderBottomColor: colors.border }]}>
            <View style={styles.iconContainer}><Map size={20} color={colors.secondaryText} /></View>
            <View style={styles.receiptContent}>
              <Text style={[styles.receiptLabel, { color: colors.secondaryText }]}>نوع التحويل</Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>
                {type === 'local' ? 'تحويل محلي' : `تحويل دولي إلى ${country}`}
              </Text>
            </View>
          </View>

          {transferMode === 'envelope' && (
            <View style={[styles.receiptRow, styles.noBorder]}>
              <View style={styles.iconContainer}><ShieldCheck size={20} color={colors.secondaryText} /></View>
              <View style={styles.receiptContent}>
                <Text style={[styles.receiptLabel, { color: colors.secondaryText }]}>طريقة المحافظ</Text>
                <Text style={[styles.receiptValue, { color: colors.text }]}>
                  {envelopeMode === 'strict' ? 'صارم (Strict)' : 'مرن (Flexible)'} • {envelopes?.length || 0} محافظ
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Download color={colors.primary} size={20} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>حفظ PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Share2 color={colors.primary} size={20} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>مشاركة</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <PrimaryButton 
          title="العودة للرئيسية" 
          onPress={() => navigation.navigate('Main')} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 100, flexGrow: 1 },
  successHeader: { alignItems: 'center', marginBottom: 32, marginTop: 40 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  successStatus: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  receiptCard: { borderRadius: 16, padding: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  receiptRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  noBorder: { borderBottomWidth: 0, paddingBottom: 0 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  receiptContent: { flex: 1 },
  receiptLabel: { fontSize: 12, marginBottom: 4 },
  receiptValue: { fontSize: 15, fontWeight: '600' },
  receiptAmount: { fontSize: 18, fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', gap: 16, marginTop: 24 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 30, borderTopWidth: 1 },
});
