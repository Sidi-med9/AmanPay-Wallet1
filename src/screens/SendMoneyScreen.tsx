import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { DesignSystem } from '../constants/DesignSystem';
import { MapPin, Globe, ArrowLeft, ChevronLeft } from 'lucide-react-native';

export const SendMoneyScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>اختر نوع التحويل</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xxl }]}
          onPress={() => navigation.navigate('LocalTransfer')}
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>تحويل محلي</Text>
              <Text style={[styles.cardDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>أرسل أموالاً لأي مستخدم أمان باي داخل بلدك</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <MapPin size={28} color={colors.primary} />
            </View>
          </View>
          <ChevronLeft color={colors.secondaryText} size={20} style={styles.chevron} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xxl }]}
          onPress={() => navigation.navigate('InternationalTransfer')}
        >
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>تحويل دولي</Text>
              <Text style={[styles.cardDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>أرسل أموالاً عبر الحدود باستخدام وكلاء موثوقين</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <Globe size={28} color={colors.primary} />
            </View>
          </View>
          <ChevronLeft color={colors.secondaryText} size={20} style={styles.chevron} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, flex: 1, justifyContent: 'center' },
  header: { marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  card: { padding: 24, borderWidth: 1, marginBottom: 20, ...DesignSystem.shadows.medium, flexDirection: 'row', alignItems: 'center' },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  iconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 20 },
  textContainer: { flex: 1, alignItems: 'flex-end' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardDesc: { fontSize: 14, lineHeight: 20, textAlign: 'right' },
  chevron: { position: 'absolute', left: 24 },
});
