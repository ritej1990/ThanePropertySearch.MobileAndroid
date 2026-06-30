import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
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
import type { HomeLoanAdvisorResponse } from '../api/aiTypes';
import type { RootStackParamList } from '../navigation/types';
import { useTranslation } from '../context/LocaleContext';
import { colors, radius, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeLoanAdvisor'>;

function numeric(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export default function HomeLoanAdvisorScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [income, setIncome] = useState('');
  const [existingEmi, setExistingEmi] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HomeLoanAdvisorResponse | null>(null);

  async function calculate() {
    Keyboard.dismiss();
    const monthlyIncome = numeric(income);
    if (monthlyIncome <= 0) {
      setError(t('homeLoan.enterIncome'));
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await aiApi.adviseHomeLoan({
        monthlyIncome,
        existingEmi: numeric(existingEmi),
        downPayment: numeric(downPayment),
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('homeLoan.couldNotCalculate'));
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
            <Ionicons name="cash-outline" size={20} color="#7c3aed" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.title}>{t('homeLoan.title')}</Text>
            <Text style={styles.subtitle}>{t('homeLoan.subtitle')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <AuthTextField
            label={t('homeLoan.monthlyIncome')}
            icon="wallet-outline"
            keyboardType="numeric"
            placeholder="1,00,000"
            value={income}
            onChangeText={setIncome}
          />
          <AuthTextField
            label={t('homeLoan.existingEmis')}
            icon="card-outline"
            keyboardType="numeric"
            placeholder="8,000"
            value={existingEmi}
            onChangeText={setExistingEmi}
          />
          <AuthTextField
            label={t('homeLoan.downPayment')}
            icon="server-outline"
            keyboardType="numeric"
            placeholder="20,00,000"
            value={downPayment}
            onChangeText={setDownPayment}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <GradientButton label={t('homeLoan.calculate')} loading={loading} onPress={calculate} />
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>{t('homeLoan.checkingFoir')}</Text>
          </View>
        ) : null}

        {result ? (
          <LinearGradient colors={['#faf5ff', '#f8fafc']} style={styles.resultCard}>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>{t('homeLoan.eligibleLoan')}</Text>
                <Text style={styles.metricValue}>{result.eligibleLoanLabel}</Text>
              </View>
              <View style={[styles.metric, styles.metricHighlight]}>
                <Text style={styles.metricLabel}>{t('homeLoan.recommendedBudget')}</Text>
                <Text style={styles.metricValue}>{result.recommendedBudgetLabel}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>{t('homeLoan.safeEmi')}</Text>
                <Text style={styles.metricValue}>{result.safeEmiLabel}</Text>
              </View>
            </View>

            <Text style={styles.assumption}>
              {t('homeLoan.assumesRate', {
                rate: result.assumedInterestRatePercent,
                years: result.assumedTenureYears,
              })}
            </Text>

            {result.summary ? <Text style={styles.summary}>{result.summary}</Text> : null}

            {result.tips.length > 0 ? (
              <View style={styles.tips}>
                <Text style={styles.tipsLabel}>{t('homeLoan.tips')}</Text>
                {result.tips.map((t) => (
                  <Text key={t} style={styles.tipItem}>
                    • {t}
                  </Text>
                ))}
              </View>
            ) : null}

            <Text style={styles.disclaimer}>{t('homeLoan.disclaimer')}</Text>
          </LinearGradient>
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
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricHighlight: {
    backgroundColor: '#ede9fe',
    borderColor: '#c4b5fd',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 4,
  },
  assumption: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: spacing.md,
  },
  summary: {
    fontSize: 13,
    color: colors.slate,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  tips: {
    marginTop: spacing.md,
  },
  tipsLabel: {
    ...typography.label,
    color: colors.slateMuted,
    marginBottom: spacing.xs,
  },
  tipItem: {
    fontSize: 13,
    color: colors.slate,
    lineHeight: 19,
    marginBottom: 2,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
