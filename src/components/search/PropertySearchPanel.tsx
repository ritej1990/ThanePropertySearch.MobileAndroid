import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyLocationSearch } from '../property/PropertyLocationSearch';
import type { SelectedPlace } from '../../services/googlePlaces';
import { DEFAULT_SEARCH_RADIUS_KM } from '../../config/env';
import {
  BHK_FILTER_OPTIONS,
  RENT_PRESETS,
  type ListingTypeFilter,
  type PropertySearchFilters,
  type RentPresetKey,
  countActiveFilters,
  nextSortOption,
  sortLabel,
} from '../../utils/propertySearchFilters';
import { FilterChip, FilterIconCard } from './FilterChip';
import { SearchViewToggle, type SearchViewMode } from './SearchViewToggle';
import { hasGoogleMapsKey } from '../../config/env';
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
  onClearAll: () => void;
  showOwnerLink?: boolean;
  onOwnerDashboard?: () => void;
  viewMode: SearchViewMode;
  onViewModeChange: (mode: SearchViewMode) => void;
  filtersExpanded?: boolean;
  onFiltersExpandedChange?: (expanded: boolean) => void;
  /** Tighter layout for list header (scrolls away with results). */
  embedded?: boolean;
  /** List/Map toggle is shown in a fixed bar on Home — hide here when embedded. */
  hideViewToggle?: boolean;
};

const LISTING_TYPES: {
  key: ListingTypeFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { key: 'all', label: 'All', icon: 'grid-outline', color: colors.navyMid },
  { key: 'rent', label: 'Rent', icon: 'key-outline', color: '#2563eb' },
  { key: 'sale', label: 'Sale', icon: 'cash-outline', color: '#7c3aed' },
  { key: 'pg', label: 'PG', icon: 'bed-outline', color: '#0d9488' },
];

export function PropertySearchPanel({
  searchText,
  onSearchTextChange,
  selectedPlace,
  onPlaceSelected,
  filters,
  onFiltersChange,
  resultCount,
  totalLoaded,
  onClearAll,
  showOwnerLink,
  onOwnerDashboard,
  viewMode,
  onViewModeChange,
  filtersExpanded: filtersExpandedProp,
  onFiltersExpandedChange,
  embedded,
  hideViewToggle,
}: Props) {
  const mapsEnabled = hasGoogleMapsKey();
  const [filtersExpandedLocal, setFiltersExpandedLocal] = useState(false);
  const filtersExpanded = filtersExpandedProp ?? filtersExpandedLocal;
  const setFiltersExpanded =
    onFiltersExpandedChange ?? setFiltersExpandedLocal;
  const activeCount = countActiveFilters(filters);
  const showRentPresets =
    filters.listingType === 'all' ||
    filters.listingType === 'rent' ||
    filters.listingType === 'pg';

  function patch(partial: Partial<PropertySearchFilters>) {
    onFiltersChange({ ...filters, ...partial });
  }

  function toggleBhk(bhk: string) {
    const next = filters.bhk.includes(bhk)
      ? filters.bhk.filter((b) => b !== bhk)
      : [...filters.bhk, bhk];
    patch({ bhk: next });
  }

  return (
    <View style={[styles.wrap, embedded && styles.wrapEmbedded]}>
      <View style={styles.toolbarRow}>
        <View style={styles.searchFlex}>
          <PropertyLocationSearch
            value={searchText}
            onChangeText={onSearchTextChange}
            selectedPlace={selectedPlace}
            onPlaceSelected={onPlaceSelected}
            compact
          />
        </View>
        {showOwnerLink && onOwnerDashboard ? (
          <Pressable style={styles.ownerBtn} onPress={onOwnerDashboard}>
            <Ionicons name="grid-outline" size={16} color="#0f766e" />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.metaRow, hideViewToggle && styles.metaRowCompact]}>
        <Text style={styles.metaText} numberOfLines={1}>
          {selectedPlace
            ? `${DEFAULT_SEARCH_RADIUS_KM} km · ${resultCount} match`
            : `${totalLoaded} loaded · ${resultCount} match`}
        </Text>
        {!hideViewToggle ? (
          <SearchViewToggle
            mode={viewMode}
            onChange={onViewModeChange}
            mapDisabled={!mapsEnabled}
            compact
          />
        ) : null}
      </View>

      <Pressable
        style={styles.filtersToggle}
        onPress={() => setFiltersExpanded(!filtersExpanded)}
      >
        <View style={styles.filtersToggleLeft}>
          <Ionicons name="options-outline" size={18} color={colors.navy} />
          <Text style={styles.filtersToggleText}>Filters</Text>
          {activeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeCount}</Text>
            </View>
          ) : null}
        </View>
        <Ionicons
          name={filtersExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.slateLight}
        />
      </Pressable>

      {filtersExpanded && (
        <View style={styles.filtersBody}>
          <Text style={styles.groupLabel}>Listing type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {LISTING_TYPES.map((t) => (
              <FilterIconCard
                key={t.key}
                label={t.label}
                icon={t.icon}
                color={t.color}
                active={filters.listingType === t.key}
                onPress={() => patch({ listingType: t.key })}
              />
            ))}
          </ScrollView>

          <Text style={styles.groupLabel}>BHK</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {BHK_FILTER_OPTIONS.map((bhk) => (
              <FilterChip
                key={bhk}
                label={bhk}
                active={filters.bhk.includes(bhk)}
                onPress={() => toggleBhk(bhk)}
              />
            ))}
          </ScrollView>

          {showRentPresets && (
            <>
              <Text style={styles.groupLabel}>Budget (rent / PG)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hScroll}
              >
                {RENT_PRESETS.map((p) => (
                  <FilterChip
                    key={p.key}
                    label={p.label}
                    active={filters.rentPreset === p.key}
                    onPress={() => patch({ rentPreset: p.key as RentPresetKey })}
                    icon="wallet-outline"
                  />
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.extraRow}>
            <FilterChip
              label="Featured"
              icon="star-outline"
              active={filters.featuredOnly}
              onPress={() => patch({ featuredOnly: !filters.featuredOnly })}
              accent={colors.gold}
            />
          </View>
        </View>
      )}

      <View style={styles.resultsBar}>
        <Pressable
          style={styles.sortBtn}
          onPress={() => patch({ sort: nextSortOption(filters.sort) })}
        >
          <Ionicons name="swap-vertical" size={15} color={colors.navy} />
          <Text style={styles.sortText}>{sortLabel(filters.sort)}</Text>
        </Pressable>
        {activeCount > 0 || selectedPlace || searchText.trim() ? (
          <Pressable style={styles.clearBtn} onPress={onClearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        ) : null}
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
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  wrapEmbedded: {
    shadowOpacity: 0,
    elevation: 0,
    borderBottomWidth: 0,
    paddingBottom: spacing.xs,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchFlex: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaRowCompact: {
    marginBottom: 0,
  },
  metaText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
  },
  ownerBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 2,
  },
  filtersToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filtersToggleText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heroText,
  },
  filtersBody: {
    paddingBottom: spacing.sm,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  hScroll: {
    paddingBottom: spacing.sm,
  },
  extraRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
});
