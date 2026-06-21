import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EssentialStatus } from '../../api/paymentTypes';
import { useTranslation } from '../../context/LocaleContext';
import { getEssentialStatusLabel } from '../../utils/planDisplay';
import { radius, spacing } from '../../theme';
import {
  essentialCreditsLevelStyles,
  isEssentialPlanExpired,
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
  const { t } = useTranslation();
  const { usageMax, usageUsed, usageLeft } = normalizeEssentialUsage(status);
  if (usageMax <= 0) return null;

  const { label: statusLabel } = getEssentialStatusLabel(status);
  const expired = isEssentialPlanExpired(status);
  const creditsExhausted = statusLabel === 'Credits used';
  const statusOnly = expired || creditsExhausted;

  const pctUsed = expired
    ? 100
    : Math.min(100, Math.max(0, (usageUsed / usageMax) * 100));

  const { level, hint } = expired
    ? { level: 'critical' as const, hint: t('plan.renewHint') }
    : creditsExhausted
      ? { level: 'critical' as const, hint: t('plan.creditsUsedHint') }
      : resolveEssentialCreditsLevel(usageLeft, usageMax, status.endsAtUtc);

  const palette = essentialCreditsLevelStyles(level);
  const statusText = expired
    ? t('plan.expired')
    : creditsExhausted
      ? t('plan.creditsUsed')
      : null;

  const title = expired
    ? `${t('plan.planExpired')} · ${hint}`
    : creditsExhausted
      ? `${t('plan.creditsUsed')} · ${hint}`
      : `${t('plan.creditsLeft', { left: usageLeft, max: usageMax })} · ${hint}`;

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

      {statusOnly ? (
        <View style={styles.statusRow}>
          <Ionicons
            name={expired ? 'time-outline' : 'flash'}
            size={compact ? 12 : 14}
            color={palette.text}
          />
          <Text
            style={[
              styles.statusCentered,
              compact && styles.statusCenteredCompact,
              { color: palette.text },
            ]}
          >
            {statusText}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={palette.text} />
        </View>
      ) : (
        <View style={styles.row}>
          <View style={styles.left}>
            <Ionicons
              name="flash"
              size={compact ? 12 : 14}
              color={palette.text}
              style={styles.icon}
            />
            <Text style={[styles.label, compact && styles.labelCompact, { color: palette.text }]}>
              {t('plan.planCredits')}
            </Text>
          </View>
          <Text style={[styles.count, compact && styles.countCompact, { color: palette.text }]}>
            <Text style={styles.countStrong}>{usageLeft}</Text>
            <Text style={styles.countOf}> of {usageMax}</Text>
            <Text style={styles.countSuffix}> {t('plan.leftSuffix')}</Text>
          </Text>
          <Ionicons name="chevron-forward" size={14} color={palette.text} />
        </View>
      )}

      {expired ? (
        <Text style={[styles.subHint, { color: palette.text }]}>{t('plan.tapRenew')}</Text>
      ) : null}
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusCentered: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statusCenteredCompact: {
    fontSize: 11,
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
  subHint: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    opacity: 0.92,
    textAlign: 'center',
  },
});
