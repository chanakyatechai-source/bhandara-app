import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Step = "phone" | "otp" | "name";

const DEMO_OTP = "1234";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useApp();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 300);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp !== DEMO_OTP) {
      setError("Incorrect OTP. Try 1234");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep("name");
    setTimeout(() => nameRef.current?.focus(), 300);
  };

  const handleFinish = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    await login(phone, name.trim());
    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.inner, { paddingTop: topPad + 40, paddingBottom: botPad + 24 }]}>
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "33", borderWidth: 2 }]}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Bhandara</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Find free community meals near you
          </Text>
        </View>

        <View style={styles.formSection}>
          {step === "phone" && (
            <>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Enter your number</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                We'll send an OTP to verify your identity
              </Text>
              <View style={[styles.phoneRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
                  <Text style={[styles.countryCodeText, { color: colors.foreground }]}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, { color: colors.foreground }]}
                  placeholder="Mobile number"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={(t) => { setPhone(t.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />
              </View>
            </>
          )}

          {step === "otp" && (
            <>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Enter OTP</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                Sent to +91 {phone}
              </Text>
              <View style={[styles.otpHint, { backgroundColor: colors.accent, borderColor: colors.primary + "33" }]}>
                <Feather name="info" size={14} color={colors.primary} />
                <Text style={[styles.otpHintText, { color: colors.primary }]}>
                  Demo OTP: <Text style={{ fontWeight: "700" }}>1234</Text>
                </Text>
              </View>
              <TextInput
                ref={otpRef}
                style={[styles.otpInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="4-digit OTP"
                placeholderTextColor={colors.mutedForeground}
                value={otp}
                onChangeText={(t) => { setOtp(t.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                keyboardType="numeric"
                maxLength={4}
                returnKeyType="done"
                onSubmitEditing={handleVerifyOtp}
              />
              <TouchableOpacity onPress={() => { setStep("phone"); setOtp(""); setError(""); }}>
                <Text style={[styles.resendText, { color: colors.primary }]}>Change number</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "name" && (
            <>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Your name</Text>
              <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
                How should we address you?
              </Text>
              <TextInput
                ref={nameRef}
                style={[styles.nameInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Full name"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={(t) => { setName(t); setError(""); }}
                returnKeyType="done"
                onSubmitEditing={handleFinish}
              />
            </>
          )}

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: "#c0392b11" }]}>
              <Feather name="alert-circle" size={14} color="#c0392b" />
              <Text style={[styles.errorText, { color: "#c0392b" }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={step === "phone" ? handleSendOtp : step === "otp" ? handleVerifyOtp : handleFinish}
            activeOpacity={0.85}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>
                  {step === "phone" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Get Started"}
                </Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.steps}>
            {(["phone", "otp", "name"] as Step[]).map((s, i) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      s === step
                        ? colors.primary
                        : ["phone", "otp", "name"].indexOf(step) > i
                        ? colors.primary + "60"
                        : colors.border,
                    width: s === step ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, gap: 40 },
  logoSection: { alignItems: "center", gap: 12 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  logo: { width: 68, height: 68, borderRadius: 16 },
  appName: { fontSize: 32, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  formSection: { gap: 16 },
  stepTitle: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  stepSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: -8 },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: "hidden",
  },
  countryCode: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  countryCodeText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    letterSpacing: 1,
  },
  otpHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  otpHintText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  otpInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 12,
    textAlign: "center",
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  resendText: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  steps: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 },
  stepDot: { height: 8, borderRadius: 4 },
});
