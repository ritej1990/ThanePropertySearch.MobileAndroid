import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
  ScrollView,
  type FlatList as FlatListType,
} from 'react-native';
import { AnimatedFlatList } from '../components/ui/AnimatedFlatList';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type {
  OwnerAvailabilityOutcome,
  OwnerDashboardItem,
  OwnerListingSummary,
} from '../api/ownerTypes';
import {
  readApiHidden,
  readApiMessage,
  readApiOutcome,
} from '../api/normalizeOwnerDashboard';
import { paymentsApi, propertiesApi } from '../api/singleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { DashboardCompactBar } from '../components/layout/DashboardCompactBar';
import { useListScrollChrome, useScrollCollapseEligibility } from '../hooks/useListScrollChrome';
import { BrandLoading } from '../components/ui/BrandLoading';
import { ScrollChromeBar } from '../components/ui/ScrollChromeBar';
import { scrollLinkedHostStyle } from '../components/ui/ScrollLinkedOverlay';
import { OwnerDashboardHeader } from '../components/owner/OwnerDashboardHeader';
import { OwnerListingCard } from '../components/owner/OwnerListingCard';
import { OwnerListingPlanCard } from '../components/owner/OwnerListingPlanCard';
import { colors, gradients, radius, spacing } from '../theme';
import {
  OWNER_LIST_FILTERS,
  computeOwnerStats,
  filterOwnerListings,
  type OwnerListFilter,
} from '../utils/ownerDashboard';
import { isOwnerRole } from '../utils/roles';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerDashboard'>;

export default function OwnerDashboardScreen(props: Props) {
  return (
    <AuthenticatedScreenLayout headerDensity="compact">
      <OwnerDashboardContent {...props} />
    </AuthenticatedScreenLayout>
  );
}

function OwnerDashboardContent({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatListType<OwnerDashboardItem>>(null);
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState<OwnerDashboardItem[]>([]);
  const [planSummary, setPlanSummary] = useState<OwnerListingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<OwnerListFilter>('all');

  const isOwner = isOwnerRole(profile?.role);

  useEffect(() => {
    if (!isOwner) {
      navigation.replace('Home');
    }
  }, [isOwner, navigation]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await propertiesApi.ownerDashboard();
      setRows(data);
      paymentsApi
        .getOwnerListingSummary()
        .then(setPlanSummary)
        .catch(() => setPlanSummary(null));
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError('Owner access only. Sign in with an owner account.');
      } else {
        setError(e instanceof ApiError ? e.message : 'Could not load dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isOwner) return;
      setLoading(true);
      load();
    }, [load, isOwner])
  );

  const stats = useMemo(() => computeOwnerStats(rows), [rows]);

  const filtered = useMemo(
    () => filterOwnerListings(rows, listFilter),
    [rows, listFilter]
  );

  const { canCollapse, bindScrollMetrics } = useScrollCollapseEligibility();
  const { scrollY, onScroll, scrollToTop } = useListScrollChrome({
    scrollRef: listRef,
    scrollToTopActive: filtered.length > 0,
    collapseEnabled: canCollapse && filtered.length > 0,
  });

  const patchListing = useCallback((id: number, patch: Partial<OwnerDashboardItem>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }, []);

  const handleOutcomeChange = useCallback(
    async (item: OwnerDashboardItem, outcome: OwnerAvailabilityOutcome) => {
      const previous = {
        ownerAvailabilityOutcome: item.ownerAvailabilityOutcome ?? null,
        isHiddenFromSearch: item.isHiddenFromSearch === true,
      };
      const optimisticOutcome = outcome || null;
      patchListing(item.id, {
        ownerAvailabilityOutcome: optimisticOutcome,
        isHiddenFromSearch: outcome ? previous.isHiddenFromSearch : false,
      });
      try {
        const res = await propertiesApi.setOwnerAvailabilityOutcome(item.id, optimisticOutcome);
        patchListing(item.id, {
          ownerAvailabilityOutcome: readApiOutcome(res) ?? optimisticOutcome,
          isHiddenFromSearch: outcome ? previous.isHiddenFromSearch : false,
        });
        showToast({
          message: readApiMessage(res) || 'Unit status updated',
          variant: 'success',
        });
      } catch (e) {
        patchListing(item.id, previous);
        showToast({
          message: e instanceof ApiError ? e.message : 'Could not update unit status',
          variant: 'error',
        });
        throw e;
      }
    },
    [patchListing, showToast]
  );

  const handleHideToggle = useCallback(
    async (item: OwnerDashboardItem, hidden: boolean) => {
      const previousHidden = item.isHiddenFromSearch === true;
      patchListing(item.id, { isHiddenFromSearch: hidden });
      try {
        const res = await propertiesApi.setOwnerHideFromSearch(item.id, hidden);
        patchListing(item.id, { isHiddenFromSearch: readApiHidden(res) });
        showToast({
          message: readApiMessage(res) || (hidden ? 'Hidden from search' : 'Visible in search'),
          variant: 'success',
        });
      } catch (e) {
        patchListing(item.id, { isHiddenFromSearch: previousHidden });
        showToast({
          message: e instanceof ApiError ? e.message : 'Could not update visibility',
          variant: 'error',
        });
        throw e;
      }
    },
    [patchListing, showToast]
  );

  const handleDelete = useCallback(
    async (item: OwnerDashboardItem) => {
      try {
        const res = await propertiesApi.deleteOwnerListing(item.id);
        setRows((prev) => prev.filter((row) => row.id !== item.id));
        showToast({
          message: readApiMessage(res) || 'Listing deleted',
          variant: 'success',
        });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : 'Could not delete listing',
          variant: 'error',
        });
        throw e;
      }
    },
    [showToast]
  );

  const handleResubmit = useCallback(
    async (item: OwnerDashboardItem) => {
      try {
        const res = await propertiesApi.resubmitForReview(item.id);
        patchListing(item.id, { reviewStatus: res.reviewStatus, verificationDetail: null });
        showToast({ message: res.message || 'Resubmitted for review', variant: 'success' });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : 'Could not resubmit',
          variant: 'error',
        });
        throw e;
      }
    },
    [patchListing, showToast]
  );

  const handleViewVisitRequests = useCallback(
    (item: OwnerDashboardItem) => {
      navigation.navigate('VisitRequests', { propertyId: item.id, title: item.title });
    },
    [navigation]
  );

  const handleViewClarification = useCallback(
    (ticketId: number) => {
      navigation.navigate('SupportTicketDetails', { ticketId });
    },
    [navigation]
  );

  if (!isOwner) {
    return (
      <BrandLoading message="Loading…" />
    );
  }

  const filterLabel =
    OWNER_LIST_FILTERS.find((f) => f.key === listFilter)?.label ?? 'All';

  const listHeader = (
    <View>
      <LinearGradient
        colors={[...gradients.page]}
        style={styles.bgGlow}
        pointerEvents="none"
      />

      <OwnerDashboardHeader
        stats={stats}
        onBrowse={() => navigation.navigate('Home')}
        onPostProperty={() => navigation.navigate('PostProperty')}
      />

      {planSummary ? <OwnerListingPlanCard summary={planSummary} /> : null}

      <Text style={styles.sectionTitle}>Your listings</Text>
      <Text style={styles.sectionSub}>
        Update unit status, hide from search, or delete — same as the web owner dashboard
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {OWNER_LIST_FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setListFilter(f.key)}
            style={[styles.filterChip, listFilter === f.key && styles.filterChipOn]}
          >
            <Text
              style={[
                styles.filterText,
                listFilter === f.key && styles.filterTextOn,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>
        {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'}
        {listFilter !== 'all' ? ' in this view' : ''}
      </Text>
    </View>
  );

  return (
    <View style={[styles.wrap, scrollLinkedHostStyle]}>
      <ScrollChromeBar scrollY={scrollY} revealAt={220} overlay>
        <DashboardCompactBar
          title="Owner dashboard"
          subtitle={`${filtered.length} listings · ${filterLabel}`}
          onPress={scrollToTop}
        />
      </ScrollChromeBar>

      {loading && rows.length === 0 ? (
        <BrandLoading message="Loading your dashboard…" />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errTitle}>Dashboard unavailable</Text>
          <Text style={styles.err}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => load()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <AnimatedFlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          {...bindScrollMetrics}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={canCollapse && filtered.length > 0}
          ListHeaderComponent={listHeader}
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
            styles.list,
            { paddingBottom: insets.bottom + spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyTitle}>
                {listFilter === 'all'
                  ? 'No listings yet'
                  : 'Nothing in this filter'}
              </Text>
              <Text style={styles.empty}>
                {listFilter === 'all'
                  ? 'Post your first property — it will appear here with inquiries and review status.'
                  : 'Try another filter or add more listings.'}
              </Text>
              {listFilter === 'all' ? (
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('PostProperty')}
                >
                  <Text style={styles.emptyBtnText}>Post property</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.emptyBtnText}>Browse Thane market</Text>
                </Pressable>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <OwnerListingCard
              item={item}
              onPress={() => {
                if (item.pendingRequests > 0) {
                  navigation.navigate('PropertyInquiries', {
                    propertyId: item.id,
                    title: item.title,
                  });
                  return;
                }
                navigation.navigate('PropertyDetails', {
                  propertyId: item.id,
                  title: item.title,
                });
              }}
              onOutcomeChange={(outcome) => handleOutcomeChange(item, outcome)}
              onHideToggle={(hidden) => handleHideToggle(item, hidden)}
              onDelete={() => handleDelete(item)}
              onResubmit={() => handleResubmit(item)}
              onViewVisitRequests={() => handleViewVisitRequests(item)}
              onViewClarification={handleViewClarification}
            />
          )}
        />
      )}
      </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  bgGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.slateLight,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingRight: spacing.md,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipOn: {
    backgroundColor: colors.navyMid,
    borderColor: colors.navyMid,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  filterTextOn: {
    color: colors.heroText,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slateLight,
    marginBottom: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.slateLight,
    fontSize: 15,
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
  retry: {
    backgroundColor: '#0d9488',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
  },
  emptyBox: {
    padding: spacing.xxxl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.md,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  empty: {
    textAlign: 'center',
    color: colors.slateLight,
    marginTop: spacing.sm,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: '#0d9488',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  emptyBtnText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 15,
  },
});
