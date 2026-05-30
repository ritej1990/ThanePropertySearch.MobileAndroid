import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

function ToolbarIconBtn({
  icon,
  label,
  onPress,
  badge,
  active,
  tone = 'default',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
  active?: boolean;
  tone?: 'default' | 'builder' | 'plan' | 'owner';
}) {
  const iconColor =
    tone === 'builder'
      ? colors.builder
      : tone === 'plan'
        ? colors.primary
        : tone === 'owner'
          ? colors.tealDark
          : active
            ? colors.heroText
            : colors.navy;

  const inner = (
    <>
      <Ionicons name={icon} size={17} color={iconColor} />
      {badge != null && badge > 0 ? (
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </>
  );

  if (active) {
    return (
      <Pressable onPress={onPress} accessibilityLabel={label}>
        <LinearGradient
          colors={['#0d9488', '#0f766e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBtnActive}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.iconBtn,
        tone === 'builder' && styles.iconBtnBuilder,
        tone === 'plan' && styles.iconBtnPlan,
        tone === 'owner' && styles.iconBtnOwner,
      ]}
      onPress={onPress}
      accessibilityLabel={label}
    >
      {inner}
    </Pressable>
  );
}

function ShortcutPill({
  icon,
  label,
  onPress,
  colors: gradColors,
  borderColor,
  textColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: readonly [string, string];
  borderColor: string;
  textColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shortcutPill, pressed && styles.shortcutPillPressed]}
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={[...gradColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.shortcutGrad, { borderColor }]}
      >
        <Ionicons name={icon} size={14} color={textColor} />
        <Text style={[styles.shortcutText, { color: textColor }]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

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

  const resultLabel = selectedPlace
    ? `${resultCount} homes within ${DEFAULT_SEARCH_RADIUS_KM} km`
    : `${resultCount} of ${totalLoaded} homes in Thane`;

  return (
    <LinearGradient
      colors={['#ffffff', '#f0fdfa', '#eef2ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.searchRow}>
        <View style={styles.searchShadow}>
          <PropertyLocationSearch
            value={searchText}
            onChangeText={onSearchTextChange}
            selectedPlace={selectedPlace}
            onPlaceSelected={onPlaceSelected}
            compact
            dense
            elevated
          />
        </View>
        <ToolbarIconBtn
          icon="options-outline"
          label="Open filters"
          onPress={onOpenFilters}
          badge={activeFilterCount}
          active={activeFilterCount > 0}
        />
        <ToolbarIconBtn
          icon="swap-vertical"
          label="Change sort order"
          onPress={() =>
            onFiltersChange({ ...filters, sort: nextSortOption(filters.sort) })
          }
        />
      </View>

      {selectedPlace ? (
        <LinearGradient
          colors={['#ecfdf5', '#d1fae5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.placeChip}
        >
          <Ionicons name="navigate-circle" size={15} color={colors.tealDark} />
          <Text style={styles.placeChipText} numberOfLines={1}>
            {selectedPlace.label}
          </Text>
          <Pressable
            onPress={() => onPlaceSelected(null)}
            hitSlop={8}
            accessibilityLabel="Clear area"
            style={styles.placeClear}
          >
            <Ionicons name="close" size={14} color={colors.tealDark} />
          </Pressable>
        </LinearGradient>
      ) : null}

      <View style={styles.controlsRow}>
        <View style={styles.viewToggleWrap}>
          <SearchViewToggle
            mode={viewMode}
            onChange={onViewModeChange}
            mapDisabled={!mapsEnabled}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shortcuts}
        >
          {onOpenBuilders ? (
            <ShortcutPill
              icon="business"
              label="Builders"
              onPress={onOpenBuilders}
              colors={['#f5f3ff', '#ede9fe']}
              borderColor={colors.builderBorder}
              textColor={colors.builderDark}
            />
          ) : null}
          {showPlan && onOpenPlan ? (
            <ShortcutPill
              icon="flash"
              label="Plan"
              onPress={onOpenPlan}
              colors={['#eff6ff', '#dbeafe']}
              borderColor="#bfdbfe"
              textColor={colors.primaryDark}
            />
          ) : null}
          {showOwnerLink && onOwnerDashboard ? (
            <ToolbarIconBtn
              icon="grid"
              label="Owner dashboard"
              onPress={onOwnerDashboard}
              tone="owner"
            />
          ) : null}
        </ScrollView>

        <LinearGradient
          colors={['#0d9488', '#0f766e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultBadge}
        >
          <Text style={styles.resultCount}>{resultCount}</Text>
          <Text style={styles.resultLabel}>{selectedPlace ? 'shown' : 'homes'}</Text>
        </LinearGradient>
      </View>

      <View style={styles.insightBar}>
        <View style={styles.insightIcon}>
          <Ionicons name="home" size={12} color={colors.tealDark} />
        </View>
        <Text style={styles.insightText} numberOfLines={1}>
          {resultLabel}
          {activeFilterCount > 0
            ? ` · ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`
            : ''}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(13, 148, 136, 0.12)',
    zIndex: 20,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  searchShadow: {
    flex: 1,
    minWidth: 0,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBtnActive: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBtnBuilder: {
    backgroundColor: colors.builderSoft,
    borderColor: colors.builderBorder,
  },
  iconBtnPlan: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  iconBtnOwner: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.tealBorder,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  iconBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.navy,
  },
  placeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.tealBorder,
  },
  placeChipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.tealDark,
  },
  placeClear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  viewToggleWrap: {
    width: 116,
    flexShrink: 0,
  },
  shortcuts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  shortcutPill: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  shortcutPillPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  shortcutGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  resultBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    marginLeft: 'auto',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.heroText,
    lineHeight: 18,
  },
  resultLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(248, 250, 252, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  },
  insightIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateMuted,
    letterSpacing: 0.1,
  },
});
