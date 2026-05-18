import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
      <LinearGradient
        colors={[colors.navyDeep, '#1a4d6e', '#0f766e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.eyebrow}>Owner dashboard</Text>
        <Text style={styles.heroHint}>Manage listings, inquiries & posting</Text>

        <View style={styles.quickActions}>
          <Pressable style={styles.quickPrimary} onPress={onBrowse}>
            <Ionicons name="search" size={18} color={colors.heroText} />
            <Text style={styles.quickPrimaryText}>Browse market</Text>
          </Pressable>
          <Pressable style={styles.quickSecondary} onPress={onPostProperty}>
            <Ionicons name="add-circle-outline" size={18} color={colors.heroText} />
            <Text style={styles.quickSecondaryText}>Post property</Text>
          </Pressable>
        </View>
      </LinearGradient>

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

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(248, 250, 252, 0.75)',
    marginBottom: 4,
  },
  heroHint: {
    fontSize: 14,
    color: 'rgba(248, 250, 252, 0.9)',
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
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
