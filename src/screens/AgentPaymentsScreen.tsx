import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { AgentListingUnitPricing, AgentPaymentSummaryResponse } from '../api/agentTypes';
import type { PaymentTransaction } from '../api/paymentHistoryTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { PlanSlider } from '../components/ui/PlanSlider';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { formatInr } from '../utils/propertyFormat';
import {
  DEFAULT_AGENT_UNIT_PRICING,
  clampToStep,
  computeLeadSubtotal,
  computeListingSubtotal,
} from '../utils/agentPlanPricing';
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
  const [busy, setBusy] = useState(false);

  const [propertyCount, setPropertyCount] = useState(1);
  const [durationDays, setDurationDays] = useState(30);
  const [leadCount, setLeadCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const unit: AgentListingUnitPricing =
    summary?.listingUnitPricing ?? DEFAULT_AGENT_UNIT_PRICING;

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

  // Clamp/seed the configurator to the live bounds once pricing arrives.
  useEffect(() => {
    if (!summary?.listingUnitPricing) return;
    const u = summary.listingUnitPricing;
    setPropertyCount((prev) =>
      clampToStep(initialized ? prev : Math.max(prev, u.minPropertyCount), u.minPropertyCount, u.maxPropertyCount, 1)
    );
    setDurationDays((prev) =>
      clampToStep(initialized ? prev : prev, u.minDurationDays, u.maxDurationDays, 1)
    );
    setLeadCount((prev) => clampToStep(prev, u.minLeadCount, u.maxLeadCount, 5));
    setInitialized(true);
  }, [summary, initialized]);

  const listingPrice = useMemo(
    () => computeListingSubtotal(unit, propertyCount, durationDays),
    [unit, propertyCount, durationDays]
  );
  const leadsPrice = useMemo(
    () => computeLeadSubtotal(unit, leadCount),
    [unit, leadCount]
  );
  const totalPayable = listingPrice + leadsPrice;
  const fromPrice = computeListingSubtotal(unit, unit.minPropertyCount, unit.minDurationDays);

  async function buyBundle() {
    if (propertyCount <= 0 || durationDays <= 0) {
      Alert.alert('Select a plan', 'Choose how many properties to publish and for how many days.');
      return;
    }
    setBusy(true);
    try {
      const order = await paymentsApi.createAgentListingPublishOrder({
        propertyCount,
        durationDays,
        leadCount,
      });
      navigation.navigate('CashfreeCheckout', {
        product: 'agent_publish',
        paymentSessionId: order.paymentSessionId,
        orderId: order.orderId,
        environment: order.environment,
        tierCode: `CUSTOM-${propertyCount}-${durationDays}-L${leadCount}`,
        amountInr: order.amountInr ?? totalPayable,
      });
    } catch (e) {
      Alert.alert('Checkout', e instanceof ApiError ? e.message : 'Could not start payment');
    } finally {
      setBusy(false);
    }
  }

  const outOfCredits = (summary?.publishCredits ?? 0) <= 0;

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
                <View style={styles.usageBadge}>
                  <Text style={styles.usageLabel}>Plan used</Text>
                  <Text style={styles.usagePercent}>{outOfCredits ? '100%' : '0%'}</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>Plan & billing</Text>
              <Text style={styles.heroSub}>
                Configure listing visibility and lead credits in one checkout. Pricing
                updates live as you adjust the sliders.
              </Text>
              <Text style={styles.heroHint}>
                {summary.publishCredits} slots available to post
                {summary.publishPlanEndsAtUtc
                  ? ` · until ${formatPaymentDate(summary.publishPlanEndsAtUtc)}`
                  : ''}
              </Text>
            </View>

            {outOfCredits ? (
              <View style={styles.warningBanner}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={styles.warningText}>
                  Activate a publish plan below before posting property details.
                </Text>
              </View>
            ) : null}

            <View style={styles.metricsRow}>
              <MetricCard
                icon="home-outline"
                label="Publish"
                value={String(summary.publishCredits)}
                hint="Listing slots"
              />
              <MetricCard
                icon="people-outline"
                label="Leads"
                value={String(summary.leadCredits)}
                hint="Enquiry unlocks"
              />
              <MetricCard
                icon="pricetag-outline"
                label="From"
                value={formatInr(Math.max(1, fromPrice))}
                hint={`${unit.minPropertyCount} listing · ${unit.minDurationDays} days`}
              />
            </View>

            {/* Configurator — pick quantities, price updates live */}
            <Section
              title="Configure your plan"
              subtitle="Drag the sliders to match your business needs — the order summary updates live."
            >
              <PlanSlider
                step="Step 1 · Properties to publish"
                label="Total properties"
                icon="business-outline"
                value={propertyCount}
                min={unit.minPropertyCount}
                max={unit.maxPropertyCount}
                increment={1}
                accent={colors.primary}
                valueLabel={String(propertyCount)}
                minLabel={`${unit.minPropertyCount}`}
                maxLabel={`${unit.maxPropertyCount} max`}
                onChange={setPropertyCount}
              />
              <PlanSlider
                step="Step 2 · Visibility duration"
                label="Total days"
                icon="calendar-outline"
                value={durationDays}
                min={unit.minDurationDays}
                max={unit.maxDurationDays}
                increment={1}
                accent={colors.teal}
                valueLabel={`${durationDays}d`}
                minLabel={`${unit.minDurationDays} days`}
                maxLabel={`${unit.maxDurationDays} days`}
                onChange={setDurationDays}
              />
              <PlanSlider
                step="Step 3 · Lead unlock credits"
                label="Total leads"
                icon="people-outline"
                value={leadCount}
                min={unit.minLeadCount}
                max={unit.maxLeadCount}
                increment={5}
                accent={colors.warning}
                valueLabel={String(leadCount)}
                minLabel={`${unit.minLeadCount}`}
                maxLabel={`${formatInr(unit.pricePerLeadInr)} each`}
                onChange={setLeadCount}
              />
            </Section>

            {/* Live order summary */}
            <Section title="Order summary" subtitle="Review before you pay">
              <View style={styles.summaryPills}>
                <SummaryPill icon="document-text-outline" text={`${propertyCount} property`} />
                <SummaryPill icon="calendar-outline" text={`${durationDays} days`} />
                <SummaryPill icon="people-outline" text={`${leadCount} leads`} />
              </View>

              <PriceRow
                label="Listing publish"
                value={formatInr(listingPrice)}
                sub={`${propertyCount} × ${durationDays} days`}
              />
              <PriceRow
                label="Lead credits"
                value={formatInr(leadsPrice)}
                sub={leadCount > 0 ? `${leadCount} × ${formatInr(unit.pricePerLeadInr)}` : '0 unlocks'}
              />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total payable</Text>
                <Text style={styles.totalValue}>{formatInr(totalPayable)}</Text>
              </View>

              <Pressable
                style={[styles.payBtn, busy && styles.payBtnDisabled]}
                onPress={buyBundle}
                disabled={busy}
              >
                <Ionicons name="lock-closed" size={16} color={colors.heroText} />
                <Text style={styles.payBtnText}>
                  {busy ? 'Starting checkout…' : `Pay ${formatInr(totalPayable)} securely`}
                </Text>
              </Pressable>

              <Text style={styles.secureHint}>
                Secured by Cashfree · GST invoice available
              </Text>
            </Section>

            <Section
              title="What's included"
              subtitle="Everything you need to list properties and connect with buyers on Thane Flats."
            >
              <FeatureRow
                icon="business-outline"
                title="Property listings"
                note="Publish rent or sale listings with photos, location, and pricing."
                chip={`${formatInr(unit.pricePerPropertyInr)} per property (per ${unit.billingReferenceDays} days base)`}
              />
              <FeatureRow
                icon="timer-outline"
                title="Visibility period"
                note="Your listing stays visible for the selected days, then hides until renewed."
                chip="Longer periods cost proportionally more"
              />
              <FeatureRow
                icon="chatbox-ellipses-outline"
                title="Buyer leads"
                note="Lead credits unlock buyer contact details and messages for follow-up."
                chip={`${formatInr(unit.pricePerLeadInr)} per lead — no fixed packs`}
              />
            </Section>

            <Section
              title="How pricing works"
              subtitle="Transparent, slider-based pricing — no hidden tiers."
            >
              <View style={styles.pricingBox}>
                <Text style={styles.pricingText}>
                  Listings: properties × days × ({formatInr(unit.pricePerPropertyInr)} ÷{' '}
                  {unit.billingReferenceDays}). Leads: count × {formatInr(unit.pricePerLeadInr)}.
                  The total updates instantly as you move the sliders.
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
                    <Text style={[styles.td, styles.thDate]} numberOfLines={1}>
                      {formatPaymentDate(item.createdAtUtc)}
                    </Text>
                    <Text style={[styles.td, styles.thPlan]} numberOfLines={1}>
                      {paymentProductLabel(item.productType)}
                    </Text>
                    <Text style={[styles.td, styles.thAmt]} numberOfLines={1}>
                      {formatInr(item.amount)}
                    </Text>
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
      <Ionicons name={icon} size={16} color={colors.teal} />
      <Text style={styles.metricLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </Text>
      <Text style={styles.metricHint} numberOfLines={2}>
        {hint}
      </Text>
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
      <View style={styles.priceLabelCol}>
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
      <View style={styles.featureBody}>
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
      <Text style={[styles.statusText, { color: text }]} numberOfLines={1}>
        {status}
      </Text>
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
    marginBottom: spacing.md,
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
  usageBadge: { alignItems: 'flex-end' },
  usageLabel: {
    fontSize: 10,
    color: colors.slateLight,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  usagePercent: { fontSize: 20, fontWeight: '900', color: colors.error, marginTop: 1 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.navy },
  heroSub: { fontSize: 13, color: colors.slateLight, lineHeight: 19, marginTop: spacing.xs },
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
    padding: spacing.md,
  },
  metricLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.slateLight,
    fontWeight: '700',
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },
  metricValue: { fontSize: 22, fontWeight: '800', color: colors.navy, marginTop: spacing.xs },
  metricHint: { fontSize: 11, color: colors.slateLight, marginTop: spacing.xs, lineHeight: 14 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.navy },
  sectionSub: { fontSize: 13, color: colors.slateLight, marginBottom: spacing.md, marginTop: 3, lineHeight: 18 },
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
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  priceLabelCol: { flex: 1, minWidth: 0 },
  priceLabel: { fontSize: 14, fontWeight: '700', color: colors.navy },
  priceSub: { fontSize: 12, color: colors.slateLight, marginTop: 2 },
  priceValue: { fontSize: 15, fontWeight: '800', color: colors.navy },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  totalLabel: { fontSize: 12, color: colors.slateLight, textTransform: 'uppercase', fontWeight: '700' },
  totalValue: { fontSize: 26, color: colors.navy, fontWeight: '900' },
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
  payBtnText: { color: colors.heroText, fontWeight: '800', fontSize: 16 },
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
  featureBody: { flex: 1, minWidth: 0 },
  featureTitle: { fontSize: 15, fontWeight: '800', color: colors.navy },
  featureNote: { fontSize: 13, color: colors.slateLight, marginTop: 2, lineHeight: 18 },
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
    overflow: 'hidden',
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
  thDate: { flex: 1.3 },
  thPlan: { flex: 1.3 },
  thAmt: { width: 64 },
  thStatus: { width: 84 },
  statusPill: { width: 84, paddingVertical: 4, borderRadius: radius.pill, alignItems: 'center' },
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
