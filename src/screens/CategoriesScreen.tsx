import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { DesignSystem } from "../constants/DesignSystem";
import { Plus } from "lucide-react-native";
import { CreateCategoryModal } from "../components/CreateCategoryModal";

export const CategoriesScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { categories } = useWallet();
  const [modalVisible, setModalVisible] = useState(false);
  const isRtl = i18n.dir() === "rtl";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
          <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{t("categories.title")}</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
            onPress={() => setModalVisible(true)}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: DesignSystem.borderRadius.xl,
                },
                DesignSystem.shadows.light,
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: cat.color + "15" }]}>
                <Text style={{ color: cat.color, fontSize: 24, fontWeight: "bold" }}>{cat.name.charAt(0)}</Text>
              </View>
              <Text style={[styles.catName, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{cat.name}</Text>
              <Text
                style={[styles.catDesc, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}
                numberOfLines={2}
              >
                {cat.description || t("categories.noDescription")}
              </Text>
              <View style={[styles.badge, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                <Text style={[styles.badgeText, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family }]}>
                  {t("categories.active")}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CreateCategoryModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 20, paddingBottom: 100 },
  header: { justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "bold" },
  addBtn: { width: 48, height: 48, justifyContent: "center", alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-between" },
  categoryCard: { width: "47%", padding: 16, borderWidth: 1, marginBottom: 8 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  catName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  catDesc: { fontSize: 12, marginBottom: 12, minHeight: 32 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "bold" },
});
