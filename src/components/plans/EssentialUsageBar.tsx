import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EssentialStatus } from '../../api/paymentTypes';
import { radius, spacing } from '../../theme';
import {
  essentialCreditsLevelStyles,
  normalizeEssentialUsage,
  resolveEssentialCreditsLevel,
} from '../../utils/planUsage';

type Props = {
  status: EssentialStatus;
  onPress: () => void;
  compact?: boolean;
  collapsed?: boolean;
};

/** Header plan-credits meter — matches web essential-credits-chip. */
export function EssentialUsageBar({ status, onPress, compact, collapsed }: Props) {
  const { usageMax, usageUsed, usageLeft } = normalizeEssentialUsage(status);
  if (usageMax <= 0) return null;

  const pctUsed = Math.min(100, Math.max(0, (usageUsed / usageMax) * 100));
  const { level, hint } = resolveEssentialCreditsLevel(
    usageLeft,
    usageMax,
    status.endsAtUtc
  );
  const palette = essentialCreditsLevelStyles(level);
  const title = `${usageLeft} of ${usageMax} plan credits left · ${hint}`;

  return (
    <Pressable
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
      onPress={onPress}
      disabled={collapsed}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.meter, { backgroundColor: palette.meterTrack }]}>
        <View
          style={[
            styles.meterFill,
            { width: `${pctUsed}%`, backgroundColor: palette.meterFill },
          ]}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.left}>
          <Ionicons
            name="flash"
            size={compact ? 12 : 14}
            color={palette.text}
            style={styles.icon}
          />
          <Text style={[styles.label, compact && styles.labelCompact, { color: palette.text }]}>
            Plan credits
          </Text>
        </View>
        <Text style={[styles.count, compact && styles.countCompact, { color: palette.text }]}>
          <Text style={styles.countStrong}>{usageLeft}</Text>
          <Text style={styles.countOf}> of {usageMax}</Text>
          <Text style={styles.countSuffix}> left</Text>
        </Text>
        <Ionicons name="chevron-forward" size={14} color={palette.text} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  wrapCompact: {
    marginTop: spacing.xs,
    paddingVertical: 6,
  },
  meter: {
    height: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: 6,
  },
  meterFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  icon: {
    opacity: 0.95,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 10,
  },
  count: {
    fontSize: 11,
    fontWeight: '600',
  },
  countCompact: {
    fontSize: 10,
  },
  countStrong: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: -0.3,
  },
  countOf: {
    fontWeight: '600',
    opacity: 0.92,
  },
  countSuffix: {
    fontWeight: '600',
    opacity: 0.88,
  },
});
