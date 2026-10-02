import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getClient, getSessionsForClient, getTemplates } from "@/storage";
import { Client, MeasurementSession, MeasurementTemplate } from "@/types";
import { colors, spacing } from "@/theme";
import { formatWithBothUnits } from "@/units";

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<MeasurementSession[]>([]);
  const [templates, setTemplates] = useState<MeasurementTemplate[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      getClient(id).then((c) => setClient(c ?? null));
      getSessionsForClient(id).then(setSessions);
      getTemplates().then(setTemplates);
    }, [id])
  );

  if (!client) return null;

  const templateName = (templateId: string) => templates.find((t) => t.id === templateId)?.name ?? "Unknown template";
  const templateFields = (templateId: string) => templates.find((t) => t.id === templateId)?.fields ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.name}>{client.name}</Text>
        {client.phone ? <Text style={styles.meta}>{client.phone}</Text> : null}
        {client.notes ? <Text style={styles.notes}>{client.notes}</Text> : null}

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push({ pathname: "/measure/select", params: { clientId: client.id } })}
        >
          <Text style={styles.primaryButtonText}>New measurement for {client.name.split(" ")[0]}</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Measurement history</Text>
        {sessions.length === 0 ? (
          <Text style={styles.empty}>No measurements recorded yet.</Text>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTemplate}>{templateName(session.templateId)}</Text>
                <Text style={styles.sessionMethod}>{session.method === "photo" ? "Photo-assisted" : "Guided"}</Text>
              </View>
              <Text style={styles.sessionDate}>{new Date(session.createdAt).toLocaleDateString()}</Text>
              {templateFields(session.templateId).map((f) => (
                <View key={f.id} style={styles.valueRow}>
                  <Text style={styles.valueLabel}>{f.label}</Text>
                  <Text style={styles.valueText}>
                    {session.values[f.id] !== undefined
                      ? formatWithBothUnits(session.values[f.id], f.unit)
                      : "—"}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  name: { fontSize: 22, fontWeight: "500", color: colors.text },
  meta: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  notes: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, fontStyle: "italic" },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  sectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  empty: { color: colors.textSecondary, fontSize: 14 },
  sessionCard: { backgroundColor: colors.bgMuted, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
  sessionHeader: { flexDirection: "row", justifyContent: "space-between" },
  sessionTemplate: { fontSize: 15, fontWeight: "500", color: colors.text },
  sessionMethod: { fontSize: 12, color: colors.accent },
  sessionDate: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  valueRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, gap: spacing.sm },
  valueLabel: { fontSize: 13, color: colors.textSecondary },
  valueText: { fontSize: 13, color: colors.text, fontWeight: "500", textAlign: "right" },
});
