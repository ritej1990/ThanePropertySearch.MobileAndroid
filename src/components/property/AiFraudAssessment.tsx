import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../api/singleton';
import { ApiError } from '../../api/client';
import type { FraudAssessmentResponse } from '../../api/aiTypes';
import { colors, radius, spacing, typography } from '../../theme';
import { useTranslation } from '../../context/LocaleContext';

type Props = {
  listingId: number;
};

const RISK_TONE: Record<string, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Low: { bg: '#ecfdf5', fg: '#0f766e', icon: 'shield-checkmark' },
  Medium: { bg: '#fffbeb', fg: '#92400e', icon: 'alert-circle' },
  High: { bg: '#fef2f2', fg: '#b91c1c', icon: 'warning' },
};

/** Mirrors Web's fraud assessment — GET /api/ai/fraud/listing/{id} (Owner/Admin only). */
export function AiFraudAssessment({ listingId }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<FraudAssessmentResponse | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    aiApi
      .getFraudAssessment(listingId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        // 404 = no assessment yet; just hide the panel.
        if (!cancelled && e instanceof ApiError && e.status !== 404) setHidden(false);
        if (!cancelled) setHidden(true);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (hidden || !data) return null;

  const tone = RISK_TONE[data.riskLevel] ?? RISK_TONE.Medium;

  return (
    <View style={[styles.card, { backgroundColor: tone.bg }]}>
      <View style={styles.headerRow}>
        <Ionicons name={tone.icon} size={18} color={tone.fg} />
        <Text style={[styles.title, { color: tone.fg }]}>
          {t('aiFraud.title', { risk: data.riskLevel })}
        </Text>
      </View>
      <Text style={styles.score}>
        {t('aiFraud.score', { score: data.fraudScore, action: data.suggestedAction })}
      </Text>

      {data.riskReasons.length > 0 ? (
        <View style={styles.reasons}>
          {data.riskReasons.map((r) => (
            <Text key={r.code} style={styles.reasonItem}>
              • [{r.severity}] {r.detail}
            </Text>
          ))}
        </View>
      ) : null}

      {data.aiReasoning ? <Text style={styles.reasoning}>{data.aiReasoning}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 15,
  },
  score: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slateMuted,
    marginTop: spacing.xs,
  },
  reasons: {
    marginTop: spacing.sm,
  },
  reasonItem: {
    fontSize: 13,
    color: colors.slate,
    lineHeight: 19,
    marginBottom: 2,
  },
  reasoning: {
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 19,
    marginTop: spacing.sm,
  },
});
