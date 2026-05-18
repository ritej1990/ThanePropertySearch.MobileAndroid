import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { OwnerDashboardItem } from '../../api/ownerTypes';
import { colors, radius, spacing } from '../../theme';
import {
  listingVisibilityProgress,
  reviewStatusTone,
} from '../../utils/ownerDashboard';

type Props = {
  item: OwnerDashboardItem;
  onPress: () => void;
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

export function OwnerListingCard({ item, onPress }: Props) {
  const tone = reviewStatusTone(item.reviewStatus);
  const statusStyle = STATUS_STYLES[tone];
  const visibility = listingVisibilityProgress(item);
  const hasPending = item.pendingRequests > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.accent, { backgroundColor: statusStyle.bar }]} />
      <View style={styles.body}>
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
        </View>

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
          <Text style={styles.footerCta}>Manage listing</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
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
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
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
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricBox: {
    flex: 1,
    padding: spacing.md,
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.slateLight,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
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
