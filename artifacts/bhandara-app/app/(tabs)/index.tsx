import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import BhandaraMap from "@/components/BhandaraMap";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { haversineDistance } from "@/utils/distance";

type ViewMode = "list" | "map";

export default function FindBhandaraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bhandaras } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUserLat(28.6139);
        setUserLng(77.2090);
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLat(loc.coords.latitude);
      setUserLng(loc.coords.longitude);
    } catch {
      setUserLat(28.6139);
      setUserLng(77.2090);
    } finally {
      setLocationLoading(false);
    }
  };

  const bhandarasWithDistance = useMemo(() => {
    return bhandaras
      .filter((b) => b.status !== "completed")
      .map((b) => ({
        ...b,
        distanceKm:
          userLat !== null && userLng !== null
            ? haversineDistance(userLat, userLng, b.lat, b.lng)
            : undefined,
      }))
      .sort((a, b) =>
        a.distanceKm !== undefined && b.distanceKm !== undefined
          ? a.distanceKm - b.distanceKm
          : 0
      );
  }, [bhandaras, userLat, userLng]);

  const filtered = useMemo(() => {
    if (filter === "all") return bhandarasWithDistance;
    return bhandarasWithDistance.filter((b) => b.category === filter);
  }, [bhandarasWithDistance, filter]);

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "langar", label: "Langar" },
    { key: "temple", label: "Temple" },
    { key: "gurudwara", label: "Gurudwara" },
    { key: "community", label: "Community" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <View>
          <Text style={[styles.headerGreeting, { color: colors.mutedForeground }]}>
            {locationLoading ? "Locating you..." : "Near you"}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Find Bhandara</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={requestLocation}
            activeOpacity={0.8}
            style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="navigation" size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "web") {
                Alert.alert("Map View", "Map view is available on native Android/iOS devices.");
                return;
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode((v) => (v === "list" ? "map" : "list"));
            }}
            activeOpacity={0.8}
            style={[styles.iconBtn, { backgroundColor: viewMode === "map" ? colors.primary : colors.secondary }]}
          >
            <Feather
              name={viewMode === "map" ? "list" : "map"}
              size={18}
              color={viewMode === "map" ? "#fff" : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === "map" ? (
        <BhandaraMap
          bhandaras={filtered}
          userLat={userLat}
          userLng={userLng}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BhandaraCard bhandara={item} distanceKm={item.distanceKm} />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0) },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.filterSection}>
              <FlatList
                data={FILTERS}
                keyExtractor={(f) => f.key}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    onPress={() => setFilter(f.key)}
                    activeOpacity={0.8}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: filter === f.key ? colors.primary : colors.secondary,
                        borderColor: filter === f.key ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: filter === f.key ? "#fff" : colors.mutedForeground },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              {filtered.length > 0 && (
                <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                  {filtered.length} bhandara{filtered.length !== 1 ? "s" : ""} found
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="map-pin" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>
                No bhandaras found
              </Text>
              <Text style={[styles.emptyHint, { color: colors.muted }]}>
                Try a different filter or check back later
              </Text>
            </View>
          }
        />
      )}
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
  headerGreeting: { fontSize: 12, fontFamily: "Inter_500Medium" },
  headerTitle: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 20 },
  filterSection: { paddingTop: 16, gap: 10, marginBottom: 4 },
  filterRow: { gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  resultCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 2 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  emptyHint: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
