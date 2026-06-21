import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PropertyListCardMeta } from '../../utils/propertyListMeta';
import { colors, radius, spacing } from '../../theme';

type Props = {
  meta: PropertyListCardMeta;
};

export function PropertyListMetaPanel({ meta }: Props) {
  const hasContent =
    meta.specs.length > 0 ||
    meta.prices.length > 0 ||
    meta.amenities.length > 0 ||
    meta.highlights.length > 0;

  if (!hasContent) return null;

  return (
    <View style={styles.wrap}>
      {meta.specs.length > 0 ? (
        <View style={styles.specGrid}>
          {meta.specs.map((spec) => (
            <View key={spec.key} style={styles.specCell}>
              <View style={styles.specIcon}>
                <Ionicons name={spec.icon} size={14} color="#0f766e" />
              </View>
              <View style={styles.specText}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue} numberOfLines={2}>
                  {spec.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {meta.prices.length > 0 ? (
        <View style={styles.priceRow}>
          {meta.prices.map((price) => (
            <View key={price.key} style={styles.priceChip}>
              <Text style={styles.priceLabel}>{price.label}</Text>
              <Text style={styles.priceValue}>{price.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {meta.amenities.length > 0 ? (
        <View style={styles.amenitySection}>
          <Text style={styles.sectionLabel}>Amenities</Text>
          <View style={styles.amenityWrap}>
            {meta.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenityPill}>
                <Text style={styles.amenityText} numberOfLines={1}>
                  {amenity}
                </Text>
              </View>
            ))}
            {meta.amenityOverflow > 0 ? (
              <View style={[styles.amenityPill, styles.amenityMore]}>
                <Text style={styles.amenityMoreText}>+{meta.amenityOverflow} more</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {meta.highlights.length > 0 ? (
        <View style={styles.highlightSection}>
          {meta.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightRow}>
              <Ionicons name="checkmark-circle" size={14} color="#0d9488" />
              <Text style={styles.highlightText} numberOfLines={2}>
                {highlight}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specCell: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '48%',
    minWidth: '46%',
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  specIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  specText: {
    flex: 1,
    minWidth: 0,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priceChip: {
    flexGrow: 1,
    minWidth: '46%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1d4ed8',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.navy,
  },
  amenitySection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amenityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityPill: {
    maxWidth: '100%',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  amenityMore: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  amenityMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
  },
  highlightSection: {
    gap: 6,
    paddingVertical: 4,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  highlightText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: colors.slateMuted,
  },
});
