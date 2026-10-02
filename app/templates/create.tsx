import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getTemplate, newId, saveTemplate } from "@/storage";
import { MeasurementFieldDef, MeasurementUnit } from "@/types";
import { colors, spacing } from "@/theme";

interface DraftField extends MeasurementFieldDef {
  minText: string;
  maxText: string;
}

function blankField(): DraftField {
  return { id: newId(), label: "", unit: "cm", minText: "", maxText: "" };
}

export default function CreateTemplate() {
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<DraftField[]>([blankField()]);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    getTemplate(templateId).then((t) => {
      if (!t) return;
      setExistingId(t.id);
      setName(t.name);
      setDescription(t.description ?? "");
      setFields(
        t.fields.map((f) => ({
          ...f,
          minText: f.min !== undefined ? String(f.min) : "",
          maxText: f.max !== undefined ? String(f.max) : "",
        }))
      );
    });
  }, [templateId]);

  const updateField = (id: string, patch: Partial<DraftField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const addField = () => setFields((prev) => [...prev, blankField()]);

  const removeField = (id: string) => setFields((prev) => prev.filter((f) => f.id !== id));

  const toggleUnit = (id: string, unit: MeasurementUnit) => updateField(id, { unit });

  const save = async () => {
    const trimmedName = name.trim();
    const cleanFields = fields.filter((f) => f.label.trim().length > 0);

    if (!trimmedName) {
      Alert.alert("Add a template name", "Give this template a name, e.g. \"Women's blazer\".");
      return;
    }
    if (cleanFields.length === 0) {
      Alert.alert("Add at least one measurement", "Every template needs at least one measurement point.");
      return;
    }

    await saveTemplate({
      id: existingId ?? newId(),
      name: trimmedName,
      description: description.trim() || undefined,
      isCustom: true,
      createdAt: Date.now(),
      fields: cleanFields.map((f) => ({
        id: f.id,
        label: f.label.trim(),
        unit: f.unit,
        min: f.minText ? Number(f.minText) : undefined,
        max: f.maxText ? Number(f.maxText) : undefined,
        helpText: f.helpText,
      })),
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Template name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Women's blazer"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What garment or style this is for"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { marginTop: spacing.lg }]}>Measurement points</Text>
        <Text style={styles.hint}>
          Add any category unique to this style. Optional min/max bounds power the plausibility
          check during guided measurement.
        </Text>

        {fields.map((field, index) => (
          <View key={field.id} style={styles.fieldCard}>
            <View style={styles.fieldCardHeader}>
              <Text style={styles.fieldIndex}>#{index + 1}</Text>
              <Pressable onPress={() => removeField(field.id)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
            <TextInput
              style={styles.fieldInput}
              value={field.label}
              onChangeText={(v) => updateField(field.id, { label: v })}
              placeholder="Category name, e.g. Bicep circumference"
              placeholderTextColor={colors.textSecondary}
            />
            <View style={styles.row}>
              <Pressable
                style={[styles.unitToggle, field.unit === "cm" && styles.unitToggleActive]}
                onPress={() => toggleUnit(field.id, "cm")}
              >
                <Text style={field.unit === "cm" ? styles.unitTextActive : styles.unitText}>cm</Text>
              </Pressable>
              <Pressable
                style={[styles.unitToggle, field.unit === "in" && styles.unitToggleActive]}
                onPress={() => toggleUnit(field.id, "in")}
              >
                <Text style={field.unit === "in" ? styles.unitTextActive : styles.unitText}>in</Text>
              </Pressable>
              <TextInput
                style={styles.boundInput}
                value={field.minText}
                onChangeText={(v) => updateField(field.id, { minText: v })}
                placeholder="Min"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.boundInput}
                value={field.maxText}
                onChangeText={(v) => updateField(field.id, { maxText: v })}
                placeholder="Max"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        ))}

        <Pressable style={styles.addFieldButton} onPress={addField}>
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={styles.addFieldText}>Add measurement category</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>Save template</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  hint: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  fieldCard: {
    backgroundColor: colors.bgMuted,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fieldCardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  fieldIndex: { fontSize: 12, color: colors.textSecondary },
  fieldInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: "row", gap: spacing.sm },
  unitToggle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  unitToggleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  unitText: { fontSize: 13, color: colors.text },
  unitTextActive: { fontSize: 13, color: "#fff" },
  boundInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    fontSize: 13,
    color: colors.text,
  },
  addFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  addFieldText: { color: colors.accent, fontSize: 14, fontWeight: "500" },
  saveButton: { backgroundColor: colors.accent, borderRadius: 12, padding: spacing.md, alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
