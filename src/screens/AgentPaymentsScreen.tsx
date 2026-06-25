import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { paymentsApi } from '../api/singleton';
import type { AgentPlanOption, AgentPaymentSummaryResponse } from '../api/agentTypes';
import type { PaymentTransaction } from '../api/paymentHistoryTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { formatInr } from '../utils/propertyFormat';
import {
  filterAgentPayments,
  formatPaymentDate,
  paymentProductLabel,
  paymentStatusTone,
} from '../utils/paymentDisplay';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentPayments'>;

export default function AgentPaymentsScreen({ navigation }: Props) {
  const [summary, setSummary] = useState<AgentPaymentSummaryResponse | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedPublish, setSelectedPublish] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [summaryData, txData] = await Promise.all([
        paymentsApi.getAgentSummary(),
        paymentsApi.getMyTransactions(),
      ]);
      const normalizedSummary: AgentPaymentSummaryResponse = {
        ...summaryData,
        publishPlans: Array.isArray(summaryData.publishPlans) ? summaryData.publishPlans : [],
        leadPackages: Array.isArray(summaryData.leadPackages) ? summaryData.leadPackages : [],
      };
      setSummary(normalizedSummary);
      setPayments(filterAgentPayments(txData));
      setSelectedPublish((prev) => {
        if (prev) return prev;
        const first = normalizedSummary.publishPlans.find((p) => !p.isLocked);
        return first?.code ?? normalizedSummary.publishPlans[0]?.code ?? null;
      });
      setSelectedLead((prev) => {
        if (prev) return prev;
        const first = normalizedSummary.leadPackages.find((p) => !p.isLocked);
        return first?.code ?? normalizedSummary.leadPackages[0]?.code ?? null;
      });
    } catch (e) {
      Alert.alert('Error', e instanceof ApiError ? e.message : 'Could not load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const publishPlan = useMemo(
    () => summary?.publishPlans?.find((p) => p.code === selectedPublish) ?? null,
    [summary, selectedPublish]
  );
  const leadPlan = useMemo(
    () => summary?.leadPackages?.find((p) => p.code === selectedLead) ?? null,
    [summary, selectedLead]
  );

  const publishDays = publishPlan?.durationDays ?? 7;
  const publishCount = publishPlan?.maxPosts ?? 1;
  const leadCount = leadPlan?.leadCount ?? 0;
  const listingPrice = publishPlan?.priceInr ?? 0;
  const leadsPrice = leadPlan?.priceInr ?? 0;
  const totalPayable = listingPrice + leadsPrice;

  async function buyPublish(plan: AgentPlanOption) {
    if (plan.isLocked) {
      Alert.alert('Plan active', plan.lockReason ?? 'This plan is already active.');
      return;
    }
    setBusy(plan.code);
    try {
      const order = await paymentsApi.createAgentListingPublishOrder(plan.code);
      navigation.navigate('CashfreeCheckout', {
        product: 'agent_publish',
        paymentSessionId: order.paymentSessionId,
        orderId: order.orderId,
        environment: order.environment,
        tierCode: plan.code,
        amountInr: plan.priceInr,
      });
    } catch (e) {
      Alert.alert('Checkout', e instanceof ApiError ? e.message : 'Could not start payment');
    } finally {
      setBusy(null);
    }
  }

  async function buyLead(plan: AgentPlanOption) {
    if (plan.isLocked) {
      Alert.alert('Pack active', plan.lockReason ?? 'This lead pack is already active.');
      return;
    }
    setBusy(plan.code);
    try {
      const order = await paymentsApi.createAgentLeadCreditsOrder(plan.code);
      navigation.navigate('CashfreeCheckout', {
        product: 'agent_leads',
        paymentSessionId: order.paymentSessionId,
        orderId: order.orderId,
        environment: order.environment,
        tierCode: plan.code,
        amountInr: plan.priceInr,
      });
    } catch (e) {
      Alert.alert('Checkout', e instanceof ApiError ? e.message : 'Could not start payment');
    } finally {
      setBusy(null);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.wrap}>
        {loading ? (
          <BrandLoading fullScreen={false} message="Loading plans…" />
        ) : summary ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.verifiedChip}>
                  <Ionicons name="shield-checkmark-outline" size={13} color={colors.teal} />
                  <Text style={styles.verifiedText}>Verified agent</Text>
                </View>
                <Text style={styles.usageLabel}>Plan used</Text>
              </View>
              <View style={styles.heroMainRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Plan & billing</Text>
                  <Text style={styles.heroSub}>
                    Configure listing visibility and lead credits in one checkout. Pricing
                    updates live as you adjust selection.
                  </Text>
                </View>
                <Text style={styles.heroPercent}>{summary.publishCredits <= 0 ? '100%' : '0%'}</Text>
              </View>
              <Text style={styles.heroHint}>
                {summary.publishCredits} slots available to post
                {summary.publishPlanEndsAtUtc
                  ? ` · until ${formatPaymentDate(summary.publishPlanEndsAtUtc)}`
                  : ''}
              </Text>
            </View>

            {summary.publishCredits <= 0 ? (
              <View style={styles.warningBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.warningText}>
                  Activate a publish plan under Payments before posting property details.
                </Text>
              </View>
            ) : null}

            <View style={styles.metricsRow}>
              <MetricCard icon="home-outline" label="Publish" value={summary.publishCredits} hint="Listing slots you can submit" />
              <MetricCard icon="people-outline" label="Leads" value={summary.leadCredits} hint="Buyer enquiry unlocks" />
              <MetricCard icon="pricetag-outline" label="From" value={formatInr(Math.max(1, publishPlan?.priceInr ?? 1))} hint="1 listing · 7 days" />
            </View>

            <View style={styles.gridWrap}>
              <View style={styles.leftCol}>
                <Section title="Configure your plan" subtitle="Choose publish + lead options to match your business needs.">
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={15} color={colors.primary} />
                    <Text style={styles.infoText}>
                      You have {summary.publishCredits} slots available to submit.
                      {summary.publishPlanEndsAtUtc
                        ? ` Plan active until ${formatPaymentDate(summary.publishPlanEndsAtUtc)}.`
                        : ''}
                    </Text>
                  </View>

                  <Text style={styles.stepLabel}>Step 1 · Properties to publish</Text>
                  {summary.publishPlans.map((plan) => (
                    <PlanOption
                      key={plan.code}
                      plan={plan}
                      selected={selectedPublish === plan.code}
                      onSelect={() => setSelectedPublish(plan.code)}
                    />
                  ))}

                  <Text style={styles.stepLabel}>Step 2 · Lead unlock packs</Text>
                  {summary.leadPackages.map((plan) => (
                    <PlanOption
                      key={plan.code}
                      plan={plan}
                      selected={selectedLead === plan.code}
                      onSelect={() => setSelectedLead(plan.code)}
                      showLeadMeta
                    />
                  ))}
                </Section>
              </View>

              <View style={styles.rightCol}>
                <Section title="Order summary" subtitle="Review before you pay">
                  <View style={styles.summaryPills}>
                    <SummaryPill icon="document-text-outline" text={`${publishCount} property`} />
                    <SummaryPill icon="calendar-outline" text={`${publishDays} days`} />
                    <SummaryPill icon="people-outline" text={`${leadCount} leads`} />
                  </View>

                  <PriceRow label="Listing publish" value={formatInr(listingPrice)} sub={`1 × ${publishDays} days`} />
                  <PriceRow label="Lead credits" value={formatInr(leadsPrice)} sub={leadCount > 0 ? `${leadCount} unlocks` : '0 unlocks'} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total payable</Text>
                    <Text style={styles.totalValue}>{formatInr(totalPayable)}</Text>
                  </View>

                  {publishPlan ? (
                    <Pressable
                      style={[styles.payBtn, publishPlan.isLocked && styles.payBtnDisabled]}
                      onPress={() => buyPublish(publishPlan)}
                      disabled={busy === publishPlan.code || publishPlan.isLocked}
                    >
                      <Ionicons name="lock-closed" size={16} color={colors.heroText} />
                      <Text style={styles.payBtnText}>
                        {busy === publishPlan.code ? 'Starting checkout…' : 'Pay securely'}
                      </Text>
                    </Pressable>
                  ) : null}

                  {leadPlan && !leadPlan.isLocked ? (
                    <Pressable
                      style={[styles.secondaryPayBtn]}
                      onPress={() => buyLead(leadPlan)}
                      disabled={busy === leadPlan.code}
                    >
                      <Ionicons name="flash-outline" size={16} color={colors.primary} />
                      <Text style={styles.secondaryPayText}>
                        {busy === leadPlan.code ? 'Starting lead checkout…' : 'Buy lead pack'}
                      </Text>
                    </Pressable>
                  ) : null}

                  <Text style={styles.secureHint}>
                    Secured by Cashfree · GST invoice available
                  </Text>
                </Section>
              </View>
            </View>

            <Section title="What's included in your plan" subtitle="Everything you need to list properties and connect with buyers on Thane Flats.">
              <FeatureRow icon="business-outline" title="Property listings" note="Publish rent or sale listings with photos, location, and pricing." chip="?1 per property (per 7 days base)" />
              <FeatureRow icon="timer-outline" title="Visibility period" note="Your listing stays visible for the selected period, then hides until renewed." chip="Longer periods increase listing cost proportionally" />
              <FeatureRow icon="chatbox-ellipses-outline" title="Buyer leads" note="Lead credits unlock buyer contact details and messages for follow-up." chip="?2 per lead — no fixed packs" />
            </Section>

            <Section title="How pricing works" subtitle="Transparent, slider-based pricing — no hidden tiers.">
              <View style={styles.pricingBox}>
                <Text style={styles.pricingText}>
                  Listings: properties × days × (?1 ÷ 7). Leads: count × ?2. Total updates as
                  you change plan selections.
                </Text>
              </View>
            </Section>

            <Section title="Payment history" subtitle="Recent transactions on your agent account">
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.thDate]}>Date</Text>
                <Text style={[styles.th, styles.thPlan]}>Plan</Text>
                <Text style={[styles.th, styles.thAmt]}>Amount</Text>
                <Text style={[styles.th, styles.thStatus]}>Status</Text>
              </View>

              {payments.length === 0 ? (
                <View style={styles.emptyPayments}>
                  <Ionicons name="wallet-outline" size={32} color={colors.slateLight} />
                  <Text style={styles.emptyText}>No agent payments found yet.</Text>
                </View>
              ) : (
                payments.slice(0, 8).map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.td, styles.thDate]}>{formatPaymentDate(item.createdAtUtc)}</Text>
                    <Text style={[styles.td, styles.thPlan]}>{paymentProductLabel(item.productType)}</Text>
                    <Text style={[styles.td, styles.thAmt]}>{formatInr(item.amount)}</Text>
                    <StatusPill status={item.status} />
                  </View>
                ))
              )}

              <Pressable style={styles.linkBtn} onPress={() => navigation.navigate('MyPayments')}>
                <Text style={styles.linkBtnText}>All payments</Text>
              </Pressable>
            </Section>
          </>
        ) : null}
      </ScrollView>
    </AuthenticatedScreenLayout>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={18} color={colors.teal} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function PlanOption({
  plan,
  selected,
  onSelect,
  showLeadMeta,
}: {
  plan: AgentPlanOption;
  selected: boolean;
  onSelect: () => void;
  showLeadMeta?: boolean;
}) {
  return (
    <Pressable
      style={[styles.planRow, selected && styles.planRowSelected, plan.isLocked && styles.planRowLocked]}
      onPress={onSelect}
      disabled={plan.isLocked}
    >
      <View style={styles.planBody}>
        <Text style={styles.planLabel}>{plan.displayLabel || plan.code}</Text>
        {showLeadMeta && plan.leadCount ? (
          <Text style={styles.planMeta}>
            {plan.leadCount} {plan.leadType ?? ''} leads
            {plan.durationDays ? ` · ${plan.durationDays} days` : ''}
          </Text>
        ) : plan.durationDays ? (
          <Text style={styles.planMeta}>{plan.durationDays} days visibility</Text>
        ) : null}
        {plan.isLocked && plan.lockReason ? (
          <Text style={styles.planLock}>{plan.lockReason}</Text>
        ) : null}
      </View>
      <View style={styles.planRight}>
        <Text style={styles.planPrice}>{formatInr(plan.priceInr)}</Text>
        {selected ? (
          <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
        ) : plan.isLocked ? (
          <Ionicons name="lock-closed" size={16} color={colors.slateLight} />
        ) : (
          <View style={styles.planRadio} />
        )}
      </View>
    </Pressable>
  );
}

function SummaryPill({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.summaryPill}>
      <Ionicons name={icon} size={13} color={colors.slateLight} />
      <Text style={styles.summaryPillText}>{text}</Text>
    </View>
  );
}

function PriceRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <View style={styles.priceRow}> 
      <View>
        <Text style={styles.priceLabel}>{label}</Text>
        <Text style={styles.priceSub}>{sub}</Text>
      </View>
      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
}

function FeatureRow({
  icon,
  title,
  note,
  chip,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  note: string;
  chip: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureNote}>{note}</Text>
        <Text style={styles.featureChip}>{chip}</Text>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = paymentStatusTone(status);
  const bg = tone === 'success' ? colors.successSoft : tone === 'failed' ? colors.errorSoft : colors.warningSoft;
  const text = tone === 'success' ? colors.success : tone === 'failed' ? colors.error : colors.warning;
  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.tealSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.tealDark,
    textTransform: 'uppercase',
  },
  usageLabel: { fontSize: 11, color: colors.slateLight, textTransform: 'uppercase', fontWeight: '700' },
  heroMainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  heroTitle: { fontSize: 33, fontWeight: '800', color: colors.navy },
  heroSub: { fontSize: 13, color: colors.slateLight, lineHeight: 20, marginTop: spacing.xs, maxWidth: 480 },
  heroPercent: { fontSize: 40, fontWeight: '900', color: colors.error, marginTop: spacing.sm },
  heroHint: { fontSize: 12, color: colors.slateLight, marginTop: spacing.md },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: colors.errorSoft,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningText: { flex: 1, color: colors.error, fontSize: 13, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  metricLabel: { fontSize: 11, textTransform: 'uppercase', color: colors.slateLight, fontWeight: '700', marginTop: spacing.sm },
  metricValue: { fontSize: 40, fontWeight: '800', color: colors.navy, lineHeight: 44, marginTop: spacing.sm },
  metricHint: { fontSize: 12, color: colors.slateLight, marginTop: spacing.xs },
  gridWrap: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg, alignItems: 'flex-start' },
  leftCol: { flex: 1.35 },
  rightCol: { flex: 1 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: colors.navy },
  sectionSub: { fontSize: 13, color: colors.slateLight, marginBottom: spacing.md, marginTop: 3, lineHeight: 19 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoText: { flex: 1, color: colors.primaryDark, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  stepLabel: { fontSize: 12, textTransform: 'uppercase', color: colors.slateLight, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.xs },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  planRowSelected: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  planRowLocked: { opacity: 0.72 },
  planBody: { flex: 1, minWidth: 0 },
  planLabel: { fontSize: 14, fontWeight: '800', color: colors.navy },
  planMeta: { fontSize: 12, color: colors.slateLight, marginTop: 2 },
  planLock: { fontSize: 11, color: colors.warning, marginTop: 4 },
  planRight: { alignItems: 'flex-end', gap: 4 },
  planPrice: { fontSize: 15, fontWeight: '800', color: colors.tealDark },
  planRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  summaryPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderLight,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  summaryPillText: { fontSize: 12, color: colors.slateMuted, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  priceLabel: { fontSize: 14, fontWeight: '700', color: colors.navy },
  priceSub: { fontSize: 12, color: colors.slateLight, marginTop: 2 },
  priceValue: { fontSize: 15, fontWeight: '800', color: colors.navy },
  totalRow: { paddingTop: spacing.md, marginTop: spacing.sm },
  totalLabel: { fontSize: 12, color: colors.slateLight, textTransform: 'uppercase', fontWeight: '700' },
  totalValue: { fontSize: 36, color: colors.navy, fontWeight: '900', marginTop: 2 },
  payBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#0f5f7f',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  payBtnDisabled: { opacity: 0.7 },
  payBtnText: { color: colors.heroText, fontWeight: '800', fontSize: 17 },
  secondaryPayBtn: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    backgroundColor: '#eff6ff',
  },
  secondaryPayText: { color: colors.primary, fontWeight: '800' },
  secureHint: { textAlign: 'center', fontSize: 12, color: colors.slateLight, marginTop: spacing.md },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTitle: { fontSize: 20, fontWeight: '800', color: colors.navy },
  featureNote: { fontSize: 13, color: colors.slateLight, marginTop: 2, lineHeight: 19 },
  featureChip: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    color: colors.tealDark,
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  pricingBox: {
    borderWidth: 1,
    borderColor: '#f5e8b7',
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pricingText: { color: '#7c5f10', fontSize: 13, lineHeight: 20, fontWeight: '700' },
  tableHead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  th: { fontSize: 11, textTransform: 'uppercase', color: colors.slateLight, fontWeight: '700' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.sm,
  },
  td: { fontSize: 12, color: colors.navy },
  thDate: { flex: 1.35 },
  thPlan: { flex: 1.3 },
  thAmt: { width: 70 },
  thStatus: { width: 92 },
  statusPill: { width: 92, paddingVertical: 4, borderRadius: radius.pill, alignItems: 'center' },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  emptyPayments: { alignItems: 'center', padding: spacing.xl },
  emptyText: { fontSize: 13, color: colors.slateLight, textAlign: 'center', marginTop: spacing.sm, lineHeight: 18 },
  linkBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  linkBtnText: { fontSize: 13, fontWeight: '700', color: colors.slateMuted },
});
