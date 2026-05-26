import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyLocationSearch } from '../property/PropertyLocationSearch';
import type { SelectedPlace } from '../../services/googlePlaces';
import { DEFAULT_SEARCH_RADIUS_KM, hasGoogleMapsKey } from '../../config/env';
import {
  nextSortOption,
  type PropertySearchFilters,
} from '../../utils/propertySearchFilters';
import { SearchViewToggle, type SearchViewMode } from './SearchViewToggle';
import { colors, radius, spacing } from '../../theme';

type Props = {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  selectedPlace: SelectedPlace | null;
  onPlaceSelected: (place: SelectedPlace | null) => void;
  filters: PropertySearchFilters;
  onFiltersChange: (filters: PropertySearchFilters) => void;
  resultCount: number;
  totalLoaded: number;
  viewMode: SearchViewMode;
  onViewModeChange: (mode: SearchViewMode) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onOpenBuilders?: () => void;
  showPlan?: boolean;
  onOpenPlan?: () => void;
  showOwnerLink?: boolean;
  onOwnerDashboard?: () => void;
};

export function HomeSearchToolbar({
  searchText,
  onSearchTextChange,
  selectedPlace,
  onPlaceSelected,
  filters,
  onFiltersChange,
  resultCount,
  totalLoaded,
  viewMode,
  onViewModeChange,
  activeFilterCount,
  onOpenFilters,
  onOpenBuilders,
  showPlan,
  onOpenPlan,
  showOwnerLink,
  onOwnerDashboard,
}: Props) {
  const mapsEnabled = hasGoogleMapsKey();

  const summary = selectedPlace
    ? `${DEFAULT_SEARCH_RADIUS_KM} km radius · ${resultCount} shown`
    : `${totalLoaded} in Thane · ${resultCount} match your filters`;

  return (
    <View style={styles.wrap}>
      <PropertyLocationSearch
        value={searchText}
        onChangeText={onSearchTextChange}
        selectedPlace={selectedPlace}
        onPlaceSelected={onPlaceSelected}
        compact
      />

      <View style={styles.viewRow}>
        <View style={styles.viewToggleWrap}>
          <SearchViewToggle
            mode={viewMode}
            onChange={onViewModeChange}
            mapDisabled={!mapsEnabled}
            compact
          />
        </View>
        {onOpenBuilders ? (
          <Pressable style={styles.actionChip} onPress={onOpenBuilders}>
            <Ionicons name="business" size={15} color={colors.builder} />
            <Text style={styles.actionChipText}>Builders</Text>
          </Pressable>
        ) : null}
        {showPlan && onOpenPlan ? (
          <Pressable style={[styles.actionChip, styles.actionChipPlan]} onPress={onOpenPlan}>
            <Ionicons name="flash" size={15} color="#2563eb" />
            <Text style={[styles.actionChipText, styles.actionChipPlanText]}>Plan</Text>
          </Pressable>
        ) : null}
        {showOwnerLink && onOwnerDashboard ? (
          <Pressable style={[styles.actionChip, styles.actionChipOwner]} onPress={onOwnerDashboard}>
            <Ionicons name="grid" size={15} color="#0f766e" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.summaryCol}>
          <Text style={styles.summary} numberOfLines={2}>
            {summary}
          </Text>
        </View>
        <Pressable style={styles.filterBtn} onPress={onOpenFilters}>
          <Ionicons name="options-outline" size={18} color={colors.navy} />
          <Text style={styles.filterBtnText}>Filters</Text>
          {activeFilterCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          style={styles.sortBtn}
          onPress={() =>
            onFiltersChange({ ...filters, sort: nextSortOption(filters.sort) })
          }
        >
          <Ionicons name="swap-vertical" size={16} color={colors.navy} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 20,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  viewToggleWrap: {
    flex: 1,
    minWidth: 0,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  actionChipPlan: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  actionChipOwner: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    paddingHorizontal: 10,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.builderDark,
  },
  actionChipPlanText: {
    color: '#1d4ed8',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  summaryCol: {
    flex: 1,
    minWidth: 0,
  },
  summary: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
    lineHeight: 17,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navy,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.heroText,
  },
  sortBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
