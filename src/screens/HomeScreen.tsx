import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  View,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
  type FlatList as FlatListType,
} from 'react-native';
import { AnimatedFlatList } from '../components/ui/AnimatedFlatList';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyListCard } from '../components/property/PropertyListCard';
import { PropertyListSkeletonGroup } from '../components/property/PropertyListCardSkeleton';
import { BrandLoading } from '../components/ui/BrandLoading';
import { ScrollChromeBar } from '../components/ui/ScrollChromeBar';
import { QuickFilterChips } from '../components/search/QuickFilterChips';
import { getFloatingRailHeight } from '../components/layout/FloatingSupportChat';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { HomeSearchToolbar } from '../components/search/HomeSearchToolbar';
import { PropertySearchStickyBar } from '../components/search/PropertySearchStickyBar';
import { PropertySearchMap } from '../components/search/PropertySearchMap';
import { PropertyFiltersSheet } from '../components/search/PropertyFiltersSheet';
import { SearchEmptyState } from '../components/search/SearchEmptyState';
import type { SearchViewMode } from '../components/search/SearchViewToggle';
import type { SelectedPlace } from '../services/googlePlaces';
import { BUILDER_PORTAL_ENABLED } from '../config/env';
import type { RootStackParamList } from '../navigation/types';
import { aiApi, favoritesApi, propertiesApi } from '../api/singleton';
import { primeCardIntelligenceCache } from '../hooks/useListingCardIntelligence';
import { getCachedFavorite, subscribeToFavorites } from '../state/favoritesStore';
import type { PropertyResponse } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { useUserLocation } from '../hooks/useUserLocation';
import {
  listingGeoBannerText,
  listingGeoQuery,
  resolveListingGeoAnchor,
} from '../utils/listingGeo';
import { colors, gradients, radius, spacing } from '../theme';
import {
  applyPropertySearch,
  countActiveFilters,
  defaultSearchFilters,
  RENT_PRESETS,
  type ListingTypeFilter,
  type PropertySearchFilters,
} from '../utils/propertySearchFilters';
import { isOwnerRole, isUserRole } from '../utils/roles';
import { useAuthenticatedScroll, useRegisterScrollToTop } from '../context/AuthenticatedScrollContext';
import { useResponsiveLayout } from '../utils/responsive';
import { useTranslation } from '../context/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen(props: Props) {
  return (
    <AuthenticatedScreenLayout headerDensity="compact">
      <HomeScreenContent {...props} />
    </AuthenticatedScreenLayout>
  );
}

function HomeScreenContent({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
  const [filtersSheetVisible, setFiltersSheetVisible] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(360);
  const [aiScores, setAiScores] = useState<Map<number, number>>(new Map());
  const [serverFavIds, setServerFavIds] = useState<Set<number>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const { location: userLocation, refresh: refreshUserLocation } = useUserLocation();
  const { scrollY, goToTopVisible, onScroll, resetCompactHeader } =
    useAuthenticatedScroll();
  const { listColumns, contentMaxWidth, horizontalPad } = useResponsiveLayout();

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    resetCompactHeader();
  }, [resetCompactHeader]);

  /** Matches AuthenticatedScreenLayout legalFooterInset when showLegalFooter is true */
  const legalFooterHeight = 52;

  const geoAnchor = useMemo(
    () => resolveListingGeoAnchor(selectedPlace, userLocation),
    [selectedPlace, userLocation]
  );

  const mapCenter = useMemo(
    () =>
      geoAnchor.kind === 'gps' && !selectedPlace
        ? { latitude: geoAnchor.latitude, longitude: geoAnchor.longitude }
        : null,
    [geoAnchor, selectedPlace]
  );

  const load = useCallback(
    async (place?: SelectedPlace | null) => {
      setError(null);
      try {
        const anchor = resolveListingGeoAnchor(
          place !== undefined ? place : selectedPlace,
          userLocation
        );
        const data = await propertiesApi.list(listingGeoQuery(anchor));
        setItems(data);
        // Saved/favorited listings are pinned to the top of the results.
        favoritesApi
          .list()
          .then((favs) =>
            setServerFavIds(
              new Set(
                favs
                  .filter((f) => f.resourceType === 'PropertyListing')
                  .map((f) => f.resourceId)
              )
            )
          )
          .catch(() => {
            /* guests / not signed in — no favorites to pin */
          });
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : t('home.errorTitle');
        setError(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedPlace, userLocation]
  );

  useFocusEffect(
    useCallback(() => {
      void refreshUserLocation();
    }, [refreshUserLocation])
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Keep the pinned-favorites set in sync with server + live toggles on cards.
  useEffect(() => {
    function recompute() {
      const next = new Set<number>();
      for (const it of items) {
        const cached = getCachedFavorite('PropertyListing', it.id);
        const fav = cached ? cached.isFavorite : serverFavIds.has(it.id);
        if (fav) next.add(it.id);
      }
      setFavoriteIds(next);
    }
    recompute();
    return subscribeToFavorites(recompute);
  }, [items, serverFavIds]);

  function handlePlaceSelected(place: SelectedPlace | null) {
    setSelectedPlace(place);
    setLoading(true);
    load(place);
  }

  function clearSearchAndFilters() {
    setSearchText('');
    setSelectedPlace(null);
    setFilters(defaultSearchFilters());
    setFiltersSheetVisible(false);
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

  const filtered = useMemo(
    () => applyPropertySearch(items, filters, searchText, aiScores, favoriteIds),
    [items, filters, searchText, aiScores, favoriteIds]
  );

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id);
    let cancelled = false;
    aiApi
      .cardIntelligence(ids)
      .then((res) => {
        if (cancelled) return;
        primeCardIntelligenceCache(res.items);
        setAiScores((prev) => {
          const next = new Map(prev);
          res.items.forEach((it) => next.set(it.listingId, it.card.investmentScore));
          return next;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [items]);

  const showScrollToTopFab =
    viewMode === 'list' && !loading && !error && filtered.length > 0 && goToTopVisible;

  useRegisterScrollToTop(
    viewMode === 'list' && !loading && !error && filtered.length > 0
      ? { visible: goToTopVisible, onPress: scrollToTop }
      : undefined
  );

  const listBottomInset =
    Math.max(insets.bottom, spacing.sm) +
    spacing.lg +
    getFloatingRailHeight(showScrollToTopFab) +
    legalFooterHeight;

  const activeFilterCount = countActiveFilters(filters);
  const isOwner = isOwnerRole(profile?.role);
  const showPlan = isUserRole(profile?.role);

  const openPlans = useCallback(() => {
    navigation.navigate('EssentialService');
  }, [navigation]);

  const openBuilders = useCallback(() => {
    navigation.navigate('BuilderProjects');
  }, [navigation]);

  const handleAiSearch = useCallback(async () => {
    const query = searchText.trim();
    if (!query) {
      Alert.alert(t('home.typeSearchFirst'), t('home.typeSearchExample'));
      return;
    }
    setAiSearching(true);
    try {
      const res = await aiApi.parseSearch(query);

      const nextListingType: ListingTypeFilter =
        res.listingType?.toLowerCase() === 'rent'
          ? 'rent'
          : res.listingType?.toLowerCase() === 'sale'
            ? 'sale'
            : res.listingType?.toLowerCase() === 'pg'
              ? 'pg'
              : filters.listingType;

      const budget = res.rentBudgetMax ?? res.saleBudgetMax ?? null;
      const nextRentPreset =
        budget != null
          ? RENT_PRESETS.find((p) => p.max != null && budget <= p.max)?.key ??
            RENT_PRESETS[RENT_PRESETS.length - 1].key
          : filters.rentPreset;

      setFilters({
        ...filters,
        listingType: nextListingType,
        bhk: res.bhk ? [res.bhk] : filters.bhk,
        rentPreset: nextRentPreset,
      });
      setSearchText(res.location ?? '');

      if (res.displayLines.length > 0) {
        Alert.alert(t('home.aiSearchApplied'), res.displayLines.join('\n'));
      }
    } catch (e) {
      Alert.alert(
        t('home.aiSearchUnavailable'),
        e instanceof ApiError ? e.message : t('home.aiSearchFailed')
      );
    } finally {
      setAiSearching(false);
    }
  }, [searchText, filters]);

  const openFilters = useCallback(() => {
    setFiltersSheetVisible(true);
  }, []);

  function openProperty(item: PropertyResponse) {
    navigation.navigate('PropertyDetails', {
      propertyId: item.id,
      title: item.title,
      listingSource: item.isPostedByAgent ? 'agent' : 'property',
    });
  }

  const goOwnerDashboard = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'OwnerDashboard' }],
    });
  }, [navigation]);

  const clearPlaceSearch = useCallback(() => {
    handlePlaceSelected(null);
  }, [handlePlaceSelected]);

  const stickyRevealAt = Math.max(140, toolbarHeight - 12);

  const listHeader = useMemo(() => {
    const showGeoBanner = geoAnchor.kind === 'place' || geoAnchor.kind === 'gps';
    const placeBanner = !showGeoBanner ? null : (
      <LinearGradient
        colors={['#ecfdf5', '#f0fdfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.placeBanner}
      >
        <View style={styles.placeBannerIcon}>
          <Ionicons
            name={geoAnchor.kind === 'gps' ? 'navigate' : 'location'}
            size={16}
            color={colors.tealDark}
          />
        </View>
        <Text style={styles.placeBannerText} numberOfLines={2}>
          {listingGeoBannerText(geoAnchor)}
        </Text>
        {geoAnchor.kind === 'place' ? (
          <Pressable
            onPress={clearPlaceSearch}
            hitSlop={8}
            accessibilityLabel={t('home.clearAreaA11y')}
            style={styles.placeBannerClose}
          >
            <Ionicons name="close" size={16} color={colors.tealDark} />
          </Pressable>
        ) : null}
      </LinearGradient>
    );

    return (
      <View style={styles.listHeaderRoot}>
        <View
          style={styles.searchAutocompleteLayer}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - toolbarHeight) > 2) {
              setToolbarHeight(h);
            }
          }}
        >
          <HomeSearchToolbar
            searchText={searchText}
            onSearchTextChange={setSearchText}
            selectedPlace={selectedPlace}
            geoAnchor={geoAnchor}
            onPlaceSelected={handlePlaceSelected}
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={filtered.length}
            totalLoaded={items.length}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            activeFilterCount={activeFilterCount}
            onOpenFilters={openFilters}
            onAiSearch={handleAiSearch}
            aiSearching={aiSearching}
            onOpenBuilders={BUILDER_PORTAL_ENABLED ? openBuilders : undefined}
            showPlan={showPlan}
            onOpenPlan={openPlans}
            showOwnerLink={isOwner}
            onOwnerDashboard={isOwner ? goOwnerDashboard : undefined}
          />
        </View>
        {placeBanner}
        <View style={styles.filterChipsLayer}>
          <QuickFilterChips filters={filters} onFiltersChange={setFilters} />
        </View>
      </View>
    );
  }, [
    geoAnchor,
    selectedPlace,
    clearPlaceSearch,
    toolbarHeight,
    searchText,
    handlePlaceSelected,
    filters,
    filtered.length,
    items.length,
    viewMode,
    handleViewModeChange,
    activeFilterCount,
    openFilters,
    handleAiSearch,
    aiSearching,
    openBuilders,
    showPlan,
    openPlans,
    isOwner,
    goOwnerDashboard,
  ]);

  return (
    <LinearGradient
        colors={[...gradients.page]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.wrap}
      >
        {viewMode === 'list' ? (
          <ScrollChromeBar scrollY={scrollY} revealAt={stickyRevealAt} overlay>
            <PropertySearchStickyBar
              searchText={searchText}
              selectedPlace={selectedPlace}
              nearYou={geoAnchor.kind === 'gps'}
              resultCount={filtered.length}
              activeFilterCount={activeFilterCount}
              onPressSearch={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
              onPressFilters={openFilters}
              showPlanButton={showPlan}
              onPressPlan={openPlans}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
            <View style={styles.stickyChipsWrap}>
              <QuickFilterChips filters={filters} onFiltersChange={setFilters} compact />
            </View>
          </ScrollChromeBar>
        ) : null}

        {viewMode === 'map' ? (
          <View style={styles.mapWrap}>
            {loading && items.length === 0 ? (
              <BrandLoading message={t('home.loading')} />
            ) : error ? (
              <View style={styles.centered}>
                <Text style={styles.errTitle}>{t('home.errorTitle')}</Text>
                <Text style={styles.err}>{error}</Text>
                <Pressable style={styles.retryBtn} onPress={() => load()}>
                  <Text style={styles.retryText}>{t('shared.tryAgain')}</Text>
                </Pressable>
              </View>
            ) : (
              <PropertySearchMap
                properties={filtered}
                selectedPlace={selectedPlace}
                mapCenter={mapCenter}
                onPropertyPress={openProperty}
              />
            )}

            {/* Map mode hides the sticky bar — give an explicit way back to the list. */}
            <Pressable
              style={[styles.mapBackBtn, { top: insets.top + spacing.sm }]}
              onPress={() => handleViewModeChange('list')}
              accessibilityRole="button"
              accessibilityLabel={t('home.mapBackA11y')}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={20} color={colors.navy} />
              <Text style={styles.mapBackText}>{t('common.list')}</Text>
            </Pressable>
          </View>
        ) : loading && items.length === 0 ? (
          <View
            style={[
              styles.listContent,
              { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%', paddingHorizontal: horizontalPad },
            ]}
          >
            <PropertyListSkeletonGroup count={4} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errTitle}>{t('home.errorTitle')}</Text>
            <Text style={styles.err}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryText}>{t('shared.tryAgain')}</Text>
            </Pressable>
          </View>
        ) : (
          <AnimatedFlatList
            ref={listRef}
            data={filtered}
            key={listColumns}
            numColumns={listColumns}
            keyExtractor={(item) => String(item.id)}
            columnWrapperStyle={listColumns > 1 ? styles.listRow : undefined}
            ListHeaderComponent={listHeader}
            onScroll={onScroll}
            scrollEventThrottle={16}
            bounces
            decelerationRate="normal"
            initialNumToRender={5}
            maxToRenderPerBatch={6}
            updateCellsBatchingPeriod={60}
            windowSize={7}
            removeClippedSubviews
            ListEmptyComponent={
              <SearchEmptyState onClearFilters={clearSearchAndFilters} />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void refreshUserLocation().then(() => load());
                }}
                tintColor="#0d9488"
                colors={['#0d9488']}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
              filtered.length === 0 && styles.listEmpty,
              {
                paddingHorizontal: horizontalPad,
                paddingBottom: listBottomInset,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View style={listColumns > 1 ? styles.listCell : undefined}>
                <PropertyListCard item={item} onPress={() => openProperty(item)} />
              </View>
            )}
          />
        )}

        <PropertyFiltersSheet
          visible={filtersSheetVisible}
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setFiltersSheetVisible(false)}
          onClearAll={() => setFilters(defaultSearchFilters())}
          resultCount={filtered.length}
        />
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: 'relative',
  },
  listHeaderRoot: {
    overflow: 'visible',
  },
  searchAutocompleteLayer: {
    zIndex: 50,
    elevation: 50,
    overflow: 'visible',
  },
  filterChipsLayer: {
    zIndex: 1,
    elevation: 0,
  },
  mapWrap: {
    flex: 1,
  },
  mapBackBtn: {
    position: 'absolute',
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 10,
  },
  mapBackText: { fontSize: 14, fontWeight: '700', color: colors.navy },
  stickyChipsWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  placeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.tealBorder,
    overflow: 'hidden',
  },
  placeBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeBannerClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 18,
  },
  placeBannerBold: {
    fontWeight: '800',
    color: '#0f766e',
  },
  listContent: {
    paddingTop: spacing.xs,
  },
  listRow: {
    gap: spacing.md,
  },
  listCell: {
    flex: 1,
    minWidth: 0,
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
