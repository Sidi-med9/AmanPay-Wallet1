import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const defaultColors = ['#FF9800', '#2196F3', '#4CAF50', '#F44336', '#E91E63', '#9C27B0', '#00BCD4', '#607D8B'];

export const CreateCategoryModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const { colors } = useTheme();
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
      icon: 'folder', // Mock default icon
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
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>إنشاء محفظة جديدة</Text>
              <TouchableOpacity onPress={onClose}>
                <X color={colors.secondaryText} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
              <Text style={[styles.label, { color: colors.text }]}>اسم المحفظة *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="مثال: مصاريف الجامعة"
                placeholderTextColor={colors.secondaryText}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.label, { color: colors.text }]}>الوصف (اختياري)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="تفاصيل إضافية..."
                placeholderTextColor={colors.secondaryText}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={[styles.label, { color: colors.text }]}>اللون</Text>
              <View style={styles.colorsRow}>
                {defaultColors.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && { borderWidth: 3, borderColor: colors.text }]}
                    onPress={() => setSelectedColor(c)}
                  />
                ))}
              </View>

            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.5 }]} 
                onPress={handleSave}
                disabled={!name.trim()}
              >
                <Text style={styles.btnText}>حفظ وإضافة</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  keyboardView: { width: '100%', maxHeight: '90%' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  title: { fontSize: 18, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, textAlign: 'right', fontSize: 16 },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  colorCircle: { width: 40, height: 40, borderRadius: 20 },
  footer: { padding: 20, borderTopWidth: 1, paddingBottom: 40 },
  btn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
