import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";

function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function Home() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.heading}>Bespoke Measure</Text>
      <Text style={styles.subheading}>
        Take guided measurements, optionally speed things up with a photo estimate, and keep
        everything organized by garment template.
      </Text>

      <ActionCard
        icon="body-outline"
        title="New measurement"
        subtitle="Guided entry, with optional photo assist"
        onPress={() => router.push("/measure/select")}
      />
      <ActionCard
        icon="people-outline"
        title="Clients"
        subtitle="View measurement history"
        onPress={() => router.push("/clients")}
      />
      <ActionCard
        icon="grid-outline"
        title="Templates"
        subtitle="Define measurement points per garment style"
        onPress={() => router.push("/templates")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  heading: { fontSize: 26, fontWeight: "500", color: colors.text, marginBottom: spacing.xs },
  subheading: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgMuted,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentBg,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "500", color: colors.text },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
