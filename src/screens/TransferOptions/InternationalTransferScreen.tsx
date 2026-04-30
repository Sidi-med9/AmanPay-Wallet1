import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useWallet } from "../../context/WalletContext";
import { DesignSystem } from "../../constants/DesignSystem";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Globe, Building, ChevronDown, Phone, Banknote, ChevronLeft, ChevronRight } from "lucide-react-native";
import { CountryPickerModal, CountryData, COUNTRIES } from "../../components/CountryPickerModal";

export const InternationalTransferScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const { intermediaries } = useWallet();
  const isRtl = i18n.dir() === "rtl";
  const textAlign = isRtl ? "right" : "left";
  const rowMain = isRtl ? ("row-reverse" as const) : ("row" as const);
  const Chevron = isRtl ? ChevronRight : ChevronLeft;

  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[1]);
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedIntermediary, setSelectedIntermediary] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    if (!receiver || receiver.trim() === "" || receiver.startsWith("+")) {
      setReceiver(`${country.code} `);
    }
  };

  const handleNext = () => {
    navigation.navigate("Envelopes", {
      receiver,
      amount,
      country: selectedCountry.name,
      intermediaryId: selectedIntermediary,
      type: "international",
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{t("transfersIntl.title")}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
            {t("transfersIntl.destinationCountry")}
          </Text>
          <TouchableOpacity
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: DesignSystem.borderRadius.lg,
                flexDirection: rowMain,
              },
            ]}
            onPress={() => setPickerVisible(true)}
          >
            <Chevron color={colors.secondaryText} size={20} />
            <Text style={[styles.inputText, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
              {selectedCountry.flag} {selectedCountry.name}
            </Text>
            <Globe color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
            {t("transfersIntl.receiverPhone")}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: DesignSystem.borderRadius.lg,
                flexDirection: rowMain,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}
              placeholder={`${selectedCountry.code} 00000000`}
              placeholderTextColor={colors.secondaryText}
              value={receiver}
              onChangeText={setReceiver}
              keyboardType="phone-pad"
            />
            <Phone size={20} color={colors.primary} />
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
            {t("transfersIntl.amountLabel", { currency: selectedCountry.currency })}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: DesignSystem.borderRadius.lg,
                flexDirection: rowMain,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}
              placeholder="0.00"
              placeholderTextColor={colors.secondaryText}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Banknote size={20} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
          {t("transfersIntl.intermediaryTitle")}
        </Text>

        {intermediaries.map((int) => (
          <TouchableOpacity
            key={int.id}
            style={[
              styles.agentCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedIntermediary === int.id ? colors.primary : colors.border,
                borderRadius: DesignSystem.borderRadius.xl,
              },
              selectedIntermediary === int.id && {
                ...DesignSystem.shadows.light,
                backgroundColor: isDark ? "#0C182B" : "#F0FDFA",
              },
            ]}
            onPress={() => setSelectedIntermediary(int.id)}
          >
            <View style={[styles.agentHeader, { flexDirection: rowMain }]}>
              <View style={[styles.agentInfo, { alignItems: isRtl ? "flex-end" : "flex-start" }]}>
                <Text style={[styles.agentName, { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                  {int.name}
                </Text>
                <Text style={[styles.agentFee, { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign }]}>
                  {t("transfersIntl.feeLine", { fee: int.fee, speed: int.speed })}
                </Text>
              </View>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: selectedIntermediary === int.id ? colors.primary + "15" : colors.border },
                ]}
              >
                <Building color={selectedIntermediary === int.id ? colors.primary : colors.secondaryText} size={22} />
              </View>
            </View>
            <View style={[styles.tagsRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
              {int.tags.map((tag: string, idx: number) => (
                <View key={idx} style={[styles.tag, { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
                  <Text style={[styles.tagText, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={t("transfersIntl.nextToEnvelopes")}
          onPress={handleNext}
          disabled={!receiver || !amount || !selectedIntermediary}
          style={{ height: 60 }}
        />
      </View>

      <CountryPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={handleCountrySelect} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, paddingBottom: 120 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 20, fontWeight: "bold" },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputWrapper: { alignItems: "center", height: 60, borderWidth: 1, paddingHorizontal: 16, gap: 12 },
  inputText: { flex: 1, fontSize: 16 },
  input: { flex: 1, height: "100%", fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 24, marginBottom: 16 },
  agentCard: { padding: 20, borderWidth: 1, marginBottom: 16 },
  agentHeader: { alignItems: "center", marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginHorizontal: 8 },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  agentFee: { fontSize: 12 },
  tagsRow: { gap: 8, flexWrap: "wrap" },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: "600" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 40 },
});
