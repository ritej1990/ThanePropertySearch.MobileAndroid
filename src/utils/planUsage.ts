import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { EssentialStatus } from '../api/paymentTypes';
import type { RootStackParamList } from '../navigation/types';
import { ApiError } from '../api/client';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
