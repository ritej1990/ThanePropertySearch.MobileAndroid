import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PricingPlan } from '../../api/paymentTypes';
import { colors, radius, spacing } from '../../theme';

type Props = {
  plan: PricingPlan;
  selected: boolean;
  isCurrent: boolean;
  locked: boolean;
  onSelect: () => void;
};

export function EssentialPlanCard({
  plan,
  selected,
  isCurrent,
  locked,
  onSelect,
}: Props) {
  return (
    <Pressable
      disabled={locked}
      onPress={locked ? undefined : onSelect}
      style={[
        styles.card,
        selected && !locked && styles.cardSelected,
        isCurrent && styles.cardCurrent,
        locked && styles.cardLocked,
      ]}
    >
      {isCurrent ? (
        <View style={styles.currentCheck}>
          <Ionicons name="checkmark" size={14} color={colors.heroText} />
        </View>
      ) : null}

      <Text style={styles.price}>₹{plan.priceInr.toLocaleString('en-IN')}</Text>
      <Text style={styles.name} numberOfLines={2}>
        {plan.displayLabel}
      </Text>
      <Text style={styles.meta}>
        <Ionicons name="hand-left-outline" size={12} color={colors.slateLight} />{' '}
        {plan.maxUsage ?? 0} interactions
      </Text>
      <Text style={styles.meta}>
        <Ionicons name="time-outline" size={12} color={colors.slateLight} />{' '}
        {plan.durationDays} days access
      </Text>

      {isCurrent ? (
        <View style={styles.badgeCurrent}>
          <Ionicons name="checkmark-circle" size={14} color="#15803d" />
          <Text style={styles.badgeCurrentText}>Current</Text>
        </View>
      ) : locked ? (
        <View style={styles.badgeLocked}>
          <Ionicons name="lock-closed" size={12} color={colors.slateMuted} />
          <Text style={styles.badgeLockedText}>Recharge locked</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  cardCurrent: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  cardLocked: {
    opacity: 0.72,
  },
  currentCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slateMuted,
    marginTop: 4,
    lineHeight: 16,
    minHeight: 32,
  },
  meta: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: 6,
  },
  badgeCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
  },
  badgeCurrentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  badgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignSelf: 'flex-start',
  },
  badgeLockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slateMuted,
  },
});
