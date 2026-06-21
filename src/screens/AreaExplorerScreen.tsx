import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { aiApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import type { AreaExplorerResponse } from '../api/aiTypes';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AreaExplorer'>;

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.scoreValue}>{Math.round(pct)}</Text>
    </View>
  );
}

export default function AreaExplorerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AreaExplorerResponse | null>(null);

  async function explore() {
    Keyboard.dismiss();
    const trimmed = query.trim();
    if (!trimmed) {
      setError('Enter an area, e.g. "Ghodbunder Road" or "Kolshet".');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await aiApi.exploreArea({ locationQuery: trimmed, listingLimit: 6 });
      setData(res);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Could not explore that area right now.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="map-outline" size={20} color="#7c3aed" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.title}>AI Area Explorer</Text>
            <Text style={styles.subtitle}>
              Get connectivity, growth & affordability insights for any Thane locality.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <AuthTextField
            label="Area / locality"
            icon="search-outline"
            placeholder="Ghodbunder Road"
            autoCapitalize="words"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={explore}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <GradientButton label="Explore area" loading={loading} onPress={explore} />
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Analysing the locality…</Text>
          </View>
        ) : null}

        {data ? (
          <View>
            <LinearGradient colors={['#faf5ff', '#f8fafc']} style={styles.resultCard}>
              <Text style={styles.zoneLabel}>{data.zoneLabel}</Text>
              <Text style={styles.areaName}>{data.resolvedArea}</Text>
              {data.parentRegion ? (
                <Text style={styles.parentRegion}>{data.parentRegion}</Text>
              ) : null}
              <Text style={styles.headline}>{data.headline}</Text>
              <Text style={styles.overview}>{data.overview}</Text>

              <View style={styles.scoresBlock}>
                <ScoreBar label="Connectivity" value={data.scores.connectivity} />
                <ScoreBar label="Growth" value={data.scores.growth} />
                <ScoreBar label="Affordability" value={data.scores.affordability} />
                <ScoreBar label="Liveability" value={data.scores.liveability} />
              </View>
            </LinearGradient>

            {data.market.priceBandLabel ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Market snapshot</Text>
                <Text style={styles.marketBand}>{data.market.priceBandLabel}</Text>
                <View style={styles.marketGrid}>
                  {data.market.avgSalePerSqft != null ? (
                    <Text style={styles.marketItem}>
                      Sale ₹{Math.round(data.market.avgSalePerSqft).toLocaleString('en-IN')}/sqft
                    </Text>
                  ) : null}
                  {data.market.avgRentPerSqft != null ? (
                    <Text style={styles.marketItem}>
                      Rent ₹{Math.round(data.market.avgRentPerSqft).toLocaleString('en-IN')}/sqft
                    </Text>
                  ) : null}
                  {data.market.rentalYieldPct != null ? (
                    <Text style={styles.marketItem}>
                      Yield {data.market.rentalYieldPct}%
                    </Text>
                  ) : null}
                  {data.market.appreciationYoYPct != null ? (
                    <Text style={styles.marketItem}>
                      Appreciation {data.market.appreciationYoYPct}% YoY
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {data.connectivity.length > 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Connectivity</Text>
                {data.connectivity.map((c, i) => (
                  <View key={`${c.name}-${i}`} style={styles.connRow}>
                    <Ionicons name="navigate-outline" size={15} color={colors.tealDark} />
                    <Text style={styles.connText}>
                      <Text style={styles.connName}>{c.name}</Text> — {c.detail}
                      {c.distanceLabel ? ` (${c.distanceLabel})` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {data.buyerTips.length > 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Buyer tips</Text>
                {data.buyerTips.map((t) => (
                  <Text key={t} style={styles.bulletItem}>
                    • {t}
                  </Text>
                ))}
              </View>
            ) : null}

            {data.listings.length > 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>
                  Listings here ({data.totalListingsFound})
                </Text>
                {data.listings.map((l) => (
                  <Pressable
                    key={`${l.source}-${l.id}`}
                    style={styles.listingRow}
                    onPress={() =>
                      navigation.navigate('PropertyDetails', {
                        propertyId: l.id,
                        title: l.title,
                        listingSource: l.source === 'agent' ? 'agent' : 'property',
                      })
                    }
                  >
                    <View style={styles.flex}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {l.title}
                      </Text>
                      <Text style={styles.listingMeta}>
                        {l.bhk} · {l.areaName}
                        {l.salePrice != null
                          ? ` · ₹${l.salePrice.toLocaleString('en-IN')}`
                          : l.rentAmount != null
                            ? ` · ₹${l.rentAmount.toLocaleString('en-IN')}/mo`
                            : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.slateLight} />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  title: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.navy,
  },
  subtitle: {
    fontSize: 13,
    color: colors.slateLight,
    marginTop: 2,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    marginBottom: spacing.md,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  loadingText: {
    fontSize: 13,
    color: colors.slateLight,
  },
  resultCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  zoneLabel: {
    ...typography.eyebrow,
    color: '#7c3aed',
  },
  areaName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 2,
  },
  parentRegion: {
    fontSize: 13,
    color: colors.slateLight,
    marginTop: 1,
  },
  headline: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate,
    marginTop: spacing.sm,
  },
  overview: {
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  scoresBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scoreLabel: {
    width: 90,
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  scoreTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ede9fe',
    overflow: 'hidden',
  },
  scoreFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  scoreValue: {
    width: 28,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '800',
    color: colors.navy,
  },
  sectionCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.slateMuted,
    marginBottom: spacing.sm,
  },
  marketBand: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  marketItem: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  connText: {
    flex: 1,
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 19,
  },
  connName: {
    fontWeight: '700',
    color: colors.navy,
  },
  bulletItem: {
    fontSize: 13,
    color: colors.slate,
    lineHeight: 19,
    marginBottom: 2,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
  listingMeta: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: 2,
  },
});
