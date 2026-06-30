import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import { useTranslation } from '../context/LocaleContext';
import type { TranslateFn } from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerDashboard'>;

function ownerFilterLabel(t: TranslateFn, key: OwnerListFilter): string {
  switch (key) {
    case 'all':
      return t('shared.all');
    case 'approved':
      return t('statusLabels.approved');
    case 'pending':
      return t('statusLabels.pending');
    case 'rejected':
      return t('statusLabels.rejected');
    case 'needs-reply':
      return t('owner.filterNeedsReply');
    case 'rented':
      return t('owner.rented');
    case 'sold':
      return t('owner.filterSold');
    case 'expired':
      return t('owner.filterExpired');
    default:
      return key;
  }
}

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
  const { t } = useTranslation();
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
        setError(t('owner.ownerOnly'));
      } else {
        setError(e instanceof ApiError ? e.message : t('owner.couldNotLoadDashboard'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

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
          message: readApiMessage(res) || t('owner.unitStatusUpdated'),
          variant: 'success',
        });
      } catch (e) {
        patchListing(item.id, previous);
        showToast({
          message: e instanceof ApiError ? e.message : t('owner.couldNotUpdateUnit'),
          variant: 'error',
        });
        throw e;
      }
    },
    [patchListing, showToast, t]
  );

  const handleHideToggle = useCallback(
    async (item: OwnerDashboardItem, hidden: boolean) => {
      const previousHidden = item.isHiddenFromSearch === true;
      patchListing(item.id, { isHiddenFromSearch: hidden });
      try {
        const res = await propertiesApi.setOwnerHideFromSearch(item.id, hidden);
        patchListing(item.id, { isHiddenFromSearch: readApiHidden(res) });
        showToast({
          message:
            readApiMessage(res) ||
            (hidden ? t('owner.hiddenFromSearch') : t('owner.visibleInSearch')),
          variant: 'success',
        });
      } catch (e) {
        patchListing(item.id, { isHiddenFromSearch: previousHidden });
        showToast({
          message: e instanceof ApiError ? e.message : t('owner.couldNotUpdateVisibility'),
          variant: 'error',
        });
        throw e;
      }
    },
    [patchListing, showToast, t]
  );

  const handleDelete = useCallback(
    async (item: OwnerDashboardItem) => {
      try {
        const res = await propertiesApi.deleteOwnerListing(item.id);
        setRows((prev) => prev.filter((row) => row.id !== item.id));
        showToast({
          message: readApiMessage(res) || t('owner.listingDeleted'),
          variant: 'success',
        });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t('owner.couldNotDelete'),
          variant: 'error',
        });
        throw e;
      }
    },
    [showToast, t]
  );

  const handleVerifyAvailability = useCallback(
    (item: OwnerDashboardItem) =>
      new Promise<void>((resolve, reject) => {
        Alert.alert(
          t('owner.verifyAvailability'),
          t('owner.verifyPrompt', { title: item.title }),
          [
            { text: t('common.cancel'), style: 'cancel', onPress: () => reject(new Error('cancelled')) },
            {
              text: t('owner.stillAvailable'),
              onPress: async () => {
                try {
                  const res = await propertiesApi.verifyPropertyAvailability(item.id, 'AVAILABLE');
                  patchListing(item.id, {
                    availabilityVerificationStatus: 'VERIFIED',
                    autoHidden: false,
                    isHiddenFromSearch: false,
                    lastVerifiedAtUtc: new Date().toISOString(),
                  });
                  showToast({ message: res.message, variant: 'success' });
                  resolve();
                } catch (e) {
                  showToast({
                    message: e instanceof ApiError ? e.message : t('owner.couldNotVerify'),
                    variant: 'error',
                  });
                  reject(e);
                }
              },
            },
            {
              text: t('owner.sold'),
              onPress: async () => {
                try {
                  const res = await propertiesApi.verifyPropertyAvailability(item.id, 'SOLD');
                  patchListing(item.id, {
                    availabilityVerificationStatus: 'SOLD',
                    isHiddenFromSearch: true,
                    ownerAvailabilityOutcome: 'Sold',
                  });
                  showToast({ message: res.message, variant: 'success' });
                  resolve();
                } catch (e) {
                  showToast({
                    message: e instanceof ApiError ? e.message : t('owner.couldNotUpdate'),
                    variant: 'error',
                  });
                  reject(e);
                }
              },
            },
            {
              text: t('owner.rented'),
              onPress: async () => {
                try {
                  const res = await propertiesApi.verifyPropertyAvailability(item.id, 'RENTED');
                  patchListing(item.id, {
                    availabilityVerificationStatus: 'RENTED',
                    isHiddenFromSearch: true,
                    ownerAvailabilityOutcome: 'Rented',
                  });
                  showToast({ message: res.message, variant: 'success' });
                  resolve();
                } catch (e) {
                  showToast({
                    message: e instanceof ApiError ? e.message : t('owner.couldNotUpdate'),
                    variant: 'error',
                  });
                  reject(e);
                }
              },
            },
          ]
        );
      }),
    [patchListing, showToast, t]
  );

  const handleResubmit = useCallback(
    async (item: OwnerDashboardItem) => {
      try {
        const res = await propertiesApi.resubmitForReview(item.id);
        patchListing(item.id, { reviewStatus: res.reviewStatus, verificationDetail: null });
        showToast({ message: res.message || t('owner.resubmitted'), variant: 'success' });
      } catch (e) {
        showToast({
          message: e instanceof ApiError ? e.message : t('owner.couldNotResubmit'),
          variant: 'error',
        });
        throw e;
      }
    },
    [patchListing, showToast, t]
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
      <BrandLoading message={t('shared.loading')} />
    );
  }

  const filterLabel = ownerFilterLabel(t, listFilter);

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

      <Text style={styles.sectionTitle}>{t('owner.yourListings')}</Text>
      <Text style={styles.sectionSub}>{t('owner.sectionSub')}</Text>

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
              {ownerFilterLabel(t, f.key)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>
        {filtered.length}{' '}
        {filtered.length === 1 ? t('owner.listing') : t('owner.listings')}
        {listFilter !== 'all' ? t('owner.inThisView') : ''}
      </Text>
    </View>
  );

  return (
    <View style={[styles.wrap, scrollLinkedHostStyle]}>
      <ScrollChromeBar scrollY={scrollY} revealAt={220} overlay>
        <DashboardCompactBar
          title={t('owner.dashboard')}
          subtitle={t('owner.compactSubtitle', {
            count: filtered.length,
            filter: filterLabel,
          })}
          onPress={scrollToTop}
        />
      </ScrollChromeBar>

      {loading && rows.length === 0 ? (
        <BrandLoading message={t('owner.loading')} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errTitle}>{t('owner.unavailable')}</Text>
          <Text style={styles.err}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => load()}>
            <Text style={styles.retryText}>{t('shared.tryAgain')}</Text>
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
                  ? t('owner.noListings')
                  : t('owner.nothingInFilter')}
              </Text>
              <Text style={styles.empty}>
                {listFilter === 'all'
                  ? t('owner.emptyAll')
                  : t('owner.emptyFilter')}
              </Text>
              {listFilter === 'all' ? (
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('PostProperty')}
                >
                  <Text style={styles.emptyBtnText}>{t('shared.postProperty')}</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.emptyBtnText}>{t('owner.browseMarket')}</Text>
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
              onVerifyAvailability={() => handleVerifyAvailability(item)}
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
