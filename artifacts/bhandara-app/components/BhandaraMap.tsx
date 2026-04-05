import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface MapBhandara {
  id: string;
  title: string;
  lat: number;
  lng: number;
  time: string;
  category: string;
  distanceKm?: number;
}

interface Props {
  bhandaras: MapBhandara[];
  userLat: number | null;
  userLng: number | null;
}

export default function BhandaraMap({ bhandaras }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.placeholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name="map" size={48} color={colors.border} />
      <Text style={[styles.title, { color: colors.mutedForeground }]}>Map View</Text>
      <Text style={[styles.hint, { color: colors.muted }]}>
        Map view is available on Android and iOS devices.{"\n"}
        Switch to List view to browse {bhandaras.length} bhandaras.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    margin: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  title: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 24, lineHeight: 20 },
});
