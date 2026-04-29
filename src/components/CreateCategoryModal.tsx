import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { DesignSystem } from '../constants/DesignSystem';
import { X, Check } from 'lucide-react-native';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const defaultColors = ['#00BCD4', '#FF9800', '#2196F3', '#4CAF50', '#F44336', '#E91E63', '#9C27B0', '#607D8B'];

export const CreateCategoryModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const { colors, isDark } = useTheme();
  const { addCategory } = useWallet();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(defaultColors[0]);

  const handleSave = () => {
    if (!name.trim()) return;

    const newCat = {
      id: `cat_custom_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      icon: 'folder',
      color: selectedColor,
      type: 'custom'
    };

    addCategory(newCat);
    setName('');
    setDescription('');
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderRadius: DesignSystem.borderRadius.xxl }]}>
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color={colors.secondaryText} size={22} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>إنشاء محفظة جديدة</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>اسم المحفظة *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg, fontFamily: DesignSystem.fonts.family }]}
                  placeholder="مثال: مصاريف الجامعة"
                  placeholderTextColor={colors.secondaryText}
                  value={name}
                  onChangeText={setName}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>الوصف (اختياري)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg, fontFamily: DesignSystem.fonts.family }]}
                  placeholder="تفاصيل إضافية..."
                  placeholderTextColor={colors.secondaryText}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />
              </View>

              <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, marginTop: 12 }]}>اللون</Text>
              <View style={styles.colorsRow}>
                {defaultColors.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }]}
                    onPress={() => setSelectedColor(c)}
                  >
                    {selectedColor === c && <Check color="#FFF" size={20} />}
                  </TouchableOpacity>
                ))}
              </View>

            </ScrollView>

            <View style={styles.footer}>
              <PrimaryButton 
                title="حفظ وإضافة" 
                onPress={handleSave}
                disabled={!name.trim()}
                style={{ height: 60 }}
              />
            </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  keyboardView: { width: '100%', maxHeight: '85%' },
  modalContent: { height: '100%', ...DesignSystem.shadows.medium },
  handleBar: { height: 24, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  form: { padding: 24 },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'right' },
  input: { height: 56, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  textArea: { height: 100, paddingTop: 16, paddingBottom: 16 },
  colorsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 24, paddingBottom: 40 },
});
