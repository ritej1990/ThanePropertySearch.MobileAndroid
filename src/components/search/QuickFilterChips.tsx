import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BHK_FILTER_OPTIONS,
  type ListingTypeFilter,
  type PropertySearchFilters,
} from '../../utils/propertySearchFilters';
import { colors, radius, spacing } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  filters: PropertySearchFilters;
  onFiltersChange: (filters: PropertySearchFilters) => void;
  compact?: boolean;
};

const LISTING_TYPE_CHIPS: { key: ListingTypeFilter; label: string; icon: IconName }[] = [
  { key: 'rent', label: 'Rent', icon: 'key' },
  { key: 'sale', label: 'Sale', icon: 'pricetag' },
  { key: 'pg', label: 'PG', icon: 'bed' },
];

function Chip({
  label,
  icon,
  selected,
  onPress,
  compact,
}: {
  label: string;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={compact ? 11 : 12}
          color={selected ? colors.heroText : colors.slateMuted}
        />
      ) : null}
      <Text style={[styles.text, compact && styles.textCompact, selected && styles.textSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Quick-refine chip row — lets users tweak listing type, BHK & featured-only
 * without opening the full PropertyFiltersSheet. Designed to sit either inline
 * (above the list) or inside the sticky overlay bar once scrolled.
 */
export function QuickFilterChips({ filters, onFiltersChange, compact }: Props) {
  function toggleListingType(key: ListingTypeFilter) {
    onFiltersChange({
      ...filters,
      listingType: filters.listingType === key ? 'all' : key,
    });
  }

  function toggleBhk(value: string) {
    const has = filters.bhk.includes(value);
    onFiltersChange({
      ...filters,
      bhk: has ? filters.bhk.filter((b) => b !== value) : [...filters.bhk, value],
    });
  }

  function toggleFeatured() {
    onFiltersChange({ ...filters, featuredOnly: !filters.featuredOnly });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, compact && styles.rowCompact]}
    >
      {LISTING_TYPE_CHIPS.map((opt) => (
        <Chip
          key={opt.key}
          label={opt.label}
          icon={opt.icon}
          selected={filters.listingType === opt.key}
          onPress={() => toggleListingType(opt.key)}
          compact={compact}
        />
      ))}
      <Chip
        label="Featured"
        icon="star"
        selected={filters.featuredOnly}
        onPress={toggleFeatured}
        compact={compact}
      />
      {BHK_FILTER_OPTIONS.map((bhk) => (
        <Chip
          key={bhk}
          label={bhk}
          selected={filters.bhk.includes(bhk)}
          onPress={() => toggleBhk(bhk)}
          compact={compact}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  rowCompact: {
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipCompact: {
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  chipSelected: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  chipPressed: {
    opacity: 0.88,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  textCompact: {
    fontSize: 10.5,
  },
  textSelected: {
    color: colors.heroText,
  },
});
