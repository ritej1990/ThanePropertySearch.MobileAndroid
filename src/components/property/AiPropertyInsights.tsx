import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../api/singleton';
import type { PropertyDetailInsightsResponse } from '../../api/aiTypes';
import { formatInr } from '../../utils/propertyFormat';
import { AiHubSection } from './AiHubSection';
import { colors, radius, spacing } from '../../theme';
import { useTranslation } from '../../context/LocaleContext';
import type { TranslateFn } from '../../i18n';

type Props = {
  listingId: number;
};

const VERDICT_TONE: Record<string, { bg: string; fg: string }> = {
  Underpriced: { bg: '#ecfdf5', fg: '#0f766e' },
  FairPrice: { bg: '#eff6ff', fg: '#1d4ed8' },
  Overpriced: { bg: '#fef2f2', fg: '#b91c1c' },
  'Good Value': { bg: '#ecfdf5', fg: '#0f766e' },
};

function verdictTone(verdict: string) {
  return VERDICT_TONE[verdict] ?? { bg: colors.surfaceMuted, fg: colors.slateMuted };
}

function CommuteRow({
  office,
  carMinutes,
  peakCarMinutes,
  metroMinutes,
  commuteScore,
  t,
}: {
  office: string;
  carMinutes: number;
  peakCarMinutes: number;
  metroMinutes: number;
  commuteScore: number;
  t: TranslateFn;
}) {
  return (
    <View style={styles.commuteRow}>
      <View style={styles.commuteMain}>
        <Text style={styles.commuteOffice}>{office}</Text>
        <Text style={styles.commuteMeta}>
          {t('aiInsights.commuteMeta', {
            car: carMinutes,
            peak: peakCarMinutes,
            metro: metroMinutes,
          })}
        </Text>
      </View>
      <View style={styles.commuteScore}>
        <Text style={styles.commuteScoreValue}>{commuteScore}</Text>
        <Text style={styles.commuteScoreLabel}>{t('aiInsights.score')}</Text>
      </View>
    </View>
  );
}

/** GET /api/ai/property/{id}/insights — mirrors web ThaneFlats AI Assistant panel. */
export function AiPropertyInsights({ listingId }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<PropertyDetailInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    aiApi
      .getPropertyInsights(listingId)
      .then((res) => {
        if (!cancelled) setData(res);
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
        eyebrow={t('aiInsights.eyebrow')}
        title={t('aiInsights.title')}
        subtitle={t('aiInsights.subtitle')}
        collapsible={false}
      >
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#7c3aed" />
          <Text style={styles.loadingText}>{t('aiInsights.analyzing')}</Text>
        </View>
      </AiHubSection>
    );
  }

  if (failed || !data) return null;

  const verdict = data.priceVerdict ?? null;
  const rentVerdict = data.rentVerdict ?? null;
  const tone = verdict ? verdictTone(verdict.verdict) : rentVerdict ? verdictTone(rentVerdict.verdict) : null;

  return (
    <AiHubSection
      eyebrow={t('aiInsights.eyebrow')}
      title={t('aiInsights.title')}
      subtitle={`${data.areaName} · ${data.listingType} · ${data.modelVersion}`}
    >
      {verdict ? (
        <View style={[styles.verdictPill, { backgroundColor: tone?.bg }]}>
          <Text style={[styles.verdictTitle, { color: tone?.fg }]}>{verdict.verdict}</Text>
          <Text style={styles.verdictSummary}>{verdict.summary}</Text>
          <Text style={styles.verdictRange}>
            {t('aiInsights.fairRange', {
              min: formatInr(verdict.priceRangeMin),
              max: formatInr(verdict.priceRangeMax),
            })}
          </Text>
        </View>
      ) : null}

      {rentVerdict ? (
        <View style={[styles.verdictPill, tone ? { backgroundColor: tone.bg } : null]}>
          <Text style={[styles.verdictTitle, tone ? { color: tone.fg } : null]}>
            {rentVerdict.verdict}
          </Text>
          <Text style={styles.verdictSummary}>{rentVerdict.summary}</Text>
          {rentVerdict.estimatedMarketRent != null ? (
            <Text style={styles.verdictRange}>
              {t('aiInsights.marketRent', { amount: formatInr(rentVerdict.estimatedMarketRent) })}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.fitRow}>
        <View style={styles.fitScoreCircle}>
          <Text style={styles.fitScoreText}>{data.fitVerdict.score}</Text>
        </View>
        <View style={styles.fitTextCol}>
          <Text style={styles.fitTitle}>{data.fitVerdict.recommendation}</Text>
          <Text style={styles.fitSummary}>{data.fitVerdict.summary}</Text>
        </View>
      </View>

      {data.affordability ? (
        <View style={styles.affordCard}>
          <View style={styles.affordHeader}>
            <Ionicons name="wallet-outline" size={16} color="#1d4ed8" />
            <Text style={styles.sectionLabel}>{t('aiInsights.affordabilityCheck')}</Text>
          </View>
          <Text style={styles.affordVerdict}>{data.affordability.verdict}</Text>
          <Text style={styles.affordSummary}>{data.affordability.summary}</Text>
        </View>
      ) : null}

      {data.commutePreview.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('aiInsights.commutePreview')}</Text>
          {data.commutePreview.map((c) => (
            <CommuteRow key={c.office} {...c} t={t} />
          ))}
        </View>
      ) : null}

      {data.highlights.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('aiInsights.highlights')}</Text>
          {data.highlights.map((h) => (
            <Text key={h} style={styles.bulletItem}>
              ✓ {h}
            </Text>
          ))}
        </View>
      ) : null}

      {data.localityInsight ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('aiInsights.localityInsight')}</Text>
          <Text style={styles.bodyText}>{data.localityInsight}</Text>
        </View>
      ) : null}

      {data.questionsToAsk.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('aiInsights.questionsToAsk')}</Text>
          {data.questionsToAsk.map((q) => (
            <Text key={q} style={styles.bulletItem}>
              • {q}
            </Text>
          ))}
        </View>
      ) : null}
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
  verdictPill: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  verdictTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  verdictSummary: {
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 19,
  },
  verdictRange: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slateLight,
    marginTop: spacing.xs,
  },
  fitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  fitScoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  fitScoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6d28d9',
  },
  fitTextCol: {
    flex: 1,
  },
  fitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  fitSummary: {
    fontSize: 12,
    color: colors.slateMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  affordCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: spacing.md,
  },
  affordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  affordVerdict: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  affordSummary: {
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 19,
    marginTop: 4,
  },
  section: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slateMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  commuteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  commuteMain: {
    flex: 1,
    minWidth: 0,
  },
  commuteOffice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  commuteMeta: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: 2,
    lineHeight: 15,
  },
  commuteScore: {
    alignItems: 'center',
    minWidth: 44,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  commuteScoreValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f766e',
  },
  commuteScoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0f766e',
    textTransform: 'uppercase',
  },
  bulletItem: {
    fontSize: 13,
    color: colors.slate,
    lineHeight: 19,
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 13,
    color: colors.slate,
    lineHeight: 20,
  },
});
