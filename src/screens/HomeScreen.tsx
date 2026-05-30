import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
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
import { BrandLoading } from '../components/ui/BrandLoading';
import { ScrollChromeBar } from '../components/ui/ScrollChromeBar';
import { getFloatingRailHeight } from '../components/layout/FloatingSupportChat';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { HomeSearchToolbar } from '../components/search/HomeSearchToolbar';
import { PropertySearchStickyBar } from '../components/search/PropertySearchStickyBar';
import { PropertySearchMap } from '../components/search/PropertySearchMap';
import { PropertyFiltersSheet } from '../components/search/PropertyFiltersSheet';
import { SearchEmptyState } from '../components/search/SearchEmptyState';
import type { SearchViewMode } from '../components/search/SearchViewToggle';
import type { SelectedPlace } from '../services/googlePlaces';
import { DEFAULT_SEARCH_RADIUS_KM } from '../config/env';
import type { RootStackParamList } from '../navigation/types';
import { propertiesApi } from '../api/singleton';
import type { PropertyResponse } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { colors, gradients, radius, spacing } from '../theme';
import {
  applyPropertySearch,
  countActiveFilters,
  defaultSearchFilters,
  type PropertySearchFilters,
} from '../utils/propertySearchFilters';
import { isOwnerRole, isUserRole } from '../utils/roles';
import { useAuthenticatedScroll, useRegisterScrollToTop } from '../context/AuthenticatedScrollContext';
import { useResponsiveLayout } from '../utils/responsive';

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
  const [toolbarHeight, setToolbarHeight] = useState(360);
  const { scrollY, goToTopVisible, onScroll, resetCompactHeader } =
    useAuthenticatedScroll();
  const { listColumns, contentMaxWidth, horizontalPad } = useResponsiveLayout();

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    resetCompactHeader();
  }, [resetCompactHeader]);

  /** Matches AuthenticatedScreenLayout legalFooterInset when showLegalFooter is true */
  const legalFooterHeight = 52;

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
    () => applyPropertySearch(items, filters, searchText),
    [items, filters, searchText]
  );

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
    const placeBanner = !selectedPlace ? null : (
      <LinearGradient
        colors={['#ecfdf5', '#f0fdfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.placeBanner}
      >
        <View style={styles.placeBannerIcon}>
          <Ionicons name="location" size={16} color={colors.tealDark} />
        </View>
        <Text style={styles.placeBannerText} numberOfLines={2}>
          Within {DEFAULT_SEARCH_RADIUS_KM} km of{' '}
          <Text style={styles.placeBannerBold}>{selectedPlace.label}</Text>
        </Text>
        <Pressable
          onPress={clearPlaceSearch}
          hitSlop={8}
          accessibilityLabel="Clear area search"
          style={styles.placeBannerClose}
        >
          <Ionicons name="close" size={16} color={colors.tealDark} />
        </Pressable>
      </LinearGradient>
    );

    return (
      <View>
        <View
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
            onPlaceSelected={handlePlaceSelected}
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={filtered.length}
            totalLoaded={items.length}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            activeFilterCount={activeFilterCount}
            onOpenFilters={openFilters}
            onOpenBuilders={openBuilders}
            showPlan={showPlan}
            onOpenPlan={openPlans}
            showOwnerLink={isOwner}
            onOwnerDashboard={isOwner ? goOwnerDashboard : undefined}
          />
        </View>
        {placeBanner}
      </View>
    );
  }, [
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
              resultCount={filtered.length}
              activeFilterCount={activeFilterCount}
              onPressSearch={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
              onPressFilters={openFilters}
              showPlanButton={showPlan}
              onPressPlan={openPlans}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </ScrollChromeBar>
        ) : null}

        {viewMode === 'map' ? (
          <View style={styles.mapWrap}>
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
  mapWrap: {
    flex: 1,
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
