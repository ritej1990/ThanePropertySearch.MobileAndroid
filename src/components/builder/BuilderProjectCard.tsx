import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { BuilderProjectSummary } from '../../api/builderTypes';
import { BuilderCoverImage } from './BuilderCoverImage';
import { colors, radius, spacing } from '../../theme';
import {
  formatBuilderPrice,
  formatPossessionDate,
} from '../../utils/builderFormat';

type Props = {
  item: BuilderProjectSummary;
  onPress: () => void;
};

export function BuilderProjectCard({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.media}>
        <BuilderCoverImage
          uri={item.coverImageUrl}
          projectName={item.projectName}
          style={styles.image}
          compact
        />
        <LinearGradient
          colors={['transparent', 'rgba(30, 27, 75, 0.92)']}
          style={styles.mediaGradient}
          pointerEvents="none"
        />
        <View style={styles.mediaTop} pointerEvents="none">
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{item.projectStatus}</Text>
          </View>
          {item.reraNumber ? (
            <View style={styles.reraPill}>
              <Ionicons name="shield-checkmark" size={11} color={colors.goldSoft} />
              <Text style={styles.reraPillText}>RERA</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.mediaBottom} pointerEvents="none">
          <Text style={styles.projectName} numberOfLines={2}>
            {item.projectName}
          </Text>
          <View style={styles.builderRow}>
            <Ionicons name="ribbon-outline" size={13} color="#c4b5fd" />
            <Text style={styles.builderName} numberOfLines={1}>
              {item.builderName}
            </Text>
          </View>
        </View>
        <View style={styles.priceTag} pointerEvents="none">
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>{formatBuilderPrice(item.startingPrice)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={14} color={colors.builder} />
          </View>
          <Text style={styles.location} numberOfLines={2}>
            {item.areaName}
          </Text>
        </View>

        <View style={styles.statsStrip}>
          <Stat icon="business-outline" value={String(item.towerCount)} label="Towers" />
          <View style={styles.statDivider} />
          <Stat icon="grid-outline" value={String(item.totalUnits)} label="Units" />
          <View style={styles.statDivider} />
          <Stat
            icon="home-outline"
            value={String(item.availableUnits ?? 0)}
            label="Open"
            highlight
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.possession}>
            <Ionicons name="calendar-outline" size={13} color={colors.slateLight} />
            <Text style={styles.possessionText} numberOfLines={1}>
              <Text style={styles.possessionLabel}>Possession </Text>
              {formatPossessionDate(item.possessionDate)}
            </Text>
          </View>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>View project</Text>
            <Ionicons name="arrow-forward-circle" size={22} color={colors.builder} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Stat({
  icon,
  value,
  label,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={14} color={highlight ? colors.builder : colors.slateMuted} />
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.builderBorder,
    marginBottom: spacing.lg,
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  cardPressed: {
    opacity: 0.97,
    transform: [{ scale: 0.995 }],
  },
  media: {
    height: 200,
    backgroundColor: colors.navyDeep,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mediaGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.heroText,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.heroText,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  reraPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.45)',
  },
  reraPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldSoft,
  },
  mediaBottom: {
    position: 'absolute',
    left: spacing.md,
    right: 100,
    bottom: spacing.md,
  },
  projectName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.heroText,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  builderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  builderName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.9)',
  },
  priceTag: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(248, 250, 252, 0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.goldSoft,
    marginTop: 2,
  },
  body: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  locationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.builderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateMuted,
    lineHeight: 18,
    paddingTop: 4,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.borderLight,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
  },
  statValueHighlight: {
    color: colors.builder,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  possession: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  possessionText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
  },
  possessionLabel: {
    flexShrink: 0,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.builder,
  },
});
