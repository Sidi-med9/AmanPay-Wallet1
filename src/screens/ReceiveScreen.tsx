import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { PrimaryButton } from "../components/PrimaryButton";
import { Copy, QrCode } from "lucide-react-native";

export const ReceiveScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const isRtl = i18n.dir() === "rtl";
  const textAlign = isRtl ? "right" : "left";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text, textAlign }]}>{t("receive.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText, textAlign }]}>
            {t("receive.subtitle")}
          </Text>

          <View style={[styles.qrPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <QrCode size={120} color={colors.primary} />
          </View>

          <Text style={[styles.idLabel, { color: colors.secondaryText, textAlign }]}>{t("receive.amanpayId")}</Text>
          <View style={[styles.idBox, { backgroundColor: colors.background, borderColor: colors.border, flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <Text style={[styles.idValue, { color: colors.text, textAlign }]}>{user?.referenceId || user?.id}</Text>
            <TouchableOpacity>
              <Copy size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.idLabel, { color: colors.secondaryText, marginTop: 16, textAlign }]}>
            {t("receive.phone")}
          </Text>
          <View style={[styles.idBox, { backgroundColor: colors.background, borderColor: colors.border, flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <Text style={[styles.idValue, { color: colors.text, textAlign }]}>{user?.phone}</Text>
            <TouchableOpacity>
              <Copy size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title={t("receive.shareLink")} onPress={() => {}} style={{ marginBottom: 16 }} />
          <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtnText, { color: colors.text }]}>{t("receive.backHome")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  card: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  qrPlaceholder: { height: 200, borderRadius: 16, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  idLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  idBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 12, borderWidth: 1 },
  idValue: { fontSize: 18, fontWeight: "bold", flex: 1 },
  actions: { width: "100%" },
  backBtn: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  backBtnText: { fontSize: 16, fontWeight: "600" },
});
