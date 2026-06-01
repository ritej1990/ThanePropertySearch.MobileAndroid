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
import { PaymentHistoryRow } from '../components/payments/PaymentHistoryRow';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import { formatInr } from '../utils/propertyFormat';
import { filterAgentPayments, formatPaymentDate, showInvoiceDownload } from '../utils/paymentDisplay';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

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
      setSummary(summaryData);
      setPayments(filterAgentPayments(txData));
      setSelectedPublish((prev) => {
        if (prev) return prev;
        const first = summaryData.publishPlans.find((p) => !p.isLocked);
        return first?.code ?? summaryData.publishPlans[0]?.code ?? null;
      });
      setSelectedLead((prev) => {
        if (prev) return prev;
        const first = summaryData.leadPackages.find((p) => !p.isLocked);
        return first?.code ?? summaryData.leadPackages[0]?.code ?? null;
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
    () => summary?.publishPlans.find((p) => p.code === selectedPublish),
    [summary, selectedPublish]
  );
  const leadPlan = useMemo(
    () => summary?.leadPackages.find((p) => p.code === selectedLead),
    [summary, selectedLead]
  );

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

  function openInvoice(item: PaymentTransaction) {
    navigation.navigate('InvoiceViewer', {
      paymentTransactionId: item.id,
      invoiceNumber: item.invoiceNumber ?? undefined,
    });
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHero
          variant="owner"
          icon="wallet-outline"
          title="Payments & billing"
          subtitle="Listing publish visibility and lead packs — same tiers as the web agent dashboard."
        />

        {loading ? (
          <BrandLoading fullScreen={false} message="Loading plans…" />
        ) : summary ? (
          <>
            <View style={styles.balanceRow}>
              <BalanceCard
                label="Publish credits"
                value={summary.publishCredits}
                hint="One credit = one listing post"
                accent={colors.primary}
              />
              <BalanceCard
                label="Lead credits"
                value={summary.leadCredits}
                hint="Use on buyer enquiries"
                accent={colors.teal}
              />
            </View>

            {summary.publishPlanActive && summary.activePublishTier ? (
              <ActiveBanner
                title={`${summary.activePublishTier} publish plan active`}
                until={summary.publishPlanEndsAtUtc}
              />
            ) : null}

            <Section title="Listing publish" icon="home-outline">
              <Text style={styles.sectionHint}>
                Pay once per publish; visible for chosen days, then hidden until renewed.
              </Text>
              {summary.publishPlans.map((plan) => (
                <PlanOption
                  key={plan.code}
                  plan={plan}
                  selected={selectedPublish === plan.code}
                  onSelect={() => setSelectedPublish(plan.code)}
                />
              ))}
              {publishPlan ? (
                <Pressable
                  style={[styles.buyBtn, publishPlan.isLocked && styles.buyBtnDisabled]}
                  onPress={() => buyPublish(publishPlan)}
                  disabled={busy === publishPlan.code || publishPlan.isLocked}
                >
                  <Ionicons name="card-outline" size={18} color={colors.heroText} />
                  <Text style={styles.buyBtnText}>
                    {busy === publishPlan.code
                      ? 'Starting checkout…'
                      : publishPlan.isLocked
                        ? 'Plan already active'
                        : `Pay ${formatInr(publishPlan.priceInr)} for publish`}
                  </Text>
                </Pressable>
              ) : null}
              {summary.publishCredits > 0 ? (
                <Pressable
                  style={styles.postBtn}
                  onPress={() => navigation.navigate('PostProperty')}
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.postBtnText}>Post a listing</Text>
                </Pressable>
              ) : null}
            </Section>

            {summary.leadPackageActive && summary.activeLeadPackageTier ? (
              <ActiveBanner
                title={`${summary.activeLeadPackageTier} lead pack active`}
                until={summary.leadPackageEndsAtUtc}
              />
            ) : null}

            <Section title="Lead access" icon="people-outline">
              <Text style={styles.sectionHint}>
                Soft, hard, or combo lead packs with fixed credit counts.
              </Text>
              {summary.leadPackages.map((plan) => (
                <PlanOption
                  key={plan.code}
                  plan={plan}
                  selected={selectedLead === plan.code}
                  onSelect={() => setSelectedLead(plan.code)}
                  showLeadMeta
                />
              ))}
              {leadPlan ? (
                <Pressable
                  style={[styles.buyBtn, styles.buyBtnLead, leadPlan.isLocked && styles.buyBtnDisabled]}
                  onPress={() => buyLead(leadPlan)}
                  disabled={busy === leadPlan.code || leadPlan.isLocked}
                >
                  <Ionicons name="card-outline" size={18} color={colors.heroText} />
                  <Text style={styles.buyBtnText}>
                    {busy === leadPlan.code
                      ? 'Starting checkout…'
                      : leadPlan.isLocked
                        ? 'Pack already active'
                        : `Pay ${formatInr(leadPlan.priceInr)} for lead pack`}
                  </Text>
                </Pressable>
              ) : null}
            </Section>

            <Section title="Payment history" icon="receipt-outline">
              <Text style={styles.sectionHint}>
                Agent transactions with downloadable GST invoices.
              </Text>
              {payments.length === 0 ? (
                <View style={styles.emptyPayments}>
                  <Ionicons name="wallet-outline" size={32} color={colors.slateLight} />
                  <Text style={styles.emptyText}>
                    No agent payments yet. Complete a purchase above to see details here.
                  </Text>
                </View>
              ) : (
                payments.map((item) => (
                  <PaymentHistoryRow
                    key={item.id}
                    item={item}
                    onInvoice={
                      showInvoiceDownload(item) ? () => openInvoice(item) : undefined
                    }
                  />
                ))
              )}
              <Pressable
                style={styles.linkBtn}
                onPress={() => navigation.navigate('MyPayments')}
              >
                <Text style={styles.linkBtnText}>View all account payments</Text>
              </Pressable>
            </Section>
          </>
        ) : null}
      </ScrollView>
    </AuthenticatedScreenLayout>
  );
}

function BalanceCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent: string;
}) {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={[styles.balanceValue, { color: accent }]}>{value}</Text>
      <Text style={styles.balanceHint}>{hint}</Text>
    </View>
  );
}

function ActiveBanner({ title, until }: { title: string; until: string | null }) {
  return (
    <View style={styles.activeBanner}>
      <Ionicons name="lock-closed" size={14} color={colors.warning} />
      <Text style={styles.activeBannerText}>
        {title}
        {until ? ` until ${formatPaymentDate(until)}` : ''}
      </Text>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Ionicons name={icon} size={18} color={colors.navy} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
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

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  balanceRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  balanceCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  balanceValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  balanceHint: { fontSize: 11, color: colors.slateLight, marginTop: 4, lineHeight: 15 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  activeBannerText: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.warning },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.navy },
  sectionHint: {
    fontSize: 13,
    color: colors.slateLight,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
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
  planRowSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  planRowLocked: { opacity: 0.72 },
  planBody: { flex: 1, minWidth: 0 },
  planLabel: { fontSize: 14, fontWeight: '800', color: colors.navy },
  planMeta: { fontSize: 12, color: colors.slateLight, marginTop: 2 },
  planLock: { fontSize: 11, color: colors.warning, marginTop: 4 },
  planRight: { alignItems: 'flex-end', gap: 4 },
  planPrice: { fontSize: 15, fontWeight: '800', color: colors.tealDark },
  planRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  buyBtnLead: { backgroundColor: colors.primary },
  buyBtnDisabled: { backgroundColor: colors.slateLight },
  buyBtnText: { color: colors.heroText, fontWeight: '800', fontSize: 14 },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  postBtnText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  emptyPayments: { alignItems: 'center', padding: spacing.xl },
  emptyText: {
    fontSize: 13,
    color: colors.slateLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  linkBtn: { alignItems: 'center', marginTop: spacing.md },
  linkBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
