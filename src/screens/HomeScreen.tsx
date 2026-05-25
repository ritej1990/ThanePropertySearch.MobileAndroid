import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  type FlatList as FlatListType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { PropertyListCard } from '../components/property/PropertyListCard';
import { BrandLoading } from '../components/ui/BrandLoading';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PropertySearchPanel } from '../components/search/PropertySearchPanel';
import { PropertySearchStickyBar } from '../components/search/PropertySearchStickyBar';
import { PropertySearchMap } from '../components/search/PropertySearchMap';
import { SearchEmptyState } from '../components/search/SearchEmptyState';
import { PlanTopButton } from '../components/search/PlanTopButton';
import { BuildersNavButton } from '../components/search/BuildersNavButton';
import { SearchViewToggle, type SearchViewMode } from '../components/search/SearchViewToggle';
import type { SelectedPlace } from '../services/googlePlaces';
import { DEFAULT_SEARCH_RADIUS_KM, hasGoogleMapsKey } from '../config/env';
import type { RootStackParamList } from '../navigation/types';
import { propertiesApi } from '../api/singleton';
import type { PropertyResponse } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { colors, radius, spacing } from '../theme';
import {
  applyPropertySearch,
  countActiveFilters,
  defaultSearchFilters,
  type PropertySearchFilters,
} from '../utils/propertySearchFilters';
import { isOwnerRole, isUserRole } from '../utils/roles';
import { useScrollCompactHeader } from '../hooks/useScrollCompactHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const listRef = useRef<FlatListType<PropertyResponse>>(null);
  const [items, setItems] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [filters, setFilters] = useState<PropertySearchFilters>(defaultSearchFilters);
  const [viewMode, setViewMode] = useState<SearchViewMode>('list');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const { compactHeaderVisible, onScroll, resetCompactHeader } =
    useScrollCompactHeader();

  const load = useCallback(
    async (place?: SelectedPlace | null) => {
      setError(null);
      try {
        const geo = place !== undefined ? place : selectedPlace;
        const data = await propertiesApi.list(
          geo
            ? {
                latitude: geo.latitude,
                longitude: geo.longitude,
                radiusKm: DEFAULT_SEARCH_RADIUS_KM,
              }
            : undefined
        );
        setItems(data);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Could not load listings';
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedPlace]
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  function handlePlaceSelected(place: SelectedPlace | null) {
    setSelectedPlace(place);
    setLoading(true);
    load(place);
  }

  function clearSearchAndFilters() {
    setSearchText('');
    setSelectedPlace(null);
    setFilters(defaultSearchFilters());
    setFiltersExpanded(false);
    resetCompactHeader();
    setLoading(true);
    load(null);
  }

  function handleViewModeChange(mode: SearchViewMode) {
    setViewMode(mode);
    if (mode === 'map') {
      resetCompactHeader();
    }
  }

  function scrollToSearchTop(expandFilters = false) {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    resetCompactHeader();
    if (expandFilters) {
      setFiltersExpanded(true);
    }
  }

  const filtered = useMemo(
    () => applyPropertySearch(items, filters, searchText),
    [items, filters, searchText]
  );

  const activeFilterCount = countActiveFilters(filters);
  const isOwner = isOwnerRole(profile?.role);
  const showPlan = isUserRole(profile?.role);

  const openPlans = useCallback(() => {
    navigation.navigate('EssentialService');
  }, [navigation]);

  function openProperty(item: PropertyResponse) {
    navigation.navigate('PropertyDetails', {
      propertyId: item.id,
      title: item.title,
    });
  }

  const goOwnerDashboard = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'OwnerDashboard' }],
    });
  }, [navigation]);

  const listHeader = useMemo(
    () => (
      <PropertySearchPanel
        searchText={searchText}
        onSearchTextChange={setSearchText}
        selectedPlace={selectedPlace}
        onPlaceSelected={handlePlaceSelected}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filtered.length}
        totalLoaded={items.length}
        onClearAll={clearSearchAndFilters}
        showOwnerLink={isOwner}
        onOwnerDashboard={isOwner ? goOwnerDashboard : undefined}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        filtersExpanded={filtersExpanded}
        onFiltersExpandedChange={setFiltersExpanded}
        embedded
        hideViewToggle
      />
    ),
    [
      searchText,
      selectedPlace,
      filters,
      filtered.length,
      items.length,
      isOwner,
      viewMode,
      filtersExpanded,
      goOwnerDashboard,
      handlePlaceSelected,
      clearSearchAndFilters,
      handleViewModeChange,
    ]
  );

  const mapSearchPanel = (
    <PropertySearchPanel
      searchText={searchText}
      onSearchTextChange={setSearchText}
      selectedPlace={selectedPlace}
      onPlaceSelected={handlePlaceSelected}
      filters={filters}
      onFiltersChange={setFilters}
      resultCount={filtered.length}
      totalLoaded={items.length}
      onClearAll={clearSearchAndFilters}
      showOwnerLink={isOwner}
      onOwnerDashboard={isOwner ? goOwnerDashboard : undefined}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      filtersExpanded={filtersExpanded}
      onFiltersExpandedChange={setFiltersExpanded}
      hideViewToggle
    />
  );

  const viewToggleBar = (
    <View style={styles.viewBar}>
      <View style={styles.viewBarToggle}>
        <SearchViewToggle
          mode={viewMode}
          onChange={handleViewModeChange}
          mapDisabled={!hasGoogleMapsKey()}
          compact
        />
      </View>
      <BuildersNavButton onPress={() => navigation.navigate('BuilderProjects')} />
      {showPlan ? <PlanTopButton onPress={openPlans} /> : null}
    </View>
  );

  return (
    <AuthenticatedScreenLayout>
      <View style={styles.wrap}>
        {viewToggleBar}

        {viewMode === 'list' && compactHeaderVisible ? (
          <PropertySearchStickyBar
            searchText={searchText}
            selectedPlace={selectedPlace}
            resultCount={filtered.length}
            activeFilterCount={activeFilterCount}
            onPressSearch={() => scrollToSearchTop(false)}
            onPressFilters={() => scrollToSearchTop(true)}
            showPlanButton={showPlan}
            onPressPlan={openPlans}
          />
        ) : null}

        {viewMode === 'map' ? (
          <View style={styles.mapWrap}>
            {mapSearchPanel}
            {loading && items.length === 0 ? (
              <BrandLoading message="Loading homes…" />
            ) : error ? (
              <View style={styles.centered}>
                <Text style={styles.errTitle}>Could not load listings</Text>
                <Text style={styles.err}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={() => load()}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <PropertySearchMap
                properties={filtered}
                selectedPlace={selectedPlace}
                onPropertyPress={openProperty}
              />
            )}
          </View>
        ) : loading && items.length === 0 ? (
          <BrandLoading message="Loading homes…" />
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errTitle}>Could not load listings</Text>
            <Text style={styles.err}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            ListHeaderComponent={listHeader}
            stickyHeaderIndices={undefined}
            onScroll={onScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={
              <SearchEmptyState onClearFilters={clearSearchAndFilters} />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
                tintColor="#0d9488"
                colors={['#0d9488']}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              filtered.length === 0 && styles.listEmpty,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <PropertyListCard item={item} onPress={() => openProperty(item)} />
            )}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    overflow: 'visible',
  },
  mapWrap: {
    flex: 1,
    overflow: 'visible',
  },
  viewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 30,
  },
  viewBarToggle: {
    flex: 1,
    minWidth: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  listEmpty: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  err: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: '#0d9488',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 15,
  },
});
