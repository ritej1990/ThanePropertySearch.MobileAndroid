import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { GradientButton } from '../ui/GradientButton';
import { colors, radius, spacing } from '../../theme';
import type { PaymentProduct } from '../../services/paymentActivation';

type Props = {
  product: PaymentProduct;
  message: string;
  amountInr: number;
  tierCode?: string;
  orderId: string;
  onContinue: () => void;
};

function productTitle(product: PaymentProduct, tierCode?: string): string {
  if (product === 'essential') {
    return tierCode ? `Essential plan · ${tierCode}` : 'Essential plan';
  }
  return 'Contact reveal pack';
}

export function PaymentSuccessCard({
  product,
  message,
  amountInr,
  tierCode,
  orderId,
  onContinue,
}: Props) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#0f766e', '#0c4a6e', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.checkRing}>
          <Ionicons name="checkmark-circle" size={56} color="#6ee7b7" />
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <ThaneFlatsLogo size={32} />
        <Text style={styles.title}>Payment successful</Text>
        <Text style={styles.subtitle}>{productTitle(product, tierCode)}</Text>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Paid</Text>
          <Text style={styles.amount}>₹{amountInr.toLocaleString('en-IN')}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.refBox}>
          <Ionicons name="receipt-outline" size={16} color={colors.slateLight} />
          <Text style={styles.refText} numberOfLines={1}>
            Order {orderId}
          </Text>
        </View>

        <GradientButton label="Continue" onPress={onContinue} style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  checkRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.md,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f766e',
    marginTop: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateLight,
  },
  amount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.slateMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  refBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  refText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  btn: {
    width: '100%',
  },
});
