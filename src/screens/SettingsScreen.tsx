import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Image, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { DesignSystem } from '../constants/DesignSystem';
import { Moon, Sun, Globe, Shield, LogOut, ChevronLeft, Edit3, X, User, Bell, HelpCircle, Lock } from 'lucide-react-native';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Luna'
];

export const SettingsScreen = () => {
  const { colors, isDark, setMode } = useTheme();
  const { user, signOut, updateProfile } = useAuth();
  
  const [darkToggle, setDarkToggle] = useState(isDark);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  const handleThemeToggle = (val: boolean) => {
    setDarkToggle(val);
    setMode(val ? 'dark' : 'light');
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      name: editName,
      phone: editPhone,
      avatar: editAvatar
    });
    setEditModalVisible(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'AP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const SettingRow = ({ icon, label, value, onPress, showSwitch, switchValue, onSwitchChange }: any) => (
    <TouchableOpacity 
      style={[styles.row, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      disabled={showSwitch}
    >
      {showSwitch ? (
        <Switch 
          value={switchValue} 
          onValueChange={onSwitchChange} 
          trackColor={{ true: colors.primary, false: colors.border }} 
        />
      ) : (
        <ChevronLeft color={colors.secondaryText} size={20} />
      )}
      <View style={styles.rowRight}>
        <Text style={[styles.rowText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{label}</Text>
        <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          {icon}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>حسابي</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }} style={[styles.avatar, { borderColor: colors.primary }]} />
            <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary }]} onPress={() => setEditModalVisible(true)}>
              <Edit3 color="#FFF" size={14} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{user?.name}</Text>
          <Text style={[styles.phone, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>{user?.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>إعدادات الحساب</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl }]}>
            <SettingRow 
              icon={<User color={colors.primary} size={20} />} 
              label="تعديل الملف الشخصي" 
              onPress={() => setEditModalVisible(true)} 
            />
            <SettingRow 
              icon={<Bell color={colors.primary} size={20} />} 
              label="الإشعارات" 
            />
            <SettingRow 
              icon={<Lock color={colors.primary} size={20} />} 
              label="الأمان والخصوصية" 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>إعدادات التطبيق</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl }]}>
            <SettingRow 
              icon={isDark ? <Moon color={colors.primary} size={20} /> : <Sun color={colors.primary} size={20} />} 
              label="الوضع الداكن" 
              showSwitch={true}
              switchValue={darkToggle}
              onSwitchChange={handleThemeToggle}
            />
            <SettingRow 
              icon={<Globe color={colors.primary} size={20} />} 
              label="اللغة" 
              value="العربية"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: isDark ? '#1E293B' : '#FEE2E2', borderRadius: DesignSystem.borderRadius.xl }]}
          onPress={signOut}
        >
          <LogOut color={colors.danger} size={22} />
          <Text style={[styles.logoutText, { color: colors.danger, fontFamily: DesignSystem.fonts.family }]}>تسجيل الخروج</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <X color={colors.secondaryText} size={24} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>تعديل الملف الشخصي</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={[styles.label, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>اختر صورة</Text>
                <View style={styles.avatarOptions}>
                  {PRESET_AVATARS.map((url, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      onPress={() => setEditAvatar(url)}
                      style={[styles.avatarOption, { borderColor: editAvatar === url ? colors.primary : 'transparent' }]}
                    >
                      <Image source={{ uri: url }} style={styles.avatarOptionImg} />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>الاسم الكامل</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg }]}
                  value={editName}
                  onChangeText={setEditName}
                  textAlign="right"
                />

                <Text style={[styles.label, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>رقم الهاتف</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg }]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
                
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: DesignSystem.borderRadius.xl }]} onPress={handleSaveProfile}>
                  <Text style={[styles.saveBtnText, { fontFamily: DesignSystem.fonts.family }]}>حفظ التغييرات</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  profileCard: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3 },
  editBadge: { position: 'absolute', bottom: 0, left: 0, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  phone: { fontSize: 16 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12, marginRight: 8 },
  sectionCard: { borderWidth: 1, ...DesignSystem.shadows.light, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  rowRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  rowText: { fontSize: 16, fontWeight: '500', marginRight: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, marginTop: 12, gap: 12 },
  logoutText: { fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  keyboardView: { width: '100%', height: '80%' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalForm: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 20 },
  avatarOptions: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatarOption: { borderWidth: 2, borderRadius: 34, padding: 2 },
  avatarOptionImg: { width: 60, height: 60, borderRadius: 30 },
  input: { height: 56, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  saveBtn: { height: 60, marginTop: 40, justifyContent: 'center', alignItems: 'center', ...DesignSystem.shadows.medium },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
