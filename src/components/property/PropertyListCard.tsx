import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropertyResponse } from '../../api/types';
import { PropertyChip } from './PropertyChip';
import { PropertyCardGallery } from './PropertyCardGallery';
import { PropertyListMetaPanel } from './PropertyListMetaPanel';
import { colors, radius, spacing } from '../../theme';
import { listingTypeChips } from '../../utils/propertyFormat';
import { formatRating, getPrimaryPrice } from '../../utils/propertyDisplay';
import { buildPropertyListCardMeta } from '../../utils/propertyListMeta';
import { resolveListingRera, shouldShowListingRera, isNewListing } from '../../utils/listingRera';
import { ReraBadge } from './ReraBadge';
import { NewListingRibbon } from './NewListingRibbon';
import { AiCardInsight } from './AiCardInsight';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  item: PropertyResponse;
  onPress: () => void;
};

const MEDIA_HEIGHT = 176;

function PropertyListCardBase({ item, onPress }: Props) {
  const chips = listingTypeChips(item);
  const price = getPrimaryPrice(item);
  const listMeta = useMemo(() => buildPropertyListCardMeta(item), [item]);
  const isNew = isNewListing(item.createdAtUtc);
  const descSnippet = item.description?.trim()
    ? item.description.trim().slice(0, 120) + (item.description.length > 120 ? '…' : '')
    : null;
  const rera = resolveListingRera(item);
  const showRera = shouldShowListingRera(item);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.media}>
        <PropertyCardGallery
          urls={item.imageUrls?.length ? item.imageUrls : [item.imageUrl].filter(Boolean) as string[]}
          height={MEDIA_HEIGHT}
        />
        {isNew ? <NewListingRibbon /> : null}
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.75)']}
          style={styles.mediaGradient}
          pointerEvents="none"
        />
        <View style={[styles.chipsTop, isNew && styles.chipsTopNew]} pointerEvents="none">
          {chips.map((c) => (
            <PropertyChip key={c.label} label={c.label} tone={c.tone} small />
          ))}
          {item.isPostedByAgent ? (
            <PropertyChip label="Agent" tone="agent" small />
          ) : null}
          {item.isNegotiable ? (
            <PropertyChip label="Negotiable" tone="bhk" small />
          ) : null}
          {item.isFeaturedInSearch ? (
            <PropertyChip label="Featured" tone="featured" small />
          ) : null}
        </View>
        <View style={styles.favoriteSlot}>
          {/* Home feed only ever returns PropertyListings rows — isPostedByAgent just means
              the owner has the Agent role, it's not the separate AgentListings entity. */}
          <FavoriteButton resourceType="PropertyListing" resourceId={item.id} />
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

        <View style={styles.locationBlock}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#0d9488" />
            <Text style={styles.areaName} numberOfLines={1}>
              {item.areaName || 'Thane'}
            </Text>
          </View>
          {item.address?.trim() ? (
            <Text style={styles.address} numberOfLines={2}>
              {item.address.trim()}
            </Text>
          ) : null}
        </View>

        <PropertyListMetaPanel meta={listMeta} />

        {showRera && rera ? (
          <View style={styles.reraRow}>
            <ReraBadge rera={rera} compact />
          </View>
        ) : null}

        {descSnippet ? (
          <Text style={styles.descSnippet} numberOfLines={3}>
            {descSnippet}
          </Text>
        ) : null}

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

        <AiCardInsight listingId={item.id} />

        <View style={styles.ctaRow}>
          <Text style={styles.ctaHint} numberOfLines={1}>
            Tap for full details, photos & amenities
          </Text>
          <View style={styles.ctaLink}>
            <Text style={styles.cta}>View details</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** Memoized: FlatList recycles rows on scroll — avoids re-render churn for off-screen data. */
export const PropertyListCard = React.memo(PropertyListCardBase);

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
    height: MEDIA_HEIGHT,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
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
  chipsTopNew: {
    left: 64,
  },
  favoriteSlot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
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
  locationBlock: {
    marginBottom: spacing.md,
    gap: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  areaName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f766e',
  },
  address: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.slateMuted,
    paddingLeft: 22,
  },
  reraRow: {
    marginBottom: spacing.sm,
  },
  descSnippet: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.slateLight,
    marginBottom: spacing.sm,
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
  ctaHint: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
    marginRight: spacing.sm,
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
