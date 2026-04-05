import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Bhandara } from "@/types";
import { formatDistance } from "@/utils/distance";

interface Props {
  bhandara: Bhandara;
  distanceKm?: number;
}

const CATEGORY_CONFIG = {
  langar: { icon: "coffee", label: "Langar", color: "#e67e00" },
  temple: { icon: "sun", label: "Temple", color: "#c0392b" },
  gurudwara: { icon: "shield", label: "Gurudwara", color: "#27ae60" },
  community: { icon: "users", label: "Community", color: "#2980b9" },
  other: { icon: "heart", label: "Other", color: "#8e44ad" },
};

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "#e67e00" },
  ongoing: { label: "Ongoing Now", color: "#27ae60" },
  completed: { label: "Completed", color: "#95a5a6" },
};

export function BhandaraCard({ bhandara, distanceKm }: Props) {
  const colors = useColors();
  const router = useRouter();
  const cat = CATEGORY_CONFIG[bhandara.category];
  const status = STATUS_CONFIG[bhandara.status];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/bhandara/${bhandara.id}`);
      }}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.catBadge, { backgroundColor: cat.color + "20" }]}>
          <Feather name={cat.icon as any} size={12} color={cat.color} />
          <Text style={[styles.catText, { color: cat.color }]}>{cat.label}</Text>
        </View>
        <View style={styles.rightBadges}>
          {distanceKm !== undefined && (
            <View style={[styles.distBadge, { backgroundColor: colors.secondary }]}>
              <Feather name="navigation" size={11} color={colors.primary} />
              <Text style={[styles.distText, { color: colors.primary }]}>
                {formatDistance(distanceKm)}
              </Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {bhandara.title}
      </Text>

      <View style={styles.infoRow}>
        <Feather name="calendar" size={13} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          {formatDate(bhandara.date)} · {bhandara.time}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]} numberOfLines={1}>
          {bhandara.address}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Feather name="users" size={13} color={colors.primary} />
          <Text style={[styles.attendeesText, { color: colors.primary }]}>
            {bhandara.expectedAttendees.toLocaleString()} expected
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.border} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_600SemiBold" },
  rightBadges: { flexDirection: "row", alignItems: "center", gap: 6 },
  distBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  distText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", lineHeight: 22 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 12, flex: 1, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  attendeesText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
