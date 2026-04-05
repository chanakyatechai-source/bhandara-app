import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

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

const CATEGORY_COLORS: Record<string, string> = {
  langar: "#e67e00",
  temple: "#c0392b",
  gurudwara: "#27ae60",
  community: "#2980b9",
  other: "#8e44ad",
};

export default function BhandaraMap({ bhandaras, userLat, userLng }: Props) {
  const colors = useColors();
  const router = useRouter();

  const defaultLat = userLat ?? 28.6139;
  const defaultLng = userLng ?? 77.209;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: defaultLat,
        longitude: defaultLng,
        latitudeDelta: 0.18,
        longitudeDelta: 0.18,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {bhandaras.map((b) => (
        <Marker
          key={b.id}
          coordinate={{ latitude: b.lat, longitude: b.lng }}
          pinColor={CATEGORY_COLORS[b.category] ?? "#e67e00"}
          onCalloutPress={() => router.push(`/bhandara/${b.id}`)}
        >
          <Callout tooltip={false}>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle} numberOfLines={2}>
                {b.title}
              </Text>
              <Text style={styles.calloutMeta}>
                {b.distanceKm !== undefined
                  ? `${b.distanceKm < 1 ? Math.round(b.distanceKm * 1000) + " m" : b.distanceKm.toFixed(1) + " km"} away`
                  : b.time}
              </Text>
              <Text style={[styles.calloutAction, { color: CATEGORY_COLORS[b.category] }]}>
                Tap for details
              </Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  callout: { padding: 10, maxWidth: 200 },
  calloutTitle: { fontWeight: "700", fontSize: 13 },
  calloutMeta: { fontSize: 11, color: "#666", marginTop: 2 },
  calloutAction: { fontSize: 11, marginTop: 4, fontWeight: "600" },
});
