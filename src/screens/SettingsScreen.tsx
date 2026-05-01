import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useSetLanguage } from "../context/LanguageContext";
import { DesignSystem } from "../constants/DesignSystem";
import { TRANSFER_AUTH_MODE_KEY } from "../constants/storageKeys";
import {
  Moon,
  Sun,
  Globe,
  LogOut,
  ChevronLeft,
  Edit3,
  X,
  User,
  Lock,
} from "lucide-react-native";
import type { AppLocale } from "../i18n/config";
import * as ImagePicker from "expo-image-picker";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/png?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Jack",
  "https://api.dicebear.com/7.x/avataaars/png?seed=Luna",
];

type LocalAuthModule = {
  hasHardwareAsync: () => Promise<boolean>;
  isEnrolledAsync: () => Promise<boolean>;
};

const getLocalAuth = (): LocalAuthModule | null => {
  try {
    return require("expo-local-authentication") as LocalAuthModule;
  } catch {
    return null;
  }
};

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const setLanguage = useSetLanguage();
  const { colors, isDark, setMode } = useTheme();
  const { user, signOut, updateProfile } = useAuth();
  const isRtl = i18n.dir() === "rtl";
  const textAlign = isRtl ? "right" : "left";

  const [darkToggle, setDarkToggle] = useState(isDark);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [langBusy, setLangBusy] = useState(false);

  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editAvatar, setEditAvatar] = useState(user?.avatar || "");

  useEffect(() => {
    if (!editModalVisible || !user) return;
    setEditName(user.name || "");
    setEditPhone(user.phone || "");
    setEditAvatar(user.avatar || "");
  }, [editModalVisible, user]);

  useEffect(() => {
    (async () => {
      try {
        const localAuth = getLocalAuth();
        if (!localAuth) {
          setBiometricAvailable(false);
          setBiometricEnabled(false);
          return;
        }
        const [hasHardware, enrolled] = await Promise.all([
          localAuth.hasHardwareAsync(),
          localAuth.isEnrolledAsync(),
        ]);
        const available = hasHardware && enrolled;
        setBiometricAvailable(available);
        const mode = await AsyncStorage.getItem(TRANSFER_AUTH_MODE_KEY);
        setBiometricEnabled(available && mode === "biometric");
      } catch {
        setBiometricAvailable(false);
        setBiometricEnabled(false);
      }
    })();
  }, []);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      // New API: MediaTypeOptions is deprecated in expo-image-picker.
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (!res.canceled && res.assets[0]?.uri) {
      setEditAvatar(res.assets[0].uri);
    }
  };

  const handleThemeToggle = (val: boolean) => {
    setDarkToggle(val);
    setMode(val ? "dark" : "light");
  };

  const handleBiometricToggle = async (val: boolean) => {
    if (!biometricAvailable) return;
    setBiometricEnabled(val);
    await AsyncStorage.setItem(TRANSFER_AUTH_MODE_KEY, val ? "biometric" : "password");
  };

  const pickLanguage = async (next: AppLocale) => {
    if (next === i18n.language || langBusy) return;
    setLangBusy(true);
    try {
      await setLanguage(next);
    } finally {
      setLangBusy(false);
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      name: editName,
      phone: editPhone,
      avatar: editAvatar,
    });
    setEditModalVisible(false);
  };

  const SettingRow = ({ icon, label, onPress, showSwitch, switchValue, onSwitchChange }: any) => (
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
        <View style={[styles.iconWrap, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>{icon}</View>
      </View>
    </TouchableOpacity>
  );

  const pillBase = (active: boolean) => [
    styles.langPill,
    {
      backgroundColor: active ? colors.primary : isDark ? "#1E293B" : "#F1F5F9",
      borderColor: active ? colors.primary : colors.border,
    },
  ];
  const pillText = (active: boolean) => ({
    color: active ? "#FFF" : colors.text,
    fontFamily: DesignSystem.fonts.family,
    fontWeight: "600" as const,
    fontSize: 14,
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
            {t("settings.title")}
          </Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: user?.avatar || "https://via.placeholder.com/150" }}
              style={[styles.avatar, { borderColor: colors.primary }]}
            />
            <TouchableOpacity
              style={[styles.editBadge, { backgroundColor: colors.primary }]}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit3 color="#FFF" size={14} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{user?.name}</Text>
          <Text style={[styles.phone, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
            {user?.phone}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
            {t("settings.accountSettings")}
          </Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl },
            ]}
          >
            <SettingRow
              icon={<User color={colors.primary} size={20} />}
              label={t("settings.editProfile")}
              onPress={() => setEditModalVisible(true)}
            />
            <SettingRow
              icon={<Lock color={colors.primary} size={20} />}
              label={t("settings.transferAuthBiometric")}
              showSwitch
              switchValue={biometricEnabled}
              onSwitchChange={handleBiometricToggle}
            />
            {!biometricAvailable ? (
              <Text style={[styles.bioHint, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                {t("settings.biometricUnavailable")}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
            {t("settings.appSettings")}
          </Text>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.card, borderColor: colors.border, borderRadius: DesignSystem.borderRadius.xl },
            ]}
          >
            <SettingRow
              icon={isDark ? <Moon color={colors.primary} size={20} /> : <Sun color={colors.primary} size={20} />}
              label={t("settings.darkMode")}
              showSwitch
              switchValue={darkToggle}
              onSwitchChange={handleThemeToggle}
            />

            <View style={[styles.langRow, { borderTopColor: colors.border }]}>
              <View style={styles.rowRight}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.rowText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                    {t("settings.language")}
                  </Text>
                  <Text
                    style={[
                      styles.langHint,
                      { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign },
                    ]}
                  >
                    {t("settings.languageHint")}
                  </Text>
                </View>
                <View style={[styles.iconWrap, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                  <Globe color={colors.primary} size={20} />
                </View>
              </View>
            </View>

            <View style={[styles.langPillsRow, { paddingHorizontal: 18, paddingBottom: 16 }]}>
              {langBusy ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View style={[styles.pills, isRtl && styles.pillsRtl]}>
                  <Pressable
                    onPress={() => pickLanguage("ar")}
                    style={({ pressed }) => [pillBase(i18n.language === "ar"), pressed && { opacity: 0.85 }]}
                    android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                  >
                    <Text style={pillText(i18n.language === "ar")}>{t("settings.arabic")}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => pickLanguage("en")}
                    style={({ pressed }) => [pillBase(i18n.language === "en"), pressed && { opacity: 0.85 }]}
                    android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                  >
                    <Text style={pillText(i18n.language === "en")}>{t("settings.english")}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutBtn,
            { backgroundColor: isDark ? "#1E293B" : "#FEE2E2", borderRadius: DesignSystem.borderRadius.xl },
          ]}
          onPress={signOut}
        >
          <LogOut color={colors.danger} size={22} />
          <Text style={[styles.logoutText, { color: colors.danger, fontFamily: DesignSystem.fonts.family }]}>
            {t("settings.signOut")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <X color={colors.secondaryText} size={24} />
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("settings.modalTitle")}
                </Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView contentContainerStyle={styles.modalForm}>
                <Text style={[styles.label, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("settings.choosePhoto")}
                </Text>
                <View style={styles.avatarOptions}>
                  {PRESET_AVATARS.map((url, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setEditAvatar(url)}
                      style={[
                        styles.avatarOption,
                        { borderColor: editAvatar === url ? colors.primary : "transparent" },
                      ]}
                    >
                      <Image source={{ uri: url }} style={styles.avatarOptionImg} />
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.galleryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={pickFromGallery}
                >
                  <Text style={[styles.galleryBtnText, { color: colors.primary, fontFamily: DesignSystem.fonts.family }]}>
                    {t("settings.chooseFromGallery")}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.label, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("auth.fullName")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                      borderRadius: DesignSystem.borderRadius.lg,
                      textAlign,
                    },
                  ]}
                  value={editName}
                  onChangeText={setEditName}
                />

                <Text style={[styles.label, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
                  {t("auth.phone")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                      borderRadius: DesignSystem.borderRadius.lg,
                      textAlign,
                    },
                  ]}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: colors.primary, borderRadius: DesignSystem.borderRadius.xl },
                  ]}
                  onPress={handleSaveProfile}
                >
                  <Text style={[styles.saveBtnText, { fontFamily: DesignSystem.fonts.family }]}>
                    {t("settings.saveChanges")}
                  </Text>
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
  header: { alignItems: "center", marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  profileCard: { alignItems: "center", marginBottom: 32 },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3 },
  editBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  phone: { fontSize: 16 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: "600", marginBottom: 12, marginRight: 8 },
  sectionCard: { borderWidth: 1, ...DesignSystem.shadows.light, overflow: "hidden" },
  bioHint: { fontSize: 12, paddingHorizontal: 18, paddingBottom: 12, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", padding: 18, borderBottomWidth: 1 },
  rowRight: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  rowText: { fontSize: 16, fontWeight: "500", marginRight: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  langRow: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8, borderTopWidth: 1 },
  langHint: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  langPillsRow: { alignItems: "center" },
  pills: { flexDirection: "row", gap: 10, justifyContent: "center" },
  pillsRtl: { flexDirection: "row-reverse" },
  langPill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    minWidth: 88,
    alignItems: "center",
  },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 18, marginTop: 12, gap: 12 },
  logoutText: { fontSize: 16, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  keyboardView: { width: "100%", height: "80%" },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalForm: { padding: 24 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 20 },
  avatarOptions: { flexDirection: "row", gap: 12, marginBottom: 10 },
  avatarOption: { borderWidth: 2, borderRadius: 34, padding: 2 },
  avatarOptionImg: { width: 60, height: 60, borderRadius: 30 },
  galleryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: DesignSystem.borderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 8,
  },
  galleryBtnText: { fontSize: 15, fontWeight: "700" },
  input: { height: 56, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
  saveBtn: { height: 60, marginTop: 40, justifyContent: "center", alignItems: "center", ...DesignSystem.shadows.medium },
  saveBtnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
});
