import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandBadge } from '../ui/BrandBadge';
import { colors, radius, spacing, typography } from '../../theme';

const HIGHLIGHTS = [
  'Smart property search',
  'Verified Thane listings',
  'Owner dashboard tools',
] as const;

export function LoginHeader() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <BrandBadge />
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.lead}>
        Buy, rent, or list properties across Thane — synced with thaneflats.com
      </Text>
      <View style={styles.pills}>
        {HIGHLIGHTS.map((label) => (
          <View key={label} style={styles.pill}>
            <Text style={styles.pillText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.heroTitle,
    color: colors.heroText,
    marginTop: spacing.lg,
  },
  lead: {
    ...typography.heroLead,
    color: colors.heroText,
    opacity: 0.9,
    marginTop: spacing.sm,
    maxWidth: 340,
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
