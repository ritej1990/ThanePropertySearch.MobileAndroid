import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EssentialStatus } from '../../api/paymentTypes';
import { formatPlanEndDate, getEssentialStatusLabel, normalizeEssentialUsage } from '../../utils/planDisplay';
import { colors, radius, spacing } from '../../theme';

type Props = {
  status: EssentialStatus;
};

function StatTile({
  icon,
  label,
  value,
  muted,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  muted?: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color="#2563eb" />
      <View style={styles.statMeta}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {value}
          {muted ? <Text style={styles.statMuted}> {muted}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

export function EssentialSubscriptionCard({ status }: Props) {
  const { label, tone } = getEssentialStatusLabel(status);
  const { usageLeft, usageUsed, usageMax } = normalizeEssentialUsage(status);
  const endLabel = formatPlanEndDate(status.endsAtUtc);

  const badgeStyle =
    tone === 'active'
      ? styles.badgeActive
      : tone === 'warn'
        ? styles.badgeWarn
        : styles.badgeExpired;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>YOUR SUBSCRIPTION</Text>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
      </View>
      <View style={styles.grid}>
        <StatTile
          icon="pricetag"
          label="TIER"
          value={status.tier?.trim() || '—'}
        />
        <StatTile
          icon="arrow-down-circle"
          label="REMAINING"
          value={String(usageLeft)}
          muted={`/ ${usageMax}`}
        />
        <StatTile
          icon="trending-up"
          label="USED"
          value={String(usageUsed)}
          muted={`/ ${usageMax}`}
        />
        <StatTile
          icon="calendar"
          label="ACCESS UNTIL"
          value={endLabel ?? '—'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.slateLight,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  badgeWarn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  badgeExpired: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statMeta: { flex: 1, minWidth: 0 },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slateLight,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 2,
  },
  statMuted: {
    fontWeight: '600',
    color: colors.slateLight,
    fontSize: 12,
  },
});
