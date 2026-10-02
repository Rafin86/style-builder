import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";
import { convertUnit } from "../units";
import { MeasurementUnit } from "../types";

export function FieldInput({
  label,
  unit,
  value,
  onChangeValue,
  warning,
  helpText,
  autoFocus,
}: {
  label: string;
  unit: MeasurementUnit;
  value: string;
  onChangeValue: (v: string) => void;
  warning?: string;
  helpText?: string;
  autoFocus?: boolean;
}) {
  const numericValue = Number(value);
  const converted = value !== "" && !Number.isNaN(numericValue) ? convertUnit(numericValue, unit) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {helpText ? <Text style={styles.helpText}>{helpText}</Text> : null}
      <View style={[styles.inputRow, warning && styles.inputRowWarning]}>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeValue}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          autoFocus={autoFocus}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {converted ? (
        <Text style={styles.conversionText}>
          = {converted.value.toFixed(1)} {converted.unit}
        </Text>
      ) : null}
      {warning ? <Text style={styles.warningText}>{warning}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { fontSize: 16, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  helpText: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  inputRowWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningBg,
  },
  input: { flex: 1, fontSize: 22, paddingVertical: spacing.md, color: colors.text },
  unit: { fontSize: 16, color: colors.textSecondary, marginLeft: spacing.sm },
  conversionText: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  warningText: { fontSize: 13, color: colors.warning, marginTop: spacing.xs },
});
