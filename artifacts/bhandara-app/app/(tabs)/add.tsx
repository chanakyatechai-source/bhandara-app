import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { Bhandara, BhandaraCategory } from "@/types";

const CATEGORIES: { key: BhandaraCategory; label: string; icon: string; color: string }[] = [
  { key: "langar", label: "Langar", icon: "coffee", color: "#e67e00" },
  { key: "temple", label: "Temple", icon: "sun", color: "#c0392b" },
  { key: "gurudwara", label: "Gurudwara", icon: "shield", color: "#27ae60" },
  { key: "community", label: "Community", icon: "users", color: "#2980b9" },
  { key: "other", label: "Other", icon: "heart", color: "#8e44ad" },
];

const DELHI_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  "connaught place": { lat: 28.6328, lng: 77.2197 },
  chandni: { lat: 28.6507, lng: 77.2334 },
  "karol bagh": { lat: 28.6514, lng: 77.1907 },
  saket: { lat: 28.5245, lng: 77.2066 },
  dwarka: { lat: 28.5823, lng: 77.0469 },
  rohini: { lat: 28.7495, lng: 77.0663 },
  lajpat: { lat: 28.5664, lng: 77.2378 },
  noida: { lat: 28.5355, lng: 77.3910 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
};

function guessCoords(address: string): { lat: number; lng: number } {
  const lower = address.toLowerCase();
  for (const [key, coords] of Object.entries(DELHI_LOCATIONS)) {
    if (lower.includes(key)) return coords;
  }
  const jitter = (Math.random() - 0.5) * 0.1;
  return { lat: 28.6139 + jitter, lng: 77.209 + jitter };
}

export default function AddBhandaraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addBhandara } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<BhandaraCategory>("temple");
  const [expectedAttendees, setExpectedAttendees] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !date.trim() || !address.trim()) {
      Alert.alert("Missing Info", "Please fill in title, date, and address.");
      return;
    }
    const coords = guessCoords(address);
    addBhandara({
      title: title.trim(),
      date,
      time: time || "12:00 PM",
      address: address.trim(),
      description: description.trim(),
      organizer: organizer.trim() || "Anonymous",
      lat: coords.lat,
      lng: coords.lng,
      category,
      expectedAttendees: parseInt(expectedAttendees) || 100,
      status: "upcoming",
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  };

  const handleReset = () => {
    setTitle(""); setDate(""); setTime(""); setAddress("");
    setOrganizer(""); setDescription(""); setCategory("temple");
    setExpectedAttendees(""); setSubmitted(false);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.successScreen, { paddingTop: topPad + 40 }]}>
          <View style={[styles.successCircle, { backgroundColor: "#27ae6020", borderColor: "#27ae6040" }]}>
            <Feather name="check-circle" size={64} color="#27ae60" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Bhandara Submitted!
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground }]}>
            Your bhandara has been added and is now visible to everyone nearby.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            activeOpacity={0.85}
            style={[styles.viewBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="map-pin" size={18} color="#fff" />
            <Text style={styles.viewBtnText}>View on Map</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.8}>
            <Text style={[styles.addAnotherText, { color: colors.primary }]}>
              Add another bhandara
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Add Bhandara</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Share a free meal with the community
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.form, { paddingBottom: botPad + 24 }]}
      >
        <View style={styles.categorySection}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            Type of Bhandara
          </Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                activeOpacity={0.8}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor:
                      category === cat.key ? cat.color + "20" : colors.card,
                    borderColor: category === cat.key ? cat.color : colors.border,
                    borderWidth: category === cat.key ? 2 : 1,
                  },
                ]}
              >
                <Feather
                  name={cat.icon as any}
                  size={22}
                  color={category === cat.key ? cat.color : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: category === cat.key ? cat.color : colors.mutedForeground },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FieldGroup label="Event Title *" colors={colors}>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder="e.g. Guru Nanak Jayanti Langar"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
          />
        </FieldGroup>

        <View style={styles.row}>
          <FieldGroup label="Date * (YYYY-MM-DD)" colors={colors} style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="2026-04-15"
              placeholderTextColor={colors.mutedForeground}
              value={date}
              onChangeText={setDate}
            />
          </FieldGroup>
          <FieldGroup label="Time" colors={colors} style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="10:00 AM"
              placeholderTextColor={colors.mutedForeground}
              value={time}
              onChangeText={setTime}
            />
          </FieldGroup>
        </View>

        <FieldGroup label="Location / Address *" colors={colors}>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder="Temple or Gurudwara name, area, city"
            placeholderTextColor={colors.mutedForeground}
            value={address}
            onChangeText={setAddress}
          />
          <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
            Include area name for better map placement (e.g. Connaught Place, Karol Bagh)
          </Text>
        </FieldGroup>

        <View style={styles.row}>
          <FieldGroup label="Organizer" colors={colors} style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="Your name / committee"
              placeholderTextColor={colors.mutedForeground}
              value={organizer}
              onChangeText={setOrganizer}
            />
          </FieldGroup>
          <FieldGroup label="Expected Attendees" colors={colors} style={{ flex: 1 }}>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="300"
              placeholderTextColor={colors.mutedForeground}
              value={expectedAttendees}
              onChangeText={setExpectedAttendees}
              keyboardType="numeric"
            />
          </FieldGroup>
        </View>

        <FieldGroup label="Description" colors={colors}>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder="What food will be served? Any special occasion?"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </FieldGroup>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Submit Bhandara</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function FieldGroup({
  label,
  children,
  colors,
  style,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
  style?: object;
}) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 4,
  },
  headerTitle: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  form: { paddingHorizontal: 20, paddingTop: 20, gap: 18 },
  categorySection: { gap: 10 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryBtn: {
    flex: 1,
    minWidth: "28%",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
  },
  categoryLabel: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  fieldLabel: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: -2 },
  row: { flexDirection: "row", gap: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  textArea: { height: 90, textAlignVertical: "top", paddingTop: 12 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 4,
  },
  submitBtnText: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  successScreen: { flex: 1, alignItems: "center", paddingHorizontal: 32, gap: 20 },
  successCircle: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  successTitle: { fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  successSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 18,
    marginTop: 8,
  },
  viewBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  addAnotherText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
