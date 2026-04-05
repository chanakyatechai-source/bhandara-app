import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BhandaraCard } from "@/components/BhandaraCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, getMyBhandaras, deleteBhandara } = useApp();
  const [tab, setTab] = useState<"posted" | "about">("posted");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const myBhandaras = getMyBhandaras();

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleDeleteBhandara = (id: string, title: string) => {
    Alert.alert("Delete Bhandara", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteBhandara(id);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={[styles.logoutBtn, { backgroundColor: "#c0392b11" }]}
        >
          <Feather name="log-out" size={16} color="#c0392b" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tab === "posted" ? myBhandaras : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0) },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "25" }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.foreground }]}>
                  {user?.name ?? "User"}
                </Text>
                <Text style={[styles.profilePhone, { color: colors.mutedForeground }]}>
                  +91 {user?.phone}
                </Text>
                <Text style={[styles.profileSince, { color: colors.mutedForeground }]}>
                  Member since{" "}
                  {user ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : ""}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{myBhandaras.length}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Posted</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: "#27ae60" }]}>
                  {myBhandaras.filter((b) => b.status === "upcoming").length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Upcoming</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statNum, { color: "#7f8c8d" }]}>
                  {myBhandaras.filter((b) => b.status === "completed").length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completed</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/add")}
              activeOpacity={0.85}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="plus-circle" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Add New Bhandara</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              My Posted Bhandaras ({myBhandaras.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <BhandaraCard bhandara={item} />
            <TouchableOpacity
              onPress={() => handleDeleteBhandara(item.id, item.title)}
              activeOpacity={0.8}
              style={[styles.deleteRow, { borderColor: colors.border }]}
            >
              <Feather name="trash-2" size={14} color="#c0392b" />
              <Text style={styles.deleteRowText}>Remove this bhandara</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          tab === "posted" ? (
            <View style={styles.empty}>
              <Feather name="plus-circle" size={40} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
                No bhandaras posted yet
              </Text>
              <Text style={[styles.emptyHint, { color: colors.muted }]}>
                Share a free community meal with your neighbors
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: { color: "#c0392b", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 20 },
  listHeader: { paddingTop: 16, gap: 14 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  profilePhone: { fontSize: 14, fontFamily: "Inter_400Regular" },
  profileSince: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statNum: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  addBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginTop: -8,
    marginBottom: 12,
  },
  deleteRowText: { fontSize: 12, color: "#c0392b", fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  emptyHint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
