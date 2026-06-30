import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../api/singleton';
import type { NearbyPlaceCategory } from '../../api/aiTypes';
import { AiHubSection } from './AiHubSection';
import { useTranslation } from '../../context/LocaleContext';
import { colors, radius, spacing } from '../../theme';

type Props = {
  listingId: number;
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  station: 'train-outline',
  school: 'school-outline',
  hospital: 'medical-outline',
  mart: 'cart-outline',
  mall: 'storefront-outline',
  'hotel-veg': 'restaurant-outline',
  'hotel-nonveg': 'cafe-outline',
  bus: 'bus-outline',
};

function CategoryBlock({
  category,
  t,
}: {
  category: NearbyPlaceCategory;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const icon = CATEGORY_ICONS[category.key] ?? 'location-outline';

  return (
    <View style={styles.category}>
      <View style={styles.categoryHeader}>
        <Ionicons name={icon} size={16} color="#0f766e" />
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
      {category.items.map((place) => (
        <View key={`${place.name}-${place.distanceLabel}`} style={styles.placeRow}>
          <View style={styles.placeMain}>
            <Text style={styles.placeName}>{place.name}</Text>
            {place.tag ? <Text style={styles.placeTag}>{place.tag}</Text> : null}
          </View>
          <View style={styles.placeMeta}>
            <Text style={styles.placeDistance}>{place.distanceLabel}</Text>
            <Text style={styles.placeDrive}>
              {t('aiLocation.minDrive', { minutes: place.driveMinutes })}
            </Text>
            <Text style={styles.placeFare}>
              {t('aiLocation.autoFare', { fare: place.autoFareLabel })}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** GET /api/ai/property/{id}/location-intelligence — mirrors web Location Intelligence hub. */
export function AiLocationIntelligence({ listingId }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [summary, setSummary] = useState('');
  const [categories, setCategories] = useState<NearbyPlaceCategory[]>([]);
  const [disclaimer, setDisclaimer] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    aiApi
      .getLocationIntelligence(listingId)
      .then((res) => {
        if (cancelled) return;
        setSummary(res.locationSummary);
        setCategories(res.categories ?? []);
        setDisclaimer(res.autoFareDisclaimer);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (loading) {
    return (
      <AiHubSection
        eyebrow={t('aiLocation.eyebrow')}
        title={t('aiLocation.title')}
        subtitle={t('aiLocation.subtitle')}
        collapsible={false}
      >
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#7c3aed" />
          <Text style={styles.loadingText}>{t('aiLocation.loading')}</Text>
        </View>
      </AiHubSection>
    );
  }

  if (failed || categories.length === 0) return null;

  return (
    <AiHubSection
      eyebrow={t('aiLocation.eyebrow')}
      title={t('aiLocation.title')}
      subtitle={t('aiLocation.subtitle')}
    >
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      {categories.map((category) => (
        <CategoryBlock key={category.key} category={category} t={t} />
      ))}
      {disclaimer ? <Text style={styles.disclaimer}>{disclaimer}</Text> : null}
    </AiHubSection>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: colors.slateLight,
  },
  summary: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.slate,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  category: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  placeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  placeMain: {
    flex: 1,
    minWidth: 0,
  },
  placeName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 18,
  },
  placeTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
    marginTop: 2,
  },
  placeMeta: {
    alignItems: 'flex-end',
    minWidth: 88,
  },
  placeDistance: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navy,
  },
  placeDrive: {
    fontSize: 10,
    color: colors.slateLight,
    marginTop: 2,
  },
  placeFare: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.slateLight,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
