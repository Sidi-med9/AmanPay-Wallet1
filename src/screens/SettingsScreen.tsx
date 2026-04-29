import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Image, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Globe, Shield, LogOut, Trash2, ChevronLeft, Edit2, X } from 'lucide-react-native';

const PRESET_AVATARS = [
  '', // Initials
  'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Jack'
];

export const SettingsScreen = () => {
  const { colors, isDark, setMode } = useTheme();
  const { user, signOut, updateProfile } = useAuth();
  
  const [darkToggle, setDarkToggle] = useState(isDark);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // Edit Profile State
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
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.primary }]} />
            ) : (
              <View style={[styles.initialsAvatar, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <Text style={[styles.initialsText, { color: colors.primary }]}>{getInitials(user?.name || '')}</Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Edit2 color="#FFF" size={12} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: colors.secondaryText }]}>{user?.phone}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              {isDark ? <Moon color={colors.primary} size={24} /> : <Sun color={colors.primary} size={24} />}
              <Text style={[styles.rowText, { color: colors.text }]}>الوضع الداكن</Text>
            </View>
            <Switch value={darkToggle} onValueChange={handleThemeToggle} trackColor={{ true: colors.primary, false: colors.border }} />
          </View>

          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Globe color={colors.secondaryText} size={24} />
              <Text style={[styles.rowText, { color: colors.text }]}>اللغة (عربي)</Text>
            </View>
            <ChevronLeft color={colors.secondaryText} size={20} />
          </TouchableOpacity>

          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Shield color={colors.secondaryText} size={24} />
              <Text style={[styles.rowText, { color: colors.text }]}>الأمان والخصوصية</Text>
            </View>
            <ChevronLeft color={colors.secondaryText} size={20} />
          </TouchableOpacity>

        </View>

        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 24 }]}
          onPress={signOut}
        >
          <LogOut color={colors.danger} size={24} />
          <Text style={[styles.actionBtnText, { color: colors.danger }]}>تسجيل الخروج</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>تعديل الملف الشخصي</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <X color={colors.secondaryText} size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={[styles.label, { color: colors.text }]}>الصورة الشخصية</Text>
                <View style={styles.avatarSelectionRow}>
                  {PRESET_AVATARS.map((url, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      onPress={() => setEditAvatar(url)}
                      style={[
                        styles.avatarOption, 
                        { borderColor: editAvatar === url ? colors.primary : 'transparent' }
                      ]}
                    >
                      {url ? (
                        <Image source={{ uri: url }} style={styles.avatarOptionImg} />
                      ) : (
                        <View style={[styles.avatarOptionImg, { backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }]}>
                          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{getInitials(editName)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { color: colors.text }]}>الاسم الكامل</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={editName}
                  onChangeText={setEditName}
                />

                <Text style={[styles.label, { color: colors.text }]}>رقم الهاتف</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />

              </ScrollView>

              <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
                  <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20 },
  profileSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
  initialsAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  initialsText: { fontSize: 36, fontWeight: 'bold' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 16 },
  section: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 16, marginLeft: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  actionBtnText: { fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  keyboardView: { width: '100%', maxHeight: '90%' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalForm: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, textAlign: 'right', fontSize: 16 },
  avatarSelectionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  avatarOption: { borderWidth: 2, borderRadius: 32, padding: 2 },
  avatarOptionImg: { width: 56, height: 56, borderRadius: 28 },
  modalFooter: { padding: 20, borderTopWidth: 1, paddingBottom: 40 },
  saveBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
