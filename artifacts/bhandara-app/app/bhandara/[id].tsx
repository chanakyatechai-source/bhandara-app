import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { formatDistance, haversineDistance } from "@/utils/distance";

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

export default function BhandaraDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bhandaras } = useApp();

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const bhandara = bhandaras.find((b) => b.id === id);

  useEffect(() => {
    if (!bhandara) return;
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setDistanceKm(haversineDistance(lat, lng, bhandara.lat, bhandara.lng));
      } catch {}
    };
    getLocation();
  }, [bhandara]);

  const handleShare = async () => {
    if (!bhandara) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const distanceText =
      distanceKm !== null ? `\nDistance from you: ${formatDistance(distanceKm)}` : "";
    try {
      await Share.share({
        message:
          `Free Bhandara — ${bhandara.title}\n` +
          `Date: ${bhandara.date} at ${bhandara.time}\n` +
          `Location: ${bhandara.address}\n` +
          `Expected: ${bhandara.expectedAttendees.toLocaleString()} people` +
          distanceText +
          `\n\nShared via Bhandara App`,
        title: bhandara.title,
      });
    } catch {}
  };

  const handleDirections = () => {
    if (!bhandara) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const query = encodeURIComponent(bhandara.address);
    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${bhandara.lat},${bhandara.lng}`;
    const mapsUrl = Platform.OS === "ios"
      ? `maps://?daddr=${bhandara.lat},${bhandara.lng}`
      : googleUrl;
    Linking.openURL(mapsUrl).catch(() => Linking.openURL(googleUrl));
  };

  if (!bhandara) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 20, alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>Bhandara not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cat = CATEGORY_CONFIG[bhandara.category];
  const status = STATUS_CONFIG[bhandara.status];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: colors.foreground }]} numberOfLines={1}>
          Bhandara Detail
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          activeOpacity={0.8}
          style={[styles.shareBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="share-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 32 }]}
      >
        <View style={styles.badges}>
          <View style={[styles.catBadge, { backgroundColor: cat.color + "20" }]}>
            <Feather name={cat.icon as any} size={13} color={cat.color} />
            <Text style={[styles.catText, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{bhandara.title}</Text>

        {distanceKm !== null && (
          <View style={[styles.distanceCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "33" }]}>
            <Feather name="navigation" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.distanceValue, { color: colors.primary }]}>
                {formatDistance(distanceKm)} away
              </Text>
              <Text style={[styles.distanceHint, { color: colors.mutedForeground }]}>
                from your current location
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDirections}
              activeOpacity={0.85}
              style={[styles.directionsBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="map-pin" size={14} color="#fff" />
              <Text style={styles.directionsBtnText}>Go</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow icon="calendar" label={formatDate(bhandara.date)} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon="clock" label={bhandara.time} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon="map-pin" label={bhandara.address} colors={colors} />
          <Divider colors={colors} />
          <InfoRow icon="user" label={`Organizer: ${bhandara.organizer}`} colors={colors} />
          <Divider colors={colors} />
          <InfoRow
            icon="users"
            label={`${bhandara.expectedAttendees.toLocaleString()} people expected`}
            colors={colors}
          />
        </View>

        {!!bhandara.description && (
          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descLabel, { color: colors.mutedForeground }]}>About this Bhandara</Text>
            <Text style={[styles.descText, { color: colors.foreground }]}>{bhandara.description}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handleDirections}
            activeOpacity={0.85}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="navigation" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Get Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.85}
            style={[styles.actionBtnOutline, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Feather name="share-2" size={18} color={colors.primary} />
            <Text style={[styles.actionBtnOutlineText, { color: colors.primary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {distanceKm === null && (
          <View style={[styles.noLocationNote, { backgroundColor: colors.secondary }]}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.noLocationText, { color: colors.mutedForeground }]}>
              Allow location access to see your distance to this bhandara
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon as any} size={16} color={colors.primary} />
      <Text style={[styles.infoText, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

function Divider({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  topBarTitle: { flex: 1, fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  shareBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  badges: { flexDirection: "row", gap: 8 },
  catBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  catText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  title: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold", lineHeight: 32 },
  distanceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  distanceValue: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  distanceHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  directionsBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  infoCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16 },
  infoText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  divider: { height: 1, marginHorizontal: 16 },
  descCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 8 },
  descLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  descText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  actionBtnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnOutlineText: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  noLocationNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  noLocationText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular" },
});
