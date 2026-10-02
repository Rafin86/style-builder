import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { newId, saveClient } from "@/storage";
import { colors, spacing } from "@/theme";

export default function NewClient() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const save = async () => {
    if (!name.trim()) {
      Alert.alert("Add a name", "Enter the client's name to continue.");
      return;
    }
    const client = { id: newId(), name: name.trim(), phone: phone.trim() || undefined, notes: notes.trim() || undefined, createdAt: Date.now() };
    await saveClient(client);
    router.replace(`/clients/${client.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={{ padding: spacing.lg }}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.textSecondary} />

        <Text style={styles.label}>Phone (optional)</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Fit preferences, fabric notes, etc." placeholderTextColor={colors.textSecondary} multiline />

        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>Save client</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 14, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  saveButton: { backgroundColor: colors.accent, borderRadius: 12, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
