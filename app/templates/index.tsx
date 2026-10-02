import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTemplates } from "@/storage";
import { MeasurementTemplate } from "@/types";
import { colors, spacing } from "@/theme";

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState<MeasurementTemplate[]>([]);

  useFocusEffect(
    useCallback(() => {
      getTemplates().then(setTemplates);
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={templates}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={<Text style={styles.empty}>No templates yet.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/templates/${item.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.fields.length} measurement{item.fields.length === 1 ? "" : "s"}
                {item.isCustom ? " · custom" : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push("/templates/create")}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgMuted,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { fontSize: 16, fontWeight: "500", color: colors.text },
  meta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: spacing.xl },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
