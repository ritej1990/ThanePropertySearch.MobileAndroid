import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import type { AgentProfile } from '../../api/agentTypes';
import {
  agentApprovalStatusLabel,
  isAgentProfileApproved,
} from '../../utils/agentApproval';

type Props = {
  profile: AgentProfile | null;
  publishCredits: number;
  leadCredits: number;
  canPost: boolean;
  onPayments: () => void;
  onLeads: () => void;
  onPost: () => void;
};

export function AgentDashboardHeader({
  profile,
  publishCredits,
  leadCredits,
  canPost,
  onPayments,
  onLeads,
  onPost,
}: Props) {
  const approved = isAgentProfileApproved(profile?.approvalStatus);
  const company = profile?.companyName?.trim();

  return (
    <View style={styles.wrap}>
      {publishCredits <= 0 ? (
        <View style={styles.getStarted}>
          <Text style={styles.getStartedText}>
            <Text style={styles.getStartedBold}>Get started.</Text> Buy a publish plan to start
            posting listings.
          </Text>
          <Pressable style={styles.getStartedBtn} onPress={onPayments}>
            <Text style={styles.getStartedBtnText}>Plans</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.infoBanner}>
        <View style={styles.infoMain}>
          <View style={styles.infoIcon}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.infoText}>
            RERA profile, publish credits, listings & leads
          </Text>
        </View>
        <View style={styles.perks}>
          <Perk icon="shield-checkmark" label="Approval-based posting" />
          <Perk icon="wallet-outline" label="Credits drive visibility" />
          <Perk icon="chatbubbles-outline" label="Track lead enquiries" />
        </View>
      </View>

      <View style={styles.portalCard}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Profile & access</Text>
          <View style={styles.sectionBadges}>
            {approved ? (
              <View style={styles.badgeApproved}>
                <Text style={styles.badgeApprovedText}>Approved</Text>
              </View>
            ) : (
              <View style={styles.badgePending}>
                <Text style={styles.badgePendingText}>
                  {agentApprovalStatusLabel(profile?.approvalStatus)}
                </Text>
              </View>
            )}
            {company ? (
              <View style={styles.badgeCompany}>
                <Text style={styles.badgeCompanyText} numberOfLines={1}>
                  {company}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profileTiles}
        >
          <ProfileTile
            icon="shield-checkmark-outline"
            label="Approval"
            value={agentApprovalStatusLabel(profile?.approvalStatus)}
            accent={approved ? colors.success : colors.warning}
          />
          <ProfileTile
            icon="document-text-outline"
            label="RERA"
            value={profile?.reraNumber?.trim() || '—'}
            accent={colors.primary}
            compact
          />
          <ProfileTile
            icon="folder-open-outline"
            label="Publish slots"
            value={String(publishCredits)}
            accent={colors.gold}
            highlight={publishCredits > 0}
          />
          <ProfileTile
            icon="bar-chart-outline"
            label="Lead credits"
            value={String(leadCredits)}
            accent={colors.teal}
            highlight={leadCredits > 0}
          />
          <ProfileTile
            icon="mail-outline"
            label="Email"
            value={profile?.emailConfirmed ? 'Verified' : 'Unverified'}
            accent={profile?.emailConfirmed ? colors.teal : colors.warning}
          />
        </ScrollView>

        <View style={styles.sectionDivider} />

        <Text style={styles.sectionTitle}>Actions</Text>
        <Text style={styles.actionsSub}>
          Post listings after approval + publish plan. Buy plans and manage lead enquiries from
          here.
        </Text>

        <View style={styles.actions}>
          <Pressable style={styles.actionPrimary} onPress={onPayments}>
            <Ionicons name="folder-open-outline" size={18} color={colors.heroText} />
            <Text style={styles.actionPrimaryText}>Plans & payments</Text>
          </Pressable>
          <Pressable style={styles.actionSecondary} onPress={onLeads}>
            <Ionicons name="people-outline" size={18} color={colors.teal} />
            <Text style={styles.actionSecondaryText}>View leads</Text>
          </Pressable>
          <Pressable
            style={[styles.actionSecondary, !canPost && styles.actionLocked]}
            onPress={onPost}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={canPost ? colors.teal : colors.slateLight}
            />
            <Text style={[styles.actionSecondaryText, !canPost && styles.actionLockedText]}>
              {canPost ? 'Post listing' : 'Post listing (locked)'}
            </Text>
          </Pressable>
        </View>
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
      <Ionicons name={icon} size={13} color={colors.success} />
      <Text style={styles.perkText}>{label}</Text>
    </View>
  );
}

function ProfileTile({
  icon,
  label,
  value,
  accent,
  highlight,
  compact,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={[styles.profileTile, highlight && styles.profileTileHighlight]}>
      <View style={[styles.profileTileIcon, { backgroundColor: `${accent}14` }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <Text style={styles.profileTileLabel}>{label}</Text>
      <Text
        style={[styles.profileTileValue, compact && styles.profileTileValueCompact]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  getStarted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: '#eff6ff',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  getStartedText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.navy,
  },
  getStartedBold: { fontWeight: '800' },
  getStartedBtn: {
    backgroundColor: colors.navy,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.md,
  },
  getStartedBtnText: {
    color: colors.heroText,
    fontWeight: '800',
    fontSize: 13,
  },
  infoBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  infoMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 20,
  },
  perks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  perkText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  portalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slateMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    maxWidth: '58%',
  },
  badgeApproved: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  badgeApprovedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
    textTransform: 'uppercase',
  },
  badgePending: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  badgePendingText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.warning,
    textTransform: 'uppercase',
  },
  badgeCompany: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    maxWidth: 140,
  },
  badgeCompanyText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  profileTiles: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  profileTile: {
    width: 118,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  profileTileHighlight: {
    borderColor: '#6ee7b7',
    backgroundColor: colors.tealSoft,
  },
  profileTileIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  profileTileLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  profileTileValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 4,
    lineHeight: 18,
  },
  profileTileValueCompact: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.lg,
  },
  actionsSub: {
    fontSize: 13,
    color: colors.slateLight,
    lineHeight: 19,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  actionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.navy,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  actionPrimaryText: {
    color: colors.heroText,
    fontWeight: '800',
    fontSize: 14,
  },
  actionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.tealBorder,
  },
  actionSecondaryText: {
    color: colors.teal,
    fontWeight: '700',
    fontSize: 14,
  },
  actionLocked: {
    opacity: 0.65,
    borderColor: colors.borderLight,
  },
  actionLockedText: {
    color: colors.slateLight,
  },
});
