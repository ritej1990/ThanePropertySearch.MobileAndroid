import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropertyResponse } from '../../api/types';
import { PropertyChip } from './PropertyChip';
import { PropertyImage } from './PropertyImage';
import { colors, radius, spacing } from '../../theme';
import { formatInr, listingTypeChips, parseRichMetadata } from '../../utils/propertyFormat';
import { formatRating, getPrimaryPrice } from '../../utils/propertyDisplay';
import { resolveListingRera, shouldShowListingRera, isNewListing } from '../../utils/listingRera';
import { ReraBadge } from './ReraBadge';
import { NewListingRibbon } from './NewListingRibbon';

type Props = {
  item: PropertyResponse;
  onPress: () => void;
};

export function PropertyListCard({ item, onPress }: Props) {
  const chips = listingTypeChips(item);
  const price = getPrimaryPrice(item);
  const rich = parseRichMetadata(item.richMetadataJson);
  const possessionLabel =
    rich.possessionStatus?.trim() ||
    rich.society?.possessionDetail?.trim() ||
    null;
  const isNew = isNewListing(item.createdAtUtc);
  const descSnippet = item.description?.trim()
    ? item.description.trim().slice(0, 90) + (item.description.length > 90 ? '…' : '')
    : null;
  const rera = resolveListingRera(item);
  const showRera = shouldShowListingRera(item);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.media}>
        <PropertyImage uri={item.imageUrl} style={styles.image} />
        {isNew ? <NewListingRibbon /> : null}
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.75)']}
          style={styles.mediaGradient}
          pointerEvents="none"
        />
        <View style={styles.chipsTop} pointerEvents="none">
          {chips.map((c) => (
            <PropertyChip key={c.label} label={c.label} tone={c.tone} small />
          ))}
          {item.isPostedByAgent ? (
            <PropertyChip label="Agent" tone="agent" small />
          ) : null}
          {item.isNegotiable ? (
            <PropertyChip label="Negotiable" tone="bhk" small />
          ) : null}
          {item.isFeaturedInSearch && (
            <PropertyChip label="Featured" tone="featured" small />
          )}
        </View>
        <View style={styles.priceOverlay} pointerEvents="none">
          <Text style={styles.priceOverlayLabel}>{price.label}</Text>
          <Text style={styles.priceOverlayValue}>
            {price.amount}
            {price.suffix ? (
              <Text style={styles.priceOverlaySuffix}>{price.suffix}</Text>
            ) : null}
          </Text>
        </View>
        {item.imageUrls.length > 1 && (
          <View style={styles.photoBadge}>
            <Ionicons name="images-outline" size={12} color={colors.heroText} />
            <Text style={styles.photoBadgeText}>{item.imageUrls.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.bhkConfiguration ? (
            <PropertyChip label={item.bhkConfiguration} tone="bhk" small />
          ) : null}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#0d9488" />
          <Text style={styles.location} numberOfLines={2}>
            {item.areaName}
            {item.address ? ` · ${item.address}` : ''}
          </Text>
        </View>

        {descSnippet ? (
          <Text style={styles.descSnippet} numberOfLines={2}>
            {descSnippet}
          </Text>
        ) : null}

        <View style={styles.factsRow}>
          {showRera && rera ? <ReraBadge rera={rera} compact /> : null}
          {possessionLabel ? (
            <View style={styles.possessionChip}>
              <Ionicons name="calendar-outline" size={12} color="#0d9488" />
              <Text style={styles.possessionText} numberOfLines={1}>
                {possessionLabel}
              </Text>
            </View>
          ) : null}
          {item.builtupSqft > 0 ? (
            <Text style={styles.factText}>{item.builtupSqft} sq.ft</Text>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={colors.gold} />
            <Text style={styles.metaText}>{formatRating(item)}</Text>
          </View>
          {item.ratingCount > 0 ? (
            <View style={styles.ratingPill}>
              <Ionicons name="chatbubble-ellipses-outline" size={12} color="#92400e" />
              <Text style={styles.ratingPillText}>{item.ratingCount} reviews</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.ctaRow}>
          {item.isForRent && item.depositAmount > 0 ? (
            <Text style={styles.depositInline}>
              Deposit {formatInr(item.depositAmount)}
            </Text>
          ) : (
            <View style={styles.ctaSpacer} />
          )}
          <View style={styles.ctaLink}>
            <Text style={styles.cta}>View details</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(219, 234, 254, 0.9)',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.99 }],
  },
  media: {
    height: 176,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  mediaGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  chipsTop: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: 52,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  priceOverlay: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    right: spacing.md,
  },
  priceOverlayLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'rgba(248, 250, 252, 0.85)',
  },
  priceOverlayValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.5,
  },
  priceOverlaySuffix: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  photoBadgeText: {
    color: colors.heroText,
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: spacing.md,
    paddingRight: spacing.xs,
  },
  location: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.slateMuted,
  },
  descSnippet: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.slateLight,
    marginBottom: spacing.sm,
  },
  factsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  possessionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  possessionText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
  },
  factText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.slate,
    fontWeight: '500',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  ratingPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400e',
  },
  depositInline: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
    marginRight: spacing.sm,
  },
  ctaSpacer: {
    flex: 1,
  },
  ctaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cta: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});
