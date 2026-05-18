import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PropertyResponse } from '../../api/types';
import { PropertyImage } from '../property/PropertyImage';
import { PropertyChip } from '../property/PropertyChip';
import { colors, radius, spacing } from '../../theme';
import { listingTypeChips } from '../../utils/propertyFormat';
import { getPrimaryPrice } from '../../utils/propertyDisplay';

type Props = {
  item: PropertyResponse;
  onPress: () => void;
  onClose: () => void;
};

export function PropertyMapPreviewCard({ item, onPress, onClose }: Props) {
  const price = getPrimaryPrice(item);
  const chips = listingTypeChips(item);

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.card} onPress={onPress}>
        <PropertyImage uri={item.imageUrl} style={styles.thumb} />
        <View style={styles.body}>
          <View style={styles.chipRow}>
            {chips.slice(0, 2).map((c) => (
              <PropertyChip key={c.label} label={c.label} tone={c.tone} small />
            ))}
            {item.bhkConfiguration ? (
              <PropertyChip label={item.bhkConfiguration} tone="bhk" small />
            ) : null}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color="#0d9488" />{' '}
            {item.areaName}
          </Text>
          <Text style={styles.price}>
            {price.amount}
            {price.suffix}
          </Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>View details</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </View>
        </View>
      </Pressable>
      <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
        <Ionicons name="close" size={20} color={colors.slateMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  thumb: {
    width: 108,
    height: 128,
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    flex: 1,
    padding: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 20,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: colors.slateMuted,
    marginBottom: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f766e',
    marginBottom: spacing.sm,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
