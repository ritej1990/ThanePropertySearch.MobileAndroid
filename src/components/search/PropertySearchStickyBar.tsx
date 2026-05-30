import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SelectedPlace } from '../../services/googlePlaces';
import { hasGoogleMapsKey } from '../../config/env';
import { PlanTopButton } from './PlanTopButton';
import { SearchViewToggle, type SearchViewMode } from './SearchViewToggle';
import { colors, radius, spacing } from '../../theme';

type Props = {
  searchText: string;
  selectedPlace: SelectedPlace | null;
  resultCount: number;
  activeFilterCount: number;
  onPressSearch: () => void;
  onPressFilters: () => void;
  showPlanButton?: boolean;
  onPressPlan?: () => void;
  viewMode: SearchViewMode;
  onViewModeChange: (mode: SearchViewMode) => void;
};

export function PropertySearchStickyBar({
  searchText,
  selectedPlace,
  resultCount,
  activeFilterCount,
  onPressSearch,
  onPressFilters,
  showPlanButton,
  onPressPlan,
  viewMode,
  onViewModeChange,
}: Props) {
  const mapsEnabled = hasGoogleMapsKey();
  const label =
    selectedPlace?.label ??
    (searchText.trim() ? searchText.trim() : 'Search area in Thane…');

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.searchTap} onPress={onPressSearch}>
        <Ionicons name="search" size={16} color={colors.slateLight} />
        <Text style={styles.searchText} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>

      <Pressable style={styles.filterBtn} onPress={onPressFilters}>
        <Ionicons name="options-outline" size={18} color={colors.navy} />
        {activeFilterCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <SearchViewToggle
        mode={viewMode}
        onChange={onViewModeChange}
        mapDisabled={!mapsEnabled}
        compact
      />

      {showPlanButton && onPressPlan ? (
        <PlanTopButton onPress={onPressPlan} compact />
      ) : null}
      <View style={styles.countWrap}>
        <Text style={styles.count}>{resultCount}</Text>
        <Text style={styles.countLabel}>homes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 20,
  },
  searchTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.heroText,
  },
  countWrap: {
    alignItems: 'flex-end',
    minWidth: 44,
  },
  count: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f766e',
    lineHeight: 18,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slateLight,
  },
});
