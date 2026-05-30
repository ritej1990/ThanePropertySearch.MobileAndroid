import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EssentialStatus } from '../api/paymentTypes';
import type { RootStackParamList } from '../navigation/types';
import { ApiError } from '../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export type EssentialCreditsLevel = 'ok' | 'moderate' | 'critical';

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

export function normalizeEssentialUsage(status: EssentialStatus) {
  const usageMax = Math.max(0, status.usageMax);
  const usageUsed = Math.max(0, status.usageUsed);
  const usageLeft =
    usageMax > 0
      ? Math.max(0, usageMax - usageUsed)
      : Math.max(0, status.usageLeft);
  return { usageMax, usageUsed, usageLeft };
}

export function hasActivePlanCredits(status: EssentialStatus | null): boolean {
  if (!status) return false;
  if (status.active) return (status.usageLeft ?? 0) > 0;
  return (
    (status.usageLeft ?? 0) > 0 &&
    status.endsAtUtc != null &&
    new Date(status.endsAtUtc) > new Date()
  );
}

export function formatPlanCredits(status: EssentialStatus | null): string {
  if (!status) return '—';
  return `${status.usageLeft} / ${status.usageMax}`;
}

const CREDIT_ACTIONS =
  'Each action uses 1 plan credit: reveal contact, schedule visit, request property, or send a chat message.';

export function alertPlanRequired(
  navigation: Nav,
  returnPropertyId?: number
): void {
  Alert.alert('Plan required', CREDIT_ACTIONS, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'View plans',
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
