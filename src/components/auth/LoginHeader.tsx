import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandBadge } from '../ui/BrandBadge';
import { colors, radius, spacing, typography } from '../../theme';

const HIGHLIGHTS = [
  'Smart property search',
  'Verified Thane listings',
  'Owner dashboard tools',
] as const;

type Props = {
  /** Shorter header for web / small viewports */
  compact?: boolean;
};

export function LoginHeader({ compact }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} pointerEvents="none">
      <BrandBadge />
      <Text style={[styles.title, compact && styles.titleCompact]}>Welcome back</Text>
      <Text style={[styles.lead, compact && styles.leadCompact]}>
        Buy, rent, or list properties across Thane — all in one app
      </Text>
      {!compact ? (
        <View style={styles.pills}>
          {HIGHLIGHTS.map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.xl,
  },
  wrapCompact: {
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.heroTitle,
    color: colors.heroText,
    marginTop: spacing.lg,
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 32,
    marginTop: spacing.md,
  },
  lead: {
    ...typography.heroLead,
    color: colors.heroText,
    opacity: 0.9,
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  leadCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.heroText,
    opacity: 0.95,
  },
});
