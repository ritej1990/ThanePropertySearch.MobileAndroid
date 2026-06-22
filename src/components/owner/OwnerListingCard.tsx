import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { OwnerAvailabilityOutcome, OwnerDashboardItem } from '../../api/ownerTypes';
import { colors, radius, spacing } from '../../theme';
import {
  canResubmitListing,
  isOwnerClosedOutcome,
  listingVisibilityProgress,
  reviewStatusTone,
} from '../../utils/ownerDashboard';
import { OwnerListingManageSection } from './OwnerListingManageSection';

type Props = {
  item: OwnerDashboardItem;
  onPress: () => void;
  onOutcomeChange: (outcome: OwnerAvailabilityOutcome) => Promise<void>;
  onHideToggle: (hidden: boolean) => Promise<void>;
  onDelete: () => Promise<void>;
  onResubmit: () => Promise<void>;
  onViewVisitRequests: () => void;
  onViewClarification: (ticketId: number) => void;
};

const STATUS_STYLES = {
  approved: {
    bar: '#059669',
    bg: '#ecfdf5',
    border: '#86efac',
    text: '#166534',
  },
  pending: {
    bar: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
  },
  rejected: {
    bar: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#991b1b',
  },
  neutral: {
    bar: '#2563eb',
    bg: '#eff6ff',
    border: '#93c5fd',
    text: '#1e40af',
  },
} as const;

export function OwnerListingCard({
  item,
  onPress,
  onOutcomeChange,
  onHideToggle,
  onDelete,
  onResubmit,
  onViewVisitRequests,
  onViewClarification,
}: Props) {
  const tone = reviewStatusTone(item.reviewStatus);
  const statusStyle = STATUS_STYLES[tone];
  const visibility = listingVisibilityProgress(item);
  const hasPending = item.pendingRequests > 0;
  const closedOut = isOwnerClosedOutcome(item.ownerAvailabilityOutcome);
  const canResubmit = canResubmitListing(item);
  const [resubmitting, setResubmitting] = useState(false);

  async function handleResubmit() {
    setResubmitting(true);
    try {
      await onResubmit();
    } catch {
      Alert.alert('Could not resubmit', 'Please try again.');
    } finally {
      setResubmitting(false);
    }
  }

  return (
    <View style={[styles.card, closedOut && styles.cardClosed]}>
      <View style={[styles.accent, { backgroundColor: statusStyle.bar }]} />
      <View style={styles.body}>
        <Pressable
          style={({ pressed }) => [pressed && styles.cardPressed]}
          onPress={onPress}
        >
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#0d9488" />
              <Text style={styles.area} numberOfLines={1}>
                {item.areaName}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.slateLight} />
        </View>

        <View style={styles.chipRow}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: statusStyle.bg,
                borderColor: statusStyle.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.reviewStatus}
            </Text>
          </View>
          {item.isFeaturedInSearch && (
            <View style={styles.featuredChip}>
              <Ionicons name="star" size={11} color="#92400e" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          {item.isForRent ? (
            <View style={styles.typeChipRent}>
              <Text style={styles.typeChipTextRent}>Rent</Text>
            </View>
          ) : null}
          {item.isForSale ? (
            <View style={styles.typeChipSale}>
              <Text style={styles.typeChipTextSale}>Sale</Text>
            </View>
          ) : null}
          {item.isForPg ? (
            <View style={styles.typeChipPg}>
              <Text style={styles.typeChipTextPg}>PG</Text>
            </View>
          ) : null}
          {item.isHiddenFromSearch ? (
            <View style={styles.hiddenChip}>
              <Ionicons name="eye-off" size={11} color={colors.slateMuted} />
              <Text style={styles.hiddenText}>Hidden</Text>
            </View>
          ) : null}
          {closedOut ? (
            <View style={styles.closedChip}>
              <Text style={styles.closedText}>{item.ownerAvailabilityOutcome}</Text>
            </View>
          ) : null}
          {item.ownerListingTier ? (
            <View style={styles.tierChip}>
              <Text style={styles.tierText}>{item.ownerListingTier}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricBox, hasPending && styles.metricBoxAlert]}>
            <Text style={styles.metricValue}>{item.pendingRequests}</Text>
            <Text style={styles.metricLabel}>Pending inquiries</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{item.totalRequests}</Text>
            <Text style={styles.metricLabel}>Total requests</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{item.viewCount ?? 0}</Text>
            <Text style={styles.metricLabel}>Views</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{item.favoriteCount ?? 0}</Text>
            <Text style={styles.metricLabel}>Favorites</Text>
          </View>
        </View>

        {item.verificationDetail ? (
          <View style={styles.verificationBox}>
            <Ionicons name="alert-circle" size={14} color="#b45309" />
            <Text style={styles.verificationText}>{item.verificationDetail}</Text>
          </View>
        ) : null}

        {item.reviewClarificationTicketId != null || canResubmit ? (
          <View style={styles.actionRow}>
            {item.reviewClarificationTicketId != null ? (
              <Pressable
                style={styles.actionBtn}
                onPress={() => onViewClarification(item.reviewClarificationTicketId!)}
              >
                <Ionicons name="chatbubbles-outline" size={14} color={colors.navy} />
                <Text style={styles.actionBtnText}>Clarification</Text>
              </Pressable>
            ) : null}
            {canResubmit ? (
              <Pressable
                style={[styles.actionBtn, styles.actionBtnPrimary]}
                onPress={handleResubmit}
                disabled={resubmitting}
              >
                <Ionicons name="refresh" size={14} color={colors.heroText} />
                <Text style={styles.actionBtnTextPrimary}>
                  {resubmitting ? 'Resubmitting…' : 'Resubmit for review'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.visibilityBlock}>
          <View style={styles.visibilityHead}>
            <Text style={styles.visibilityLabel}>Listing visibility</Text>
            <Text style={styles.visibilityValue}>{visibility.label}</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#0d9488', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${visibility.percent}%` }]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerCta}>View inquiries & listing</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
        </Pressable>

        <Pressable style={styles.visitRequestsBtn} onPress={onViewVisitRequests}>
          <Ionicons name="calendar-outline" size={14} color="#1e40af" />
          <Text style={styles.visitRequestsText}>Visit requests</Text>
        </Pressable>

        <OwnerListingManageSection
          item={item}
          onOutcomeChange={onOutcomeChange}
          onHideToggle={onHideToggle}
          onDelete={onDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  cardClosed: {
    opacity: 0.96,
    backgroundColor: '#f8fafc',
  },
  cardPressed: {
    opacity: 0.96,
  },
  accent: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  area: {
    flex: 1,
    fontSize: 13,
    color: colors.slateMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featuredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  tierChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  typeChipRent: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  typeChipTextRent: { fontSize: 11, fontWeight: '700', color: '#166534' },
  typeChipSale: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  typeChipTextSale: { fontSize: 11, fontWeight: '700', color: '#9a3412' },
  typeChipPg: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  typeChipTextPg: { fontSize: 11, fontWeight: '700', color: '#5b21b6' },
  hiddenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hiddenText: { fontSize: 11, fontWeight: '700', color: colors.slateMuted },
  closedChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  closedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e40af',
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricBox: {
    flexGrow: 1,
    flexBasis: '22%',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  metricBoxAlert: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  metricLabel: {
    fontSize: 9,
    color: colors.slateLight,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  verificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  verificationText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 17,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  actionBtnPrimary: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  actionBtnTextPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.heroText,
  },
  visitRequestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: '#eff6ff',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  visitRequestsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e40af',
  },
  visibilityBlock: {
    marginBottom: spacing.md,
  },
  visibilityHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  visibilityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
  },
  visibilityValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    minWidth: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerCta: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
