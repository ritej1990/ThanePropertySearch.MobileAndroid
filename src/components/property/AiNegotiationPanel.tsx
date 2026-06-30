import React, { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiApi } from '../../api/singleton';
import { ApiError } from '../../api/client';
import type { NegotiationAnalyzeResponse } from '../../api/aiTypes';
import { formatInr } from '../../utils/propertyFormat';
import { colors, radius, spacing, typography } from '../../theme';
import { useTranslation } from '../../context/LocaleContext';
import type { TranslationKey } from '../../i18n';

type Props = {
  listingId: number;
  askingPrice: number;
};

const TREND_KEYS: { value: 'Stable' | 'Rising' | 'Cooling'; key: TranslationKey }[] = [
  { value: 'Stable', key: 'aiNegotiation.trendStable' },
  { value: 'Rising', key: 'aiNegotiation.trendRising' },
  { value: 'Cooling', key: 'aiNegotiation.trendCooling' },
];

/** Mirrors Web's _AiNegotiationPanel.cshtml — POST /api/ai/negotiation/analyze */
export function AiNegotiationPanel({ listingId, askingPrice }: Props) {
  const { t } = useTranslation();
  const [budget, setBudget] = useState('');
  const [trend, setTrend] = useState<'Stable' | 'Rising' | 'Cooling'>('Stable');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NegotiationAnalyzeResponse | null>(null);

  async function analyze() {
    Keyboard.dismiss();
    const buyerBudget = Number(budget.replace(/[^0-9.]/g, ''));
    if (!buyerBudget || buyerBudget <= 0) {
      setError(t('aiNegotiation.enterBudget'));
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiApi.analyzeNegotiation({
        listingId,
        askingPrice,
        buyerBudget,
        marketTrend: trend,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('aiNegotiation.couldNotAnalyze'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="git-compare-outline" size={18} color="#7c3aed" />
        <Text style={styles.title}>{t('aiNegotiation.title')}</Text>
      </View>
      <Text style={styles.sub}>
        {t('aiNegotiation.sub', { price: formatInr(askingPrice) })}
      </Text>

      <Text style={styles.label}>{t('aiNegotiation.budgetLabel')}</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        placeholder={t('aiNegotiation.budgetPlaceholder')}
        placeholderTextColor={colors.slateLight}
      />

      <Text style={styles.label}>{t('aiNegotiation.marketTrend')}</Text>
      <View style={styles.trendRow}>
        {TREND_KEYS.map(({ value, key }) => (
          <Pressable
            key={value}
            style={[styles.trendChip, trend === value && styles.trendChipActive]}
            onPress={() => setTrend(value)}
          >
            <Text style={[styles.trendChipText, trend === value && styles.trendChipTextActive]}>
              {t(key)}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.analyzeBtn} onPress={analyze} disabled={loading}>
        <Text style={styles.analyzeBtnText}>{loading ? t('aiNegotiation.analyzing') : t('aiNegotiation.analyze')}</Text>
      </Pressable>

      {result ? (
        <LinearGradient colors={['#faf5ff', '#f8fafc']} style={styles.resultCard}>
          <View style={styles.offerRow}>
            <View style={styles.offerCol}>
              <Text style={styles.offerLabel}>{t('aiNegotiation.firstOffer')}</Text>
              <Text style={styles.offerValue}>{formatInr(result.recommendedFirstOffer)}</Text>
            </View>
            <View style={styles.offerCol}>
              <Text style={styles.offerLabel}>{t('aiNegotiation.finalOffer')}</Text>
              <Text style={styles.offerValue}>{formatInr(result.recommendedFinalOffer)}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>{t('aiNegotiation.position', { strength: result.negotiationStrength })}</Text>
            <Text style={styles.metaPill}>
              {t('aiNegotiation.successPct', { pct: Math.round(result.successProbability * 100) })}
            </Text>
          </View>
          <Text style={styles.strategy}>{result.strategySummary}</Text>

          {result.messages.whatsApp.length > 0 ? (
            <View style={styles.msgBlock}>
              <Text style={styles.msgLabel}>{t('aiNegotiation.whatsAppScripts')}</Text>
              {result.messages.whatsApp.map((m, i) => (
                <Text key={i} style={styles.msgItem}>
                  “{m}”
                </Text>
              ))}
            </View>
          ) : null}
        </LinearGradient>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 16,
    color: colors.navy,
  },
  sub: {
    fontSize: 13,
    color: colors.slateLight,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  label: {
    ...typography.label,
    color: colors.slateMuted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.md,
  },
  trendRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  trendChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  trendChipActive: {
    backgroundColor: '#ede9fe',
    borderColor: '#c4b5fd',
  },
  trendChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  trendChipTextActive: {
    color: '#6d28d9',
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  analyzeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: '#7c3aed',
  },
  analyzeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.heroText,
  },
  resultCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  offerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  offerCol: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  offerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  offerValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaPill: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6d28d9',
    backgroundColor: '#ede9fe',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  strategy: {
    fontSize: 13,
    color: colors.slate,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  msgBlock: {
    marginTop: spacing.md,
  },
  msgLabel: {
    ...typography.label,
    color: colors.slateMuted,
    marginBottom: spacing.xs,
  },
  msgItem: {
    fontSize: 13,
    color: colors.slateMuted,
    fontStyle: 'italic',
    lineHeight: 19,
    marginBottom: spacing.xs,
  },
});
