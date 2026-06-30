import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { PropertyResponse } from '../../api/types';
import { PropertyChip } from './PropertyChip';
import { PropertyCardGallery } from './PropertyCardGallery';
import { AiListingScoreBadge } from './AiListingScoreBadge';
import { PropertyListCardMetaColumn } from './PropertyListCardMetaColumn';
import { colors, radius, spacing } from '../../theme';
import { listingTypeChips } from '../../utils/propertyFormat';
import { getPrimaryPrice } from '../../utils/propertyDisplay';
import { buildListCardBodyMeta } from '../../utils/propertyListMeta';
import { isNewListing } from '../../utils/listingRera';
import { NewListingRibbon } from './NewListingRibbon';
import { FavoriteButton } from './FavoriteButton';
import { PropertyVerificationBadge } from './PropertyVerificationBadge';
import { verificationBadgeForListing } from '../../utils/propertyVerification';
import { useListingCardIntelligence } from '../../hooks/useListingCardIntelligence';
import { useTranslation } from '../../context/LocaleContext';

type Props = {
  item: PropertyResponse;
  onPress: () => void;
};

const MEDIA_HEIGHT = 176;

function PropertyListCardBase({ item, onPress }: Props) {
  const { t } = useTranslation();
  const chips = listingTypeChips(item);
  const price = getPrimaryPrice(item);
  const isNew = isNewListing(item.createdAtUtc);
  const intelligence = useListingCardIntelligence(item.id);
  const aiScore =
    intelligence && intelligence.investmentScore > 0 ? intelligence.investmentScore : null;

  const bodyMeta = buildListCardBodyMeta(item);
  const verificationBadge = verificationBadgeForListing(item);

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
            <PropertyChip label={t('propertyList.agent')} tone="agent" small />
          ) : null}
        </View>
        <View style={styles.topActions}>
          {aiScore != null ? <AiListingScoreBadge investmentScore={aiScore} /> : null}
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
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#0d9488" />
          <Text style={styles.areaName} numberOfLines={1}>
            {item.areaName || t('propertyList.defaultArea')}
          </Text>
        </View>

        {verificationBadge ? (
          <View style={styles.verificationRow}>
            <PropertyVerificationBadge
              label={verificationBadge.label}
              tone={verificationBadge.tone}
              compact
            />
          </View>
        ) : null}

        <View style={styles.contentRow}>
          <PropertyListCardMetaColumn
            facts={bodyMeta.leftFacts}
            tags={bodyMeta.leftTags}
            notes={bodyMeta.leftNotes}
            edge="left"
          />
          <PropertyListCardMetaColumn
            facts={bodyMeta.rightFacts}
            tags={bodyMeta.rightTags}
            notes={bodyMeta.rightNotes}
            edge="right"
          />
        </View>

        <View style={styles.ctaRow}>
          <Text style={styles.cta}>{t('propertyList.viewDetails')}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

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
    right: 110,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipsTopNew: {
    left: 64,
  },
  topActions: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
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
  body: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
    lineHeight: 21,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  verificationRow: {
    marginBottom: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  areaName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cta: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
