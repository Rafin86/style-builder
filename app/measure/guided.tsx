import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getClient, getTemplate, newId, saveSession } from "@/storage";
import { validateMeasurements } from "@/validation";
import { MeasurementFieldDef, ValidationWarning } from "@/types";
import { FieldInput } from "@/components/FieldInput";
import { ProgressBar } from "@/components/ProgressBar";
import { colors, spacing } from "@/theme";
import { formatWithBothUnits } from "@/units";

export default function GuidedMeasurement() {
  const { clientId, templateId, prefill } = useLocalSearchParams<{
    clientId: string;
    templateId: string;
    prefill?: string;
  }>();

  const [fields, setFields] = useState<MeasurementFieldDef[]>([]);
  const [clientName, setClientName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [overridden, setOverridden] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!templateId) return;
    getTemplate(templateId).then((t) => {
      if (!t) return;
      setFields(t.fields);
      if (prefill) {
        try {
          const parsed = JSON.parse(prefill) as Record<string, number>;
          const asStrings: Record<string, string> = {};
          for (const key of Object.keys(parsed)) asStrings[key] = String(parsed[key]);
          setValues(asStrings);
        } catch {
          // ignore malformed prefill
        }
      }
    });
    if (clientId) getClient(clientId).then((c) => setClientName(c?.name ?? ""));
  }, [templateId, clientId, prefill]);

  const numericValues = useMemo(() => {
    const out: Record<string, number> = {};
    for (const field of fields) {
      const raw = values[field.id];
      if (raw !== undefined && raw !== "") out[field.id] = Number(raw);
    }
    return out;
  }, [values, fields]);

  const warnings: ValidationWarning[] = useMemo(
    () => validateMeasurements(fields, numericValues),
    [fields, numericValues]
  );

  const warningFor = (fieldId: string) => warnings.find((w) => w.fieldId === fieldId)?.message;

  if (fields.length === 0) return null;

  const currentField = fields[step];
  const isLastStep = step === fields.length - 1;

  const goNext = () => {
    if (isLastStep) setReviewing(true);
    else setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
  };

  const unresolvedWarnings = warnings.filter((w) => !overridden.has(w.fieldId));

  const finish = async () => {
    if (unresolvedWarnings.length > 0) {
      Alert.alert(
        "Some values look unusual",
        `${unresolvedWarnings.length} measurement${unresolvedWarnings.length === 1 ? "" : "s"} triggered a plausibility check. Review them before saving, or confirm to save anyway.`,
        [
          { text: "Review", style: "cancel" },
          {
            text: "Save anyway",
            onPress: async () => {
              setOverridden(new Set(warnings.map((w) => w.fieldId)));
              await commitSession(warnings.map((w) => w.fieldId));
            },
          },
        ]
      );
      return;
    }
    await commitSession([]);
  };

  const commitSession = async (overriddenWarnings: string[]) => {
    if (!clientId || !templateId) return;
    await saveSession({
      id: newId(),
      clientId,
      templateId,
      method: prefill ? "photo" : "guided",
      values: numericValues,
      overriddenWarnings,
      createdAt: Date.now(),
    });
    router.replace(`/clients/${clientId}`);
  };

  if (reviewing) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <Text style={styles.reviewTitle}>Review {clientName ? `for ${clientName}` : ""}</Text>
          {fields.map((f) => {
            const warning = warningFor(f.id);
            return (
              <Pressable
                key={f.id}
                style={styles.reviewRow}
                onPress={() => {
                  setReviewing(false);
                  setStep(fields.indexOf(f));
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewLabel}>{f.label}</Text>
                  {warning ? <Text style={styles.reviewWarning}>{warning}</Text> : null}
                </View>
                <Text style={styles.reviewValue}>
                  {values[f.id] && !Number.isNaN(Number(values[f.id]))
                    ? formatWithBothUnits(Number(values[f.id]), f.unit)
                    : "Not set"}
                </Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.saveButton} onPress={finish}>
            <Text style={styles.saveButtonText}>Save measurements</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={{ padding: spacing.lg, flex: 1 }}>
        <ProgressBar current={step + 1} total={fields.length} />
        <Text style={styles.stepCount}>
          {step + 1} of {fields.length}
        </Text>

        <FieldInput
          label={currentField.label}
          unit={currentField.unit}
          value={values[currentField.id] ?? ""}
          onChangeValue={(v) => setValues((prev) => ({ ...prev, [currentField.id]: v }))}
          warning={warningFor(currentField.id)}
          helpText={currentField.helpText}
          autoFocus
        />

        <View style={styles.navRow}>
          <Pressable style={[styles.navButton, step === 0 && styles.navButtonDisabled]} onPress={goBack} disabled={step === 0}>
            <Text style={styles.navButtonText}>Back</Text>
          </Pressable>
          <Pressable style={[styles.navButton, styles.navButtonPrimary]} onPress={goNext}>
            <Text style={styles.navButtonPrimaryText}>{isLastStep ? "Review" : "Next"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  stepCount: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl },
  navRow: { flexDirection: "row", gap: spacing.sm, marginTop: "auto" },
  navButton: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, alignItems: "center" },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { fontSize: 15, fontWeight: "500", color: colors.text },
  navButtonPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  navButtonPrimaryText: { fontSize: 15, fontWeight: "500", color: "#fff" },
  reviewTitle: { fontSize: 20, fontWeight: "500", color: colors.text, marginBottom: spacing.md },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewLabel: { fontSize: 15, color: colors.text },
  reviewWarning: { fontSize: 12, color: colors.warning, marginTop: 2 },
  reviewValue: { fontSize: 15, color: colors.textSecondary },
  saveButton: { backgroundColor: colors.accent, borderRadius: 12, padding: spacing.md, alignItems: "center", marginTop: spacing.lg },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
