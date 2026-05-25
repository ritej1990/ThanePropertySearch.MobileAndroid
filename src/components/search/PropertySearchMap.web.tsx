import React, { useMemo } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PropertyResponse } from '../../api/types';
import { hasGoogleMapsKey } from '../../config/env';
import type { SelectedPlace } from '../../services/googlePlaces';
import { propertiesWithCoordinates } from '../../utils/mapHelpers';
import { PropertyListCard } from '../property/PropertyListCard';
import { colors, radius, spacing } from '../../theme';

type Props = {
  properties: PropertyResponse[];
  selectedPlace: SelectedPlace | null;
  onPropertyPress: (item: PropertyResponse) => void;
};

function mapsSearchUrl(lat: number, lng: number, label?: string) {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function PropertySearchMap({
  properties,
  selectedPlace,
  onPropertyPress,
}: Props) {
  const mappable = useMemo(
    () => propertiesWithCoordinates(properties),
    [properties]
  );

  if (!hasGoogleMapsKey()) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={48} color={colors.slateLight} />
        <Text style={styles.placeholderTitle}>Google Maps not configured</Text>
        <Text style={styles.placeholderSub}>
          Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to `.env` and restart Expo after updating.
        </Text>
      </View>
    );
  }

  if (mappable.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="home-outline" size={48} color={colors.slateLight} />
        <Text style={styles.placeholderTitle}>No mappable listings</Text>
        <Text style={styles.placeholderSub}>
          Properties in this view need valid latitude and longitude. Try clearing filters
          or searching a wider area.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.banner}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.bannerText}>
          Interactive map is available in the mobile app. Browse listings below or open a
          location in Google Maps.
        </Text>
      </View>

      {selectedPlace ? (
        <Pressable
          style={styles.areaLink}
          onPress={() =>
            Linking.openURL(
              mapsSearchUrl(
                selectedPlace.latitude,
                selectedPlace.longitude,
                selectedPlace.label
              )
            )
          }
        >
          <Ionicons name="navigate-outline" size={16} color="#0d9488" />
          <Text style={styles.areaLinkText} numberOfLines={1}>
            Search area: {selectedPlace.label}
          </Text>
          <Ionicons name="open-outline" size={14} color={colors.slateMuted} />
        </Pressable>
      ) : null}

      <View style={styles.legend}>
        <Ionicons name="home" size={14} color="#0f766e" />
        <Text style={styles.legendText}>
          {mappable.length} {mappable.length === 1 ? 'home' : 'homes'} with coordinates
        </Text>
      </View>

      <FlatList
        data={mappable}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <PropertyListCard item={item} onPress={() => onPropertyPress(item)} />
            <Pressable
              style={styles.mapLink}
              onPress={() =>
                Linking.openURL(
                  mapsSearchUrl(item.latitude, item.longitude, item.title)
                )
              }
            >
              <Ionicons name="map-outline" size={14} color={colors.primary} />
              <Text style={styles.mapLinkText}>Open in Google Maps</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.slateMuted,
  },
  areaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  areaLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    marginBottom: spacing.md,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    paddingLeft: spacing.xs,
  },
  mapLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceMuted,
  },
  placeholderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
  },
  placeholderSub: {
    fontSize: 14,
    color: colors.slateLight,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
