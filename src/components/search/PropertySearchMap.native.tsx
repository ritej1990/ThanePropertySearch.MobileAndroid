import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import type { PropertyResponse } from '../../api/types';
import { hasNativeMapSupport } from '../../config/env';
import type { SelectedPlace } from '../../services/googlePlaces';
import {
  clampMapRegion,
  getMapInitialRegion,
  hasValidPropertyCoordinates,
  mapFitCoordinates,
  propertiesWithCoordinates,
  regionsDiffer,
} from '../../utils/mapHelpers';
import { getPrimaryPrice } from '../../utils/propertyDisplay';
import { listingTypeChips } from '../../utils/propertyFormat';
import { PropertyMapPreviewCard } from './PropertyMapPreviewCard';
import { colors, radius, spacing } from '../../theme';

type Props = {
  properties: PropertyResponse[];
  selectedPlace: SelectedPlace | null;
  mapCenter?: { latitude: number; longitude: number } | null;
  onPropertyPress: (item: PropertyResponse) => void;
};

function HomeMarker({ selected }: { selected?: boolean }) {
  return (
    <View style={[styles.marker, selected && styles.markerSelected]}>
      <Ionicons name="home" size={16} color={colors.heroText} />
      <View style={styles.markerPointer} />
    </View>
  );
}

export function PropertySearchMap({
  properties,
  selectedPlace,
  mapCenter,
  onPropertyPress,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tracksChanges, setTracksChanges] = useState(Platform.OS === 'android');

  const mappable = useMemo(
    () => propertiesWithCoordinates(properties),
    [properties]
  );

  const selectedProperty = useMemo(
    () => mappable.find((p) => p.id === selectedId) ?? null,
    [mappable, selectedId]
  );

  const initialRegion = useMemo(
    () => getMapInitialRegion(properties, selectedPlace, mapCenter),
    [properties, selectedPlace, mapCenter]
  );

  const handleRegionChangeComplete = (region: Region) => {
    const clamped = clampMapRegion(region);
    if (regionsDiffer(region, clamped) && mapRef.current) {
      mapRef.current.animateToRegion(clamped, 280);
    }
  };

  useEffect(() => {
    if (tracksChanges) {
      const t = setTimeout(() => setTracksChanges(false), 800);
      return () => clearTimeout(t);
    }
  }, [tracksChanges, mappable.length]);

  useEffect(() => {
    const coords = mapFitCoordinates(properties, selectedPlace, mapCenter);
    if (coords.length === 0 || !mapRef.current) return;
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 56, right: 48, bottom: 160, left: 48 },
        animated: true,
      });
      setTimeout(() => {
        mapRef.current?.animateToRegion(
          clampMapRegion(getMapInitialRegion(properties, selectedPlace, mapCenter)),
          300
        );
      }, 500);
    }, 400);
    return () => clearTimeout(timer);
  }, [properties, selectedPlace, mapCenter]);

  if (!hasNativeMapSupport()) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={48} color={colors.slateLight} />
        <Text style={styles.placeholderTitle}>Google Maps not configured</Text>
        <Text style={styles.placeholderSub}>
          Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to `.env` and enable Maps SDK for Android /
          iOS. Restart Expo after updating.
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
          No listings with coordinates inside Thane. Try different filters or search
          another area in Thane.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion as Region}
        minZoomLevel={11}
        maxZoomLevel={19}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        onPress={() => setSelectedId(null)}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
            }}
            pinColor="#2563eb"
            title="Search area"
            description={selectedPlace.label}
          />
        )}

        {mappable.map((item) => {
          const price = getPrimaryPrice(item);
          const chips = listingTypeChips(item);
          const isSelected = selectedId === item.id;

          return (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              onPress={() => setSelectedId(item.id)}
              tracksViewChanges={tracksChanges}
            >
              <HomeMarker selected={isSelected} />
              <Callout tooltip onPress={() => onPropertyPress(item)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.calloutMeta}>
                    {chips.map((c) => c.label).join(' · ')}
                    {item.bhkConfiguration ? ` · ${item.bhkConfiguration}` : ''}
                  </Text>
                  <Text style={styles.calloutArea} numberOfLines={1}>
                    {item.areaName}
                  </Text>
                  <Text style={styles.calloutPrice}>
                    {price.amount}
                    {price.suffix}
                  </Text>
                  {hasValidPropertyCoordinates(item) && (
                    <Text style={styles.calloutHint}>Tap for full details →</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.legend} pointerEvents="none">
        <Ionicons name="location" size={14} color="#0f766e" />
        <Text style={styles.legendText}>
          Thane only · {mappable.length}{' '}
          {mappable.length === 1 ? 'listing' : 'listings'}
        </Text>
      </View>

      {selectedProperty ? (
        <PropertyMapPreviewCard
          item={selectedProperty}
          onPress={() => onPropertyPress(selectedProperty)}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    alignItems: 'center',
    backgroundColor: '#0d9488',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.heroText,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: {
    backgroundColor: colors.navyMid,
    transform: [{ scale: 1.15 }],
    borderColor: colors.goldAccent,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0d9488',
    marginTop: -1,
  },
  callout: {
    minWidth: 200,
    maxWidth: 260,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  calloutMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateMuted,
    marginBottom: 4,
  },
  calloutArea: {
    fontSize: 12,
    color: colors.slateLight,
    marginBottom: 6,
  },
  calloutPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f766e',
  },
  calloutHint: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 6,
  },
  legend: {
    position: 'absolute',
    top: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
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
