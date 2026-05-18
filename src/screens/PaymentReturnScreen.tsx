import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BrandLoading } from '../components/ui/BrandLoading';
import { PaymentSuccessCard } from '../components/payments/PaymentSuccessCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  activateCashfreeOrder,
  type PaymentProduct,
} from '../services/paymentActivation';
import {
  clearPendingPayment,
  loadPendingPayment,
} from '../storage/pendingPaymentStorage';
import type { RootStackParamList } from '../navigation/types';
import { LoginBackdrop } from '../components/auth/LoginBackdrop';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentReturn'>;

type Phase = 'activating' | 'success' | 'error';

export default function PaymentReturnScreen({ navigation, route }: Props) {
  const [phase, setPhase] = useState<Phase>('activating');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [resolved, setResolved] = useState<{
    product: PaymentProduct;
    orderId: string;
    tierCode?: string;
    amountInr: number;
    returnPropertyId?: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = route.params as Props['route']['params'] & { order_id?: string };
      let orderId = raw.orderId ?? raw.order_id ?? '';
      let product = raw.product;
      let tierCode = raw.tierCode;
      let amountInr = raw.amountInr;
      let returnPropertyId = raw.returnPropertyId;

      if (!product || amountInr == null) {
        const pending = await loadPendingPayment();
        if (pending && (!orderId || pending.orderId === orderId)) {
          product = pending.product;
          tierCode = pending.tierCode;
          amountInr = pending.amountInr;
          returnPropertyId = pending.returnPropertyId;
          if (!orderId) orderId = pending.orderId;
        }
      }

      if (!orderId || !product || amountInr == null) {
        if (!cancelled) {
          setError(
            'Missing payment details. Open checkout again from the plan or property page.'
          );
          setPhase('error');
        }
        return;
      }

      if (!cancelled) {
        setResolved({
          product,
          orderId,
          tierCode,
          amountInr,
          returnPropertyId,
        });
      }

      try {
        const message = await activateCashfreeOrder(
          product,
          orderId,
          tierCode,
          amountInr
        );
        if (cancelled) return;
        await clearPendingPayment();
        setSuccessMessage(message);
        setPhase('success');
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Payment activation failed');
          setPhase('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [route.params]);

  const continueAfterSuccess = useCallback(() => {
    if (!resolved) {
      navigation.replace('Home');
      return;
    }
    if (resolved.returnPropertyId != null) {
      navigation.replace('PropertyDetails', {
        propertyId: resolved.returnPropertyId,
        title: undefined,
      });
    } else if (resolved.product === 'essential') {
      navigation.replace('EssentialService');
    } else {
      navigation.replace('Home');
    }
  }, [navigation, resolved]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <LoginBackdrop />

      <View style={styles.content}>
        {phase === 'activating' ? (
          <View style={styles.centered}>
            <BrandLoading message="Activating your purchase…" />
            <Text style={styles.statusHint}>
              Please wait — do not close the app.
            </Text>
          </View>
        ) : null}

        {phase === 'success' && resolved ? (
          <PaymentSuccessCard
            product={resolved.product}
            message={
              successMessage ||
              (resolved.product === 'essential'
                ? 'Your essential plan is active. You can use contact credits on listings.'
                : 'Contact pack added. Reveal owner phone and email on property pages.')
            }
            amountInr={resolved.amountInr}
            tierCode={resolved.tierCode}
            orderId={resolved.orderId}
            onContinue={continueAfterSuccess}
          />
        ) : null}

        {phase === 'error' ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not confirm payment</Text>
            <Text style={styles.err}>{error}</Text>
            <Text style={styles.hint}>
              If money was deducted, wait a minute and open Plan payment again — we
              will sync automatically.
            </Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() =>
                navigation.replace(
                  resolved?.product === 'contact_pack'
                    ? 'ContactPackPurchase'
                    : 'EssentialService'
                )
              }
            >
              <Text style={styles.retryText}>
                {resolved?.product === 'contact_pack'
                  ? 'Back to contact pack'
                  : 'Back to plans'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.homeBtn}
              onPress={() => navigation.replace('Home')}
            >
              <Text style={styles.homeBtnText}>Go home</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navyDeep,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  statusHint: {
    marginTop: spacing.lg,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.75)',
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  err: {
    color: colors.error,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: 14,
    color: colors.slateLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  retryBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 15,
  },
  homeBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  homeBtnText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 15,
  },
});
