import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.accent,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Bespoke Measure" }} />
        <Stack.Screen name="templates/index" options={{ title: "Templates" }} />
        <Stack.Screen name="templates/create" options={{ title: "New template" }} />
        <Stack.Screen name="templates/[id]" options={{ title: "Template" }} />
        <Stack.Screen name="clients/index" options={{ title: "Clients" }} />
        <Stack.Screen name="clients/new" options={{ title: "New client" }} />
        <Stack.Screen name="clients/[id]" options={{ title: "Client" }} />
        <Stack.Screen name="measure/select" options={{ title: "New measurement" }} />
        <Stack.Screen name="measure/guided" options={{ title: "Guided measurement" }} />
        <Stack.Screen name="measure/photo" options={{ title: "Photo capture" }} />
      </Stack>
    </>
  );
}
