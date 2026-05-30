import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PageHero } from '../ui/PageHero';
import { OwnerStatCard } from '../owner/OwnerStatCard';
import { colors, radius, spacing } from '../../theme';
import type { AgentProfile } from '../../api/agentTypes';

type Props = {
  profile: AgentProfile | null;
  listingCount: number;
  publishCredits: number;
  leadCredits: number;
  canPost: boolean;
  onPayments: () => void;
  onPost: () => void;
  onBrowse: () => void;
};

export function AgentDashboardHeader({
  profile,
  listingCount,
  publishCredits,
  leadCredits,
  canPost,
  onPayments,
  onPost,
  onBrowse,
}: Props) {
  const approval = profile?.approvalStatus?.trim() ?? 'Pending';
  const approvalLower = approval.toLowerCase();
  const approved = approvalLower === 'approved';
  const rejected = approvalLower.includes('reject');

  return (
    <View style={styles.wrap}>
      <PageHero
        variant="owner"
        icon="briefcase-outline"
        title="Agent dashboard"
        subtitle="RERA profile, publish credits, listings & leads"
      >
        <View style={styles.perks}>
          <Perk icon="shield-checkmark" label="Approval-based posting" />
          <Perk icon="wallet-outline" label="Credits drive visibility" />
          <Perk icon="chatbubbles-outline" label="Track lead enquiries" />
        </View>
        <View style={styles.quickActions}>
          <Pressable
            style={[styles.quickPost, !canPost && styles.quickPostDisabled]}
            onPress={onPost}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.heroText} />
            <Text style={styles.quickPostText}>Post listing</Text>
          </Pressable>
          <Pressable style={styles.quickPrimary} onPress={onPayments}>
            <Ionicons name="card-outline" size={18} color={colors.heroText} />
            <Text style={styles.quickPrimaryText}>Plans & payments</Text>
          </Pressable>
          <Pressable style={styles.quickSecondary} onPress={onBrowse}>
            <Ionicons name="search" size={18} color={colors.heroText} />
            <Text style={styles.quickSecondaryText}>Browse</Text>
          </Pressable>
        </View>
      </PageHero>

      <View
        style={[
          styles.profileCard,
          approved && styles.profileCardOk,
          rejected && styles.profileCardRejected,
        ]}
      >
        <View style={styles.profileHead}>
          <Text style={styles.profileTitle}>Profile & access</Text>
          <View
            style={[
              styles.approvalPill,
              approved && styles.approvalOk,
              rejected && styles.approvalRejected,
            ]}
          >
            <Text
              style={[
                styles.approvalText,
                approved && styles.approvalTextOk,
                rejected && styles.approvalTextRejected,
              ]}
            >
              {approval}
            </Text>
          </View>
        </View>
        {profile?.companyName ? (
          <Text style={styles.company}>{profile.companyName}</Text>
        ) : null}
        {profile?.reraNumber ? (
          <Text style={styles.rera}>RERA {profile.reraNumber}</Text>
        ) : null}
      </View>

      <View style={styles.statsGrid}>
        <OwnerStatCard
          icon="document-text-outline"
          value={listingCount}
          label="Listings"
          accent={colors.primary}
        />
        <OwnerStatCard
          icon="cloud-upload-outline"
          value={publishCredits}
          label="Publish credits"
          accent={colors.gold}
          highlight={publishCredits > 0}
        />
        <OwnerStatCard
          icon="people-outline"
          value={leadCredits}
          label="Lead credits"
          accent={colors.teal}
          highlight={leadCredits > 0}
        />
        <OwnerStatCard
          icon="star"
          value={profile?.ratingCount ? profile.averageRating.toFixed(1) : '—'}
          label="Avg rating"
          accent="#f59e0b"
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
  wrap: { marginBottom: spacing.md },
  perks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  perkText: { fontSize: 11, fontWeight: '600', color: 'rgba(248,250,252,0.88)' },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickPost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.6)',
  },
  quickPostDisabled: {
    opacity: 0.55,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickPostText: { fontSize: 13, fontWeight: '800', color: colors.heroText },
  quickPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  quickPrimaryText: { fontSize: 13, fontWeight: '700', color: colors.heroText },
  quickSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.45)',
  },
  quickSecondaryText: { fontSize: 13, fontWeight: '700', color: colors.goldAccent },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileCardOk: {
    borderColor: '#6ee7b7',
    backgroundColor: '#f0fdfa',
  },
  profileCardRejected: {
    borderColor: '#fecaca',
    backgroundColor: colors.errorSoft,
  },
  profileHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  profileTitle: { fontSize: 14, fontWeight: '800', color: colors.navy },
  approvalPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
  },
  approvalOk: { backgroundColor: colors.successSoft },
  approvalRejected: { backgroundColor: colors.errorSoft },
  approvalText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.warning,
    textTransform: 'uppercase',
  },
  approvalTextOk: { color: colors.success },
  approvalTextRejected: { color: colors.error },
  company: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.sm,
  },
  rera: { fontSize: 13, color: colors.slateLight, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
