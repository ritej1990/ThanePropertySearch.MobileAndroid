import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { propertiesApi } from '../../api/singleton';
import type { PropertyResponse } from '../../api/types';
import { LazyMount } from '../ui/LazyMount';
import { SimilarPropertyCard } from './SimilarPropertyCard';
import { colors, spacing } from '../../theme';

const MAX_SIMILAR = 8;

type Props = {
  propertyId: number;
  areaName?: string | null;
  onSelect: (property: PropertyResponse) => void;
};

export function DeferredSimilarProperties({ propertyId, areaName, onSelect }: Props) {
  const [similar, setSimilar] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    propertiesApi
      .listPublic()
      .then((list) => {
        if (cancelled) return;
        const area = areaName?.trim().toLowerCase();
        const filtered = list.filter((p) => {
          if (p.id === propertyId) return false;
          if (!area) return true;
          return p.areaName?.trim().toLowerCase() === area;
        });
        setSimilar(filtered.slice(0, MAX_SIMILAR));
      })
      .catch(() => {
        if (!cancelled) setSimilar([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId, areaName]);

  if (!loading && similar.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Similar properties</Text>
      <Text style={styles.sub}>You may also like these in Thane</Text>
      {loading ? (
        <LazyMount minHeight={168} delayMs={0} showPlaceholder />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {similar.map((p) => (
            <SimilarPropertyCard key={p.id} item={p} onPress={() => onSelect(p)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: colors.slateLight,
    marginBottom: spacing.md,
  },
});
