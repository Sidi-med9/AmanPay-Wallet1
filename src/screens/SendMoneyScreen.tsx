import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Globe } from 'lucide-react-native';

export const SendMoneyScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>اختر نوع التحويل</Text>
        
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('LocalTransfer')}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 188, 212, 0.1)' }]}>
            <MapPin size={32} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>تحويل محلي</Text>
            <Text style={[styles.cardDesc, { color: colors.secondaryText }]}>أرسل أموالاً لأي مستخدم أمان باي داخل بلدك</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('InternationalTransfer')}
        >
          <View style={[styles.iconBox, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
            <Globe size={32} color={colors.danger} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>تحويل دولي</Text>
            <Text style={[styles.cardDesc, { color: colors.secondaryText }]}>أرسل أموالاً عبر الحدود باستخدام وكلاء موثوقين</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  iconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardDesc: { fontSize: 14, lineHeight: 20 },
});
