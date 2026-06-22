import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OwnerListingSummary } from '../../api/ownerTypes';
import { colors, radius, spacing } from '../../theme';

type Props = {
  summary: OwnerListingSummary;
};

type Tone = 'active' | 'warn' | 'expired';

const TONE_PALETTE: Record<
  Tone,
  { wash: string; border: string; badgeBg: string; badgeBorder: string; badgeText: string; accent: string }
> = {
  active: {
    wash: '#f0fdf4',
    border: '#bbf7d0',
    badgeBg: '#dcfce7',
    badgeBorder: '#6ee7b7',
    badgeText: '#15803d',
    accent: '#16a34a',
  },
  warn: {
    wash: '#fffbeb',
    border: '#fde68a',
    badgeBg: '#fef3c7',
    badgeBorder: '#fcd34d',
    badgeText: '#b45309',
    accent: '#d97706',
  },
  expired: {
    wash: '#fef2f2',
    border: '#fecaca',
    badgeBg: '#fee2e2',
    badgeBorder: '#fca5a5',
    badgeText: '#b91c1c',
    accent: '#dc2626',
  },
};

function StatTile({
  icon,
  label,
  value,
  muted,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  muted?: string;
  accent: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIconWrap, { backgroundColor: `${accent}1A` }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <View style={styles.statMeta}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue} numberOfLines={1}>
          {value}
          {muted ? <Text style={styles.statMuted}> {muted}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

/** Owner listing plan/credits status — mirrors web's owner-dashboard plan card. */
export function OwnerListingPlanCard({ summary }: Props) {
  const tone: Tone = !summary.active
    ? 'expired'
    : summary.postsRemaining <= 1
      ? 'warn'
      : 'active';
  const palette = TONE_PALETTE[tone];
  const label = !summary.active ? 'Expired' : summary.postsRemaining <= 1 ? 'Low posts' : 'Active';

  return (
    <View style={[styles.card, { backgroundColor: palette.wash, borderColor: palette.border }]}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <Ionicons name="home" size={14} color={palette.accent} />
          <Text style={[styles.title, { color: palette.accent }]}>LISTING PLAN</Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: palette.badgeBg, borderColor: palette.badgeBorder },
          ]}
        >
          <Text style={[styles.badgeText, { color: palette.badgeText }]}>{label}</Text>
        </View>
      </View>

      {summary.hasPendingApproval ? (
        <View style={styles.pendingNote}>
          <Ionicons name="time-outline" size={13} color="#b45309" />
          <Text style={styles.pendingNoteText}>
            A listing is pending admin approval.
          </Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        <StatTile
          icon="pricetag"
          label="TIER"
          value={summary.tierCode?.trim() || '—'}
          accent={palette.accent}
        />
        <StatTile
          icon="layers"
          label="POSTS LEFT"
          value={String(summary.postsRemaining)}
          muted={`/ ${summary.maxPosts}`}
          accent={palette.accent}
        />
        <StatTile
          icon="calendar"
          label="DAYS LEFT"
          value={String(summary.daysLeft)}
          accent={palette.accent}
        />
        <StatTile
          icon="cash-outline"
          label="AMOUNT PAID"
          value={summary.amountPaid != null ? `₹${summary.amountPaid.toLocaleString('en-IN')}` : '—'}
          accent={palette.accent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pendingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  pendingNoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stat: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
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
