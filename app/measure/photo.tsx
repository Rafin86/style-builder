import { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTemplate } from "@/storage";
import { estimateMeasurementsFromPhotos } from "@/photoEstimation";
import { colors, spacing } from "@/theme";

type Stage = "front" | "side" | "height" | "processing";

export default function PhotoCapture() {
  const { clientId, templateId } = useLocalSearchParams<{ clientId: string; templateId: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [stage, setStage] = useState<Stage>("front");
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [sideUri, setSideUri] = useState<string | null>(null);
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const heightCm = (Number(heightFeet || 0) * 12 + Number(heightInches || 0)) * 2.54;

  const capture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
    if (stage === "front") {
      setFrontUri(photo?.uri ?? null);
      setStage("side");
    } else if (stage === "side") {
      setSideUri(photo?.uri ?? null);
      setStage("height");
    }
  };

  const runEstimate = async () => {
    if (!templateId || !frontUri || !sideUri || !heightFeet) return;
    setStage("processing");
    const template = await getTemplate(templateId);
    if (!template) return;
    const estimates = await estimateMeasurementsFromPhotos({
      frontPhotoUri: frontUri,
      sidePhotoUri: sideUri,
      referenceHeightCm: heightCm,
      fields: template.fields,
    });
    router.replace({
      pathname: "/measure/guided",
      params: { clientId, templateId, prefill: JSON.stringify(estimates) },
    });
  };

  if (stage === "height") {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={{ padding: spacing.lg, flex: 1, justifyContent: "center" }}>
          <Text style={styles.title}>One more thing</Text>
          <Text style={styles.subtitle}>
            Enter the client's height. This is the reference scale used to estimate measurements
            from the two photos.
          </Text>
          <View style={styles.heightRow}>
            <View style={styles.heightField}>
              <TextInput
                style={styles.input}
                value={heightFeet}
                onChangeText={setHeightFeet}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                autoFocus
              />
              <Text style={styles.heightUnitLabel}>feet</Text>
            </View>
            <View style={styles.heightField}>
              <TextInput
                style={styles.input}
                value={heightInches}
                onChangeText={setHeightInches}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
              <Text style={styles.heightUnitLabel}>inches</Text>
            </View>
          </View>
          <Pressable style={[styles.captureButton, !heightFeet && styles.captureButtonDisabled]} onPress={runEstimate} disabled={!heightFeet}>
            <Text style={styles.captureButtonText}>Estimate measurements</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (stage === "processing") {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.subtitle}>Estimating measurements…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.centered}>
          <Text style={styles.subtitle}>Camera access is needed to capture reference photos.</Text>
          <Pressable style={styles.captureButton} onPress={requestPermission}>
            <Text style={styles.captureButtonText}>Grant camera access</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.cameraContainer} edges={["bottom"]}>
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            {stage === "front" ? "Stand facing the camera, arms slightly out" : "Now turn to your side"}
          </Text>
        </View>
      </View>
      <View style={styles.captureBar}>
        <Pressable style={styles.shutterOuter} onPress={capture}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 22, fontWeight: "500", color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 18,
    color: colors.text,
  },
  heightRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  heightField: { flex: 1 },
  heightUnitLabel: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center" },
  overlay: { position: "absolute", top: spacing.xl, left: 0, right: 0, alignItems: "center" },
  overlayText: { color: "#fff", fontSize: 15, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8 },
  captureBar: { height: 120, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  shutterOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
  captureButton: { backgroundColor: colors.accent, borderRadius: 12, padding: spacing.md, alignItems: "center" },
  captureButtonDisabled: { opacity: 0.4 },
  captureButtonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
