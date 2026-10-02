import { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteTemplate, getTemplate, newId, saveTemplate } from "@/storage";
import { MeasurementTemplate } from "@/types";
import { colors, spacing } from "@/theme";
import { convertUnit } from "@/units";

export default function TemplateDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [template, setTemplate] = useState<MeasurementTemplate | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (id) getTemplate(id).then((t) => setTemplate(t ?? null));
    }, [id])
  );

  if (!template) return null;

  const duplicate = async () => {
    const copy: MeasurementTemplate = {
      ...template,
      id: newId(),
      name: `${template.name} (copy)`,
      isCustom: true,
      createdAt: Date.now(),
    };
    await saveTemplate(copy);
    router.replace(`/templates/${copy.id}`);
  };

  const remove = () => {
    Alert.alert("Delete template", `Delete "${template.name}"? This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTemplate(template.id);
          router.replace("/templates");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.name}>{template.name}</Text>
        {template.description ? <Text style={styles.description}>{template.description}</Text> : null}

        <Text style={styles.sectionLabel}>Measurement points</Text>
        {template.fields.map((f) => {
          const boundsText =
            f.min !== undefined || f.max !== undefined ? ` · ${f.min ?? "–"}–${f.max ?? "–"}` : "";
          const convertedBoundsText =
            f.min !== undefined && f.max !== undefined
              ? ` (${convertUnit(f.min, f.unit).value.toFixed(1)}–${convertUnit(f.max, f.unit).value.toFixed(1)} ${
                  convertUnit(f.min, f.unit).unit
                })`
              : "";
          return (
            <View key={f.id} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <Text style={styles.fieldMeta}>
                {f.unit}
                {boundsText}
                {convertedBoundsText}
              </Text>
            </View>
          );
        })}

        <View style={{ height: spacing.lg }} />

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push({ pathname: "/measure/select", params: { templateId: template.id } })}
        >
          <Text style={styles.primaryButtonText}>Start a measurement with this template</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push({ pathname: "/templates/create", params: { templateId: template.id } })}
        >
          <Text style={styles.secondaryButtonText}>Edit fields</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={duplicate}>
          <Text style={styles.secondaryButtonText}>Duplicate as new template</Text>
        </Pressable>
        <Pressable style={styles.dangerButton} onPress={remove}>
          <Text style={styles.dangerButtonText}>Delete template</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  name: { fontSize: 22, fontWeight: "500", color: colors.text },
  description: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs },
  sectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: { fontSize: 15, color: colors.text },
  fieldMeta: { fontSize: 13, color: colors.textSecondary },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  secondaryButtonText: { color: colors.text, fontSize: 15, fontWeight: "500" },
  dangerButton: { borderRadius: 12, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
  dangerButtonText: { color: colors.danger, fontSize: 15, fontWeight: "500" },
});
