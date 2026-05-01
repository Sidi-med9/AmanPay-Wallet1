import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Sparkles, Send } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { DesignSystem } from "../constants/DesignSystem";
import { getAssistantRecommendation } from "../services/amanpayApi";

export const AiAssistantScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [tips, setTips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isRtl = i18n.dir() === "rtl";

  const ask = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssistantRecommendation({
        prompt,
        language: i18n.language,
      });
      setSummary(data.summary);
      setTips(data.recommendations);
    } catch {
      setError(t("assistant.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.headerRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
            <Sparkles size={18} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("assistant.title")}
            </Text>
          </View>
          <Text
            style={[
              styles.subtitle,
              { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign: isRtl ? "right" : "left" },
            ]}
          >
            {t("assistant.subtitle")}
          </Text>
        </View>

        <View style={[styles.askCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            multiline
            placeholder={t("assistant.placeholder")}
            placeholderTextColor={colors.secondaryText}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border, fontFamily: DesignSystem.fonts.family, textAlign: isRtl ? "right" : "left" },
            ]}
          />
          <TouchableOpacity
            onPress={ask}
            disabled={loading}
            style={[styles.askBtn, { backgroundColor: colors.primary, opacity: loading ? 0.65 : 1 }]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Send size={16} color="#fff" />}
            <Text style={[styles.askBtnText, { color: "#fff", fontFamily: DesignSystem.fonts.family }]}>
              {t("assistant.ask")}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.danger, fontFamily: DesignSystem.fonts.family }]}>{error}</Text>
        ) : null}

        {summary ? (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.resultTitle, { color: colors.text, fontFamily: DesignSystem.fonts.family }]}>
              {t("assistant.summary")}
            </Text>
            <Text
              style={[
                styles.resultSummary,
                { color: colors.secondaryText, fontFamily: DesignSystem.fonts.family, textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {summary}
            </Text>
            {tips.map((tip, idx) => (
              <View key={idx} style={[styles.tipRow, { flexDirection: isRtl ? "row-reverse" : "row" }]}>
                <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
                <Text
                  style={[
                    styles.tipText,
                    { color: colors.text, fontFamily: DesignSystem.fonts.family, textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingBottom: 80, gap: 14 },
  headerCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  headerRow: { alignItems: "center", gap: 8, marginBottom: 6 },
  title: { fontSize: 17, fontWeight: "700" },
  subtitle: { fontSize: 12, lineHeight: 18 },
  askCard: { borderWidth: 1, borderRadius: 16, padding: 12 },
  input: { minHeight: 92, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  askBtn: {
    marginTop: 10,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  askBtnText: { fontSize: 14, fontWeight: "700" },
  resultCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  resultTitle: { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  resultSummary: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  tipRow: { alignItems: "flex-start", gap: 8, marginBottom: 7 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 20 },
  errorText: { fontSize: 12, fontWeight: "600" },
});
