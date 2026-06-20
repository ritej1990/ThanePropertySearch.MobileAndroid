import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EssentialStatus } from '../api/paymentTypes';
import type { RootStackParamList } from '../navigation/types';
import { ApiError } from '../api/client';
import { getEssentialStatusLabel, normalizeEssentialUsage } from './planDisplay';
import type { TranslateFn } from '../i18n';

export { normalizeEssentialUsage };

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type EssentialCreditsLevel = 'ok' | 'moderate' | 'critical';

export type PlanHeaderDisplay = {
  text: string;
  tone: 'active' | 'warn' | 'expired';
  accessibilityLabel: string;
};

/** Matches web essential-credits-chip — expired when plan is not active. */
export function isEssentialPlanExpired(status: EssentialStatus | null): boolean {
  if (!status) return true;
  const { tone, label } = getEssentialStatusLabel(status);
  return tone === 'expired' && label === 'Expired';
}

/** Header chip next to brand — Usage N% only while plan is active; otherwise Expired / Credits used. */
export function getPlanHeaderDisplay(status: EssentialStatus, t: TranslateFn): PlanHeaderDisplay {
  const { label, tone } = getEssentialStatusLabel(status);

  if (tone === 'expired') {
    return {
      text: t('plan.expired'),
      tone: 'expired',
      accessibilityLabel: t('plan.planExpiredA11y'),
    };
  }

  if (label === 'Credits used') {
    return {
      text: t('plan.creditsUsed'),
      tone: 'warn',
      accessibilityLabel: t('plan.creditsUsedA11y'),
    };
  }

  const percent = formatPlanUsedPercent(status);
  return {
    text: t('plan.usagePercent', { percent }),
    tone,
    accessibilityLabel: t('plan.usageA11y', { percent }),
  };
}

export function planHeaderPalette(tone: PlanHeaderDisplay['tone']) {
  if (tone === 'expired') {
    return essentialCreditsLevelStyles('critical');
  }
  if (tone === 'warn') {
    return essentialCreditsLevelStyles('moderate');
  }
  return essentialCreditsLevelStyles('ok');
}

export function resolveEssentialCreditsLevel(
  usageLeft: number,
  usageMax: number,
  endsAtUtc: string | null | undefined
): { level: EssentialCreditsLevel; hint: string } {
  const pctLeft = usageMax > 0 ? usageLeft / usageMax : 0;
  let daysUntilExpiry: number | null = null;
  if (endsAtUtc) {
    daysUntilExpiry = Math.ceil(
      (new Date(endsAtUtc).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );
  }

  if (usageLeft <= 0) {
    return { level: 'critical', hint: 'No plan credits left' };
  }
  if (daysUntilExpiry != null && daysUntilExpiry <= 0) {
    return { level: 'critical', hint: 'Plan expired' };
  }
  if (daysUntilExpiry != null && daysUntilExpiry <= 3) {
    return {
      level: 'critical',
      hint:
        daysUntilExpiry === 1
          ? 'Plan expires tomorrow'
          : `Plan expires in ${daysUntilExpiry} days`,
    };
  }
  if (pctLeft < 0.2 || usageLeft <= 3) {
    return { level: 'critical', hint: 'Almost out of credits' };
  }
  if (
    (daysUntilExpiry != null && daysUntilExpiry <= 7) ||
    pctLeft < 0.4 ||
    usageLeft <= 8
  ) {
    const hint =
      daysUntilExpiry != null && daysUntilExpiry <= 7 && daysUntilExpiry > 3
        ? `Plan expires in ${daysUntilExpiry} days`
        : 'Credits running low';
    return { level: 'moderate', hint };
  }
  return { level: 'ok', hint: 'Plan credits available' };
}

export function essentialCreditsLevelStyles(level: EssentialCreditsLevel) {
  switch (level) {
    case 'critical':
      return {
        bg: 'rgba(239, 68, 68, 0.34)',
        border: 'rgba(252, 165, 165, 0.55)',
        text: '#fef2f2',
        meterTrack: 'rgba(255, 255, 255, 0.22)',
        meterFill: '#fecaca',
      };
    case 'moderate':
      return {
        bg: 'rgba(245, 158, 11, 0.32)',
        border: 'rgba(252, 211, 77, 0.5)',
        text: '#fffbeb',
        meterTrack: 'rgba(255, 255, 255, 0.22)',
        meterFill: '#fde68a',
      };
    default:
      return {
        bg: 'rgba(16, 185, 129, 0.28)',
        border: 'rgba(110, 231, 183, 0.45)',
        text: '#ecfdf5',
        meterTrack: 'rgba(255, 255, 255, 0.22)',
        meterFill: '#6ee7b7',
      };
  }
}

export function hasActivePlanCredits(status: EssentialStatus | null): boolean {
  if (!status?.active) return false;
  const { usageLeft } = normalizeEssentialUsage(status);
  return usageLeft > 0;
}

/**
 * Contact-pack credits work for revealing owner contact even when the Essential
 * plan is inactive/exhausted, so the reveal action must consider both.
 */
export function canRevealOwnerContact(status: EssentialStatus | null): boolean {
  if (!status) return false;
  return hasActivePlanCredits(status) || (status.contactRevealCreditsRemaining ?? 0) > 0;
}

export function formatPlanCredits(status: EssentialStatus | null): string {
  if (!status) return '—';
  const { usageLeft, usageMax } = normalizeEssentialUsage(status);
  return `${usageLeft} / ${usageMax}`;
}

/** Whole-number percent of Essential plan credits consumed (0–100). */
export function formatPlanUsedPercent(status: EssentialStatus): number {
  if (!status.active) return 100;
  const { usageMax, usageUsed } = normalizeEssentialUsage(status);
  if (usageMax <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((usageUsed / usageMax) * 100)));
}

const CREDIT_ACTIONS =
  'Each action uses 1 plan credit: reveal contact, schedule visit, request property, or send a chat message.';

export function alertPlanRequired(
  navigation: Nav,
  returnPropertyId?: number,
  expired?: boolean,
  t?: TranslateFn
): void {
  const title = expired
    ? t?.('plan.planExpiredTitle') ?? 'Plan expired'
    : t?.('plan.planRequired') ?? 'Plan required';
  const body = expired
    ? t?.('plan.planExpiredBody') ??
      'Your Essential plan has expired. Renew to contact owners, schedule visits, and send messages.'
    : CREDIT_ACTIONS;
  const action = expired
    ? t?.('plan.renewPlan') ?? 'Renew plan'
    : t?.('plan.viewPlans') ?? 'View plans';

  Alert.alert(title, body, [
    { text: t?.('common.cancel') ?? 'Cancel', style: 'cancel' },
    {
      text: action,
      onPress: () =>
        navigation.navigate('EssentialService', {
          returnPropertyId,
        }),
    },
  ]);
}

export function alertNoCreditsLeft(
  navigation: Nav,
  returnPropertyId?: number
): void {
  Alert.alert(
    'No credits left',
    `You have used all credits on your Essential plan. Renew to continue.\n\n${CREDIT_ACTIONS}`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Renew plan',
        onPress: () =>
          navigation.navigate('EssentialService', {
            returnPropertyId,
          }),
      },
    ]
  );
}

export function handlePlanUsageError(
  error: unknown,
  navigation: Nav,
  returnPropertyId?: number
): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 403 || error.status === 402) {
    alertNoCreditsLeft(navigation, returnPropertyId);
    return true;
  }
  return false;
}
