import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { aiApi } from '../../api/singleton';
import type { PropertyIntelligenceReportResponse } from '../../api/aiTypes';
import { AiHubSection } from './AiHubSection';
import { useTranslation } from '../../context/LocaleContext';
import type { TranslationKey } from '../../i18n';
import { colors, radius, spacing } from '../../theme';

type Props = {
  listingId: number;
};

const SCORE_ROWS: Array<{
  key: keyof PropertyIntelligenceReportResponse;
  labelKey: TranslationKey;
}> = [
  { key: 'investmentScore', labelKey: 'aiReport.scoreInvestment' },
  { key: 'rentalYieldScore', labelKey: 'aiReport.scoreRentalYield' },
  { key: 'futureGrowthScore', labelKey: 'aiReport.scoreFutureGrowth' },
  { key: 'connectivityScore', labelKey: 'aiReport.scoreConnectivity' },
  { key: 'familyFriendlyScore', labelKey: 'aiReport.scoreFamilyFriendly' },
  { key: 'locationGrowthScore', labelKey: 'aiReport.scoreLocationGrowth' },
  { key: 'rentalDemandScore', labelKey: 'aiReport.scoreRentalDemand' },
  { key: 'amenitiesScore', labelKey: 'aiReport.scoreAmenities' },
  { key: 'futureAppreciationScore', labelKey: 'aiReport.scoreAppreciation' },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLabelRow}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{value.toFixed(1)}/10</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

/** GET /api/ai/property/{id}/intelligence — mirrors web Property Intelligence Report. */
export function AiPropertyIntelligenceReport({ listingId }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<PropertyIntelligenceReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    aiApi
      .getPropertyIntelligenceReport(listingId)
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
        eyebrow={t('aiReport.eyebrow')}
        title={t('aiReport.title')}
        subtitle={t('aiReport.subtitle')}
        collapsible={false}
      >
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#7c3aed" />
          <Text style={styles.loadingText}>{t('aiReport.loading')}</Text>
        </View>
      </AiHubSection>
    );
  }

  if (failed || !data) return null;

  return (
    <AiHubSection
      eyebrow={data.generatedLabel || t('aiReport.eyebrow')}
      title={t('aiReport.title')}
      subtitle={t('aiReport.subtitleWithArea', {
        area: data.areaLabel,
        score: data.investmentScore.toFixed(1),
      })}
    >
      <View style={styles.heroScore}>
        <Text style={styles.heroScoreValue}>{data.investmentScore.toFixed(1)}</Text>
        <Text style={styles.heroScoreLabel}>{t('aiReport.overallScore')}</Text>
      </View>

      <Text style={styles.summary}>{data.summary}</Text>

      <View style={styles.scoreGrid}>
        {SCORE_ROWS.map((row) => {
          const raw = data[row.key];
          const value = typeof raw === 'number' ? raw : 0;
          return <ScoreBar key={row.key} label={t(row.labelKey)} value={value} />;
        })}
      </View>

      {data.insightBullets.length > 0 ? (
        <View style={styles.bullets}>
          {data.insightBullets.map((bullet) => (
            <Text key={bullet} style={styles.bullet}>
              • {bullet}
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
  heroScore: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: '#ede9fe',
    borderWidth: 1,
    borderColor: '#c4b5fd',
    marginBottom: spacing.md,
  },
  heroScoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6d28d9',
    letterSpacing: -0.5,
  },
  heroScoreLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  summary: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  scoreGrid: {
    gap: spacing.sm,
  },
  scoreRow: {
    gap: 4,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navy,
  },
  scoreTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: '#7c3aed',
  },
  bullets: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  bullet: {
    fontSize: 13,
    lineHeight: 19,
    color: '#1e3a5f',
    marginBottom: 4,
  },
});
