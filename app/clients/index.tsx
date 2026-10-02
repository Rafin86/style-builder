import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { getClients } from "@/storage";
import { Client } from "@/types";
import { colors, spacing } from "@/theme";

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);

  useFocusEffect(
    useCallback(() => {
      getClients().then(setClients);
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={clients}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={<Text style={styles.empty}>No clients yet.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/clients/${item.id}`)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push("/clients/new")}>
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
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.accent, fontWeight: "500", fontSize: 13 },
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
