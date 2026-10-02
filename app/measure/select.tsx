import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getClients, getTemplates } from "@/storage";
import { Client, MeasurementMethod, MeasurementTemplate } from "@/types";
import { colors, spacing } from "@/theme";

export default function SelectMeasurement() {
  const params = useLocalSearchParams<{ clientId?: string; templateId?: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<MeasurementTemplate[]>([]);
  const [clientId, setClientId] = useState<string | undefined>(params.clientId);
  const [templateId, setTemplateId] = useState<string | undefined>(params.templateId);
  const [method, setMethod] = useState<MeasurementMethod>("guided");

  useFocusEffect(
    useCallback(() => {
      getClients().then(setClients);
      getTemplates().then(setTemplates);
    }, [])
  );

  const canContinue = clientId && templateId;

  const proceed = () => {
    if (!canContinue) return;
    if (method === "photo") {
      router.push({ pathname: "/measure/photo", params: { clientId, templateId } });
    } else {
      router.push({ pathname: "/measure/guided", params: { clientId, templateId } });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.sectionLabel}>Client</Text>
        {clients.length === 0 ? (
          <Pressable style={styles.linkRow} onPress={() => router.push("/clients/new")}>
            <Text style={styles.linkText}>Add a client first</Text>
          </Pressable>
        ) : (
          <View style={styles.chipRow}>
            {clients.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, clientId === c.id && styles.chipActive]}
                onPress={() => setClientId(c.id)}
              >
                <Text style={clientId === c.id ? styles.chipTextActive : styles.chipText}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Template</Text>
        {templates.length === 0 ? (
          <Pressable style={styles.linkRow} onPress={() => router.push("/templates/create")}>
            <Text style={styles.linkText}>Create a template first</Text>
          </Pressable>
        ) : (
          <View style={styles.chipRow}>
            {templates.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.chip, templateId === t.id && styles.chipActive]}
                onPress={() => setTemplateId(t.id)}
              >
                <Text style={templateId === t.id ? styles.chipTextActive : styles.chipText}>{t.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.sectionLabel}>Method</Text>
        <Pressable style={[styles.methodCard, method === "guided" && styles.methodCardActive]} onPress={() => setMethod("guided")}>
          <Text style={styles.methodTitle}>Guided manual (recommended)</Text>
          <Text style={styles.methodSubtitle}>
            Step through each measurement with a tape measure. Built-in checks flag anything that
            looks off before you save.
          </Text>
        </Pressable>
        <Pressable style={[styles.methodCard, method === "photo" && styles.methodCardActive]} onPress={() => setMethod("photo")}>
          <Text style={styles.methodTitle}>Photo-assisted (beta)</Text>
          <Text style={styles.methodSubtitle}>
            Capture two reference photos to prefill estimates, then confirm or adjust every value
            in the guided flow. Needs a network connection.
          </Text>
        </Pressable>

        <Pressable style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]} onPress={proceed} disabled={!canContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextActive: { color: "#fff", fontSize: 14 },
  linkRow: { paddingVertical: spacing.sm },
  linkText: { color: colors.accent, fontSize: 14, fontWeight: "500" },
  methodCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  methodCardActive: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  methodTitle: { fontSize: 15, fontWeight: "500", color: colors.text },
  methodSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  continueButton: { backgroundColor: colors.accent, borderRadius: 12, padding: spacing.md, alignItems: "center", marginTop: spacing.lg },
  continueButtonDisabled: { opacity: 0.4 },
  continueButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
