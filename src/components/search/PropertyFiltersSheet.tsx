import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BHK_FILTER_OPTIONS,
  RENT_PRESETS,
  type ListingTypeFilter,
  type PropertySearchFilters,
  type RentPresetKey,
  countActiveFilters,
} from '../../utils/propertySearchFilters';
import { FilterChip, FilterIconCard } from './FilterChip';
import { colors, radius, spacing } from '../../theme';

type Props = {
  visible: boolean;
  filters: PropertySearchFilters;
  onFiltersChange: (filters: PropertySearchFilters) => void;
  onClose: () => void;
  onClearAll: () => void;
  resultCount: number;
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

export function PropertyFiltersSheet({
  visible,
  filters,
  onFiltersChange,
  onClose,
  onClearAll,
  resultCount,
}: Props) {
  const insets = useSafeAreaInsets();
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Search filters</Text>
            <Text style={styles.sub}>
              {resultCount} {resultCount === 1 ? 'home matches' : 'homes match'} now
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close filters">
            <Ionicons name="close" size={24} color={colors.slateMuted} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          <Text style={styles.groupLabel}>BHK configuration</Text>
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

          {showRentPresets ? (
            <>
              <Text style={styles.groupLabel}>Monthly budget (rent / PG)</Text>
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
          ) : null}

          <Text style={styles.groupLabel}>More options</Text>
          <View style={styles.extraRow}>
            <FilterChip
              label="Featured only"
              icon="star-outline"
              active={filters.featuredOnly}
              onPress={() => patch({ featuredOnly: !filters.featuredOnly })}
              accent={colors.gold}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {activeCount > 0 ? (
            <Pressable style={styles.clearBtn} onPress={onClearAll}>
              <Text style={styles.clearText}>Clear filters</Text>
            </Pressable>
          ) : (
            <View style={styles.clearSpacer} />
          )}
          <Pressable style={styles.applyBtnWrap} onPress={onClose}>
            <LinearGradient
              colors={['#0d9488', '#0f766e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyBtn}
            >
              <Text style={styles.applyText}>Show {resultCount} homes</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
  },
  sub: {
    fontSize: 13,
    color: colors.slateMuted,
    marginTop: 4,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  hScroll: {
    paddingBottom: spacing.sm,
  },
  extraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  clearBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  clearSpacer: {
    width: 80,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  applyBtnWrap: {
    flex: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.heroText,
  },
});
