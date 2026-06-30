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
import { LinearGradient } from 'expo-linear-gradient';
import { paymentsApi } from '../api/singleton';
import { ApiError } from '../api/client';
import type { EssentialStatus, PricingPlan } from '../api/paymentTypes';
import type { RootStackParamList } from '../navigation/types';
import { EssentialPlanCard } from '../components/plans/EssentialPlanCard';
import { EssentialSubscriptionCard } from '../components/plans/EssentialSubscriptionCard';
import { PaymentMethodBadges } from '../components/payments/PaymentMethodBadges';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { ThaneFlatsLogo } from '../components/ui/ThaneFlatsLogo';
import {
  canPurchaseEssentialPlan,
  findCurrentPlanCode,
  formatPlanEndDate,
  hasActiveEssentialPlan,
} from '../utils/planDisplay';
import { PageHero } from '../components/ui/PageHero';
import { useTranslation } from '../context/LocaleContext';
import { localeToCulture } from '../i18n/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EssentialService'>;

export default function EssentialServiceScreen({ navigation, route }: Props) {
  const { t, locale } = useTranslation();
  const returnPropertyId = route.params?.returnPropertyId;
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [status, setStatus] = useState<EssentialStatus | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pricing, essential] = await Promise.all([
        paymentsApi.getPricing(),
        paymentsApi.getEssentialStatus(),
      ]);
      const planList = pricing.userEssentialPlans ?? [];
      setPlans(planList);
      setPaymentMethods(pricing.paymentMethods ?? []);
      setStatus(essential);
      setSelected((prev) => {
        const currentCode = findCurrentPlanCode(essential, planList);
        if (hasActiveEssentialPlan(essential) && currentCode) {
          return currentCode;
        }
        if (prev && planList.some((p) => p.code === prev)) {
          return prev;
        }
        return planList[0]?.code ?? '';
      });
    } catch (e) {
      Alert.alert(
        t('essential.couldNotLoadPlans'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const hasActivePlan = hasActiveEssentialPlan(status);
  const canPurchase = canPurchaseEssentialPlan(status);
  const endLabel = useMemo(() => {
    if (!status?.endsAtUtc) return null;
    const d = new Date(status.endsAtUtc);
    if (Number.isNaN(d.getTime())) return formatPlanEndDate(status.endsAtUtc);
    return d.toLocaleString(localeToCulture(locale), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [status?.endsAtUtc, locale]);

  const perks = useMemo(
    () => [
      { icon: 'chatbubbles' as const, label: t('essential.perkChat') },
      { icon: 'send' as const, label: t('essential.perkRequests') },
      { icon: 'search' as const, label: t('essential.perkBrowse') },
    ],
    [t]
  );
  const currentPlanCode = findCurrentPlanCode(status, plans);
  const selectedPlan = plans.find((p) => p.code === selected);

  const amountLabel = useMemo(() => {
    if (!selectedPlan) return '—';
    return `₹${selectedPlan.priceInr.toLocaleString('en-IN')}`;
  }, [selectedPlan]);

  async function startCashfree() {
    if (!canPurchase || hasActivePlan) {
      Alert.alert(
        t('essential.activePlan'),
        endLabel
          ? t('essential.planActivePurchase', { date: endLabel })
          : t('essential.planAlreadyActive')
      );
      return;
    }
    if (!selected) {
      Alert.alert(t('essential.selectPlan'), t('essential.selectPlanBody'));
      return;
    }
    const plan = plans.find((p) => p.code === selected);
    if (!plan) return;

    setPaying(true);
    try {
      const order = await paymentsApi.createEssentialOrder(plan.code);
      navigation.navigate('CashfreeCheckout', {
        product: 'essential',
        paymentSessionId: order.paymentSessionId,
        orderId: order.orderId,
        environment: order.environment,
        tierCode: plan.code,
        amountInr: plan.priceInr,
        returnPropertyId,
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('essential.couldNotStartPayment');
      Alert.alert(
        hasActivePlan || msg.toLowerCase().includes('already active')
          ? t('essential.activePlan')
          : t('essential.checkoutFailed'),
        msg
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <PageHero
          variant="user"
          icon="shield-checkmark"
          title={t('essential.title')}
          subtitle={t('essential.subtitle')}
        />

        <View style={styles.perks}>
          {perks.map((p) => (
            <View key={p.label} style={styles.perk}>
              <Ionicons name={p.icon} size={16} color="#2563eb" />
              <Text style={styles.perkText}>{p.label}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message={t('essential.loading')} />
        ) : (
          <>
            {status ? <EssentialSubscriptionCard status={status} /> : null}

            <View style={styles.plansSection}>
              <View style={styles.plansHead}>
                <View style={styles.plansHeadLeft}>
                  <Ionicons name="grid-outline" size={16} color={colors.navy} />
                  <Text style={styles.plansHeadLabel}>{t('essential.choosePlan')}</Text>
                </View>
                <Text style={styles.plansHeadHint} numberOfLines={2}>
                  {hasActivePlan
                    ? t('essential.rechargeAfterExpiry')
                    : t('essential.tapToSelect')}
                </Text>
              </View>

              {hasActivePlan && endLabel ? (
                <View style={styles.lockBanner}>
                  <Ionicons name="lock-closed" size={16} color="#1d4ed8" />
                  <Text style={styles.lockBannerText}>
                    {t('essential.planActiveUntil', { date: endLabel })}
                  </Text>
                </View>
              ) : null}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansRow}
              >
                {plans.map((plan) => {
                  const isCurrent =
                    hasActivePlan &&
                    currentPlanCode != null &&
                    plan.code.toLowerCase() === currentPlanCode.toLowerCase();
                  const locked = !canPurchase;
                  return (
                    <EssentialPlanCard
                      key={plan.code}
                      plan={plan}
                      selected={selected === plan.code}
                      isCurrent={isCurrent}
                      locked={locked}
                      onSelect={() => {
                        if (!canPurchase) return;
                        setSelected(plan.code);
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.payPanel}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>
                  <Ionicons name="cash-outline" size={14} color={colors.slateMuted} />{' '}
                  {t('essential.amount')}
                </Text>
                <View style={styles.amountBox}>
                  <Text style={styles.amountValue}>{amountLabel}</Text>
                </View>
              </View>

              <View style={styles.secureNote}>
                <Ionicons name="shield-checkmark" size={16} color="#15803d" />
                <Text style={styles.secureNoteText}>
                  {t('essential.protectedPayment')}{' '}
                  <Text style={styles.secureBold}>{t('essential.secureCheckout')}</Text>.
                </Text>
              </View>

              <View style={styles.paymentBadgesWrap}>
                <PaymentMethodBadges methods={paymentMethods} />
              </View>

              <Pressable
                style={[styles.payBtn, (!canPurchase || paying) && styles.payBtnDisabled]}
                disabled={!canPurchase || paying}
                onPress={startCashfree}
              >
                {paying ? (
                  <ThaneFlatsLogo size={22} animated onDark />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={18} color={colors.heroText} />
                    <Text style={styles.payBtnText}>
                      {!canPurchase ? t('essential.activePlan') : t('essential.paySecurely')}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            <Pressable onPress={() => navigation.navigate('MyPayments', { essentialOnly: true })}>
              <Text style={styles.footerLink}>{t('essential.myPaymentsLink')}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.surfaceMuted,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(248,250,252,0.92)',
    marginTop: spacing.xs,
    lineHeight: 19,
  },
  perks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: '#dbeafe',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: radius.sm,
  },
  perkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  plansSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  plansHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  plansHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  plansHeadLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  plansHeadHint: {
    flex: 1,
    fontSize: 11,
    color: colors.slateLight,
    textAlign: 'right',
    maxWidth: 140,
  },
  lockBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#eff6ff',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lockBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 17,
  },
  plansRow: {
    paddingVertical: spacing.xs,
  },
  payPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
  },
  amountRow: {
    marginBottom: spacing.md,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slateLight,
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  amountBox: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  secureNoteText: {
    flex: 1,
    fontSize: 12,
    color: colors.slateMuted,
    lineHeight: 17,
  },
  secureBold: {
    fontWeight: '800',
    color: '#2563eb',
  },
  paymentBadgesWrap: {
    marginBottom: spacing.md,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#16a34a',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  payBtnDisabled: {
    backgroundColor: colors.slateLight,
  },
  payBtnText: {
    color: colors.heroText,
    fontWeight: '800',
    fontSize: 16,
  },
  footerLinks: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
