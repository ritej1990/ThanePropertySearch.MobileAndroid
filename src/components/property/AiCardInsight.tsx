import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../api/singleton';
import type { PropertyCardIntelligence } from '../../api/aiTypes';
import { colors, radius, spacing } from '../../theme';

type Props = {
  listingId: number;
};

/** Module-level cache + in-flight dedup so scrolling back to a card never refetches. */
const cache = new Map<number, PropertyCardIntelligence | null>();
const inFlight = new Map<number, Promise<PropertyCardIntelligence | null>>();

function loadCardInsight(listingId: number): Promise<PropertyCardIntelligence | null> {
  if (cache.has(listingId)) return Promise.resolve(cache.get(listingId) ?? null);
  const existing = inFlight.get(listingId);
  if (existing) return existing;

  const p = aiApi
    .cardIntelligenceFor(listingId)
    .then((card) => {
      cache.set(listingId, card);
      return card;
    })
    .catch(() => {
      cache.set(listingId, null);
      return null;
    })
    .finally(() => {
      inFlight.delete(listingId);
    });
  inFlight.set(listingId, p);
  return p;
}

/**
 * Compact AI rating + insight strip for a property card. Fetched lazily when the
 * card mounts (FlatList only mounts visible rows), cached across remounts, and
 * renders nothing until ready so it never reserves blank space.
 */
function AiCardInsightBase({ listingId }: Props) {
  const [data, setData] = useState<PropertyCardIntelligence | null>(
    cache.get(listingId) ?? null
  );

  useEffect(() => {
    if (cache.has(listingId)) {
      setData(cache.get(listingId) ?? null);
      return;
    }
    let active = true;
    loadCardInsight(listingId).then((card) => {
      if (active) setData(card);
    });
    return () => {
      active = false;
    };
  }, [listingId]);

  if (!data) return null;

  const rating = Math.round(data.investmentScore) / 10; // 0–100 → 0–10 scale
  const summary = data.shortSummary?.trim();

  return (
    <View style={styles.strip}>
      <View style={styles.ratingPill}>
        <Ionicons name="sparkles" size={11} color={colors.heroText} />
        <Text style={styles.ratingText}>AI {rating.toFixed(1)}</Text>
      </View>
      {data.insightTag ? (
        <Text style={styles.tag} numberOfLines={1}>
          {data.insightTag}
        </Text>
      ) : null}
      {summary ? (
        <Text style={styles.summary} numberOfLines={1}>
          {summary}
        </Text>
      ) : null}
    </View>
  );
}

export const AiCardInsight = React.memo(AiCardInsightBase);

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    backgroundColor: '#7c3aed',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: 0.2,
  },
  tag: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '800',
    color: '#6d28d9',
  },
  summary: {
    flex: 1,
    fontSize: 11,
    color: colors.slateLight,
  },
});
