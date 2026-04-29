import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DesignSystem } from '../../constants/DesignSystem';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Lock } from 'lucide-react-native';

export function LoginScreen({ navigation }: any) {
  const { signIn, isLoading } = useAuth();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    await signIn({ email, password });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: colors.primary }]}>أمان باي</Text>
            <Text style={[styles.logoSubText, { color: colors.text }]}>AmanPay</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>تسجيل الدخول الآمن</Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg }]}>
            <Lock color={colors.primary} size={20} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="رقم الهاتف"
              placeholderTextColor={colors.secondaryText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              textAlign="right"
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.lg }]}>
            <Lock color={colors.primary} size={20} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="كلمة المرور"
              placeholderTextColor={colors.secondaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <PrimaryButton 
            title="تسجيل الدخول" 
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
            style={styles.loginBtn}
          />

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: colors.text }]}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerBtn}>
            <Text style={[styles.registerText, { color: colors.primary }]}>تسجيل حساب جديد</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logoText: { fontSize: 40, fontWeight: 'bold' },
  logoSubText: { fontSize: 24, fontWeight: 'bold', marginTop: -10 },
  title: { fontSize: 22, fontWeight: '600', marginTop: 10 },
  form: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    marginLeft: 10,
  },
  loginBtn: {
    marginTop: 20,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotText: {
    fontSize: 14,
    opacity: 0.8,
  },
  registerBtn: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  registerText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
