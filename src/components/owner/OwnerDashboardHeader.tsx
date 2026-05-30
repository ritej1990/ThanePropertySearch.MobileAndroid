import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHero } from '../ui/PageHero';
import { colors, radius, spacing } from '../../theme';
import type { OwnerDashboardStats } from '../../utils/ownerDashboard';
import { OwnerStatCard } from './OwnerStatCard';

type Props = {
  stats: OwnerDashboardStats;
  onBrowse: () => void;
  onPostProperty: () => void;
};

export function OwnerDashboardHeader({
  stats,
  onBrowse,
  onPostProperty,
}: Props) {
  return (
    <View style={styles.wrap}>
      <PageHero
        variant="owner"
        icon="speedometer-outline"
        title="Owner dashboard"
        subtitle="Listings, inquiries & visits"
      >
        <View style={styles.perks}>
          <Perk icon="chatbubble-ellipses-outline" label="Reply fast" />
          <Perk icon="calendar" label="Visits" />
          <Perk icon="trending-up" label="Track pending" />
        </View>
        <View style={styles.quickActions}>
          <Pressable style={styles.quickPrimary} onPress={onBrowse}>
            <Ionicons name="search" size={18} color={colors.heroText} />
            <Text style={styles.quickPrimaryText}>Browse</Text>
          </Pressable>
          <Pressable style={styles.quickSecondary} onPress={onPostProperty}>
            <Ionicons name="add-circle-outline" size={18} color={colors.heroText} />
            <Text style={styles.quickSecondaryText}>Post property</Text>
          </Pressable>
        </View>
      </PageHero>

      <View style={styles.statsGrid}>
        <OwnerStatCard icon="home" value={stats.total} label="Listings" accent="#38bdf8" />
        <OwnerStatCard
          icon="mail-unread"
          value={stats.pendingRequests}
          label="Pending inquiries"
          accent="#f59e0b"
          highlight={stats.pendingRequests > 0}
        />
        <OwnerStatCard
          icon="checkmark-circle"
          value={stats.approved}
          label="Approved"
          accent="#10b981"
        />
        <OwnerStatCard
          icon="star"
          value={stats.featured}
          label="Featured"
          accent={colors.gold}
        />
      </View>
    </View>
  );
}

function Perk({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.perk}>
      <Ionicons name={icon} size={14} color={colors.goldAccent} />
      <Text style={styles.perkText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  perks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  perkText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.9)',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  quickPrimaryText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 14,
  },
  quickSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  quickSecondaryText: {
    color: colors.heroText,
    fontWeight: '600',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
