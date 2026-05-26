import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type { OwnerDashboardItem } from '../api/ownerTypes';
import { propertiesApi } from '../api/singleton';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { OwnerDashboardHeader } from '../components/owner/OwnerDashboardHeader';
import { OwnerListingCard } from '../components/owner/OwnerListingCard';
import { colors, gradients, radius, spacing } from '../theme';
import { computeOwnerStats } from '../utils/ownerDashboard';
import { isOwnerRole } from '../utils/roles';

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerDashboard'>;
type ListFilter = 'all' | 'inquiries' | 'featured';

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: 'all', label: 'All listings' },
  { key: 'inquiries', label: 'Has inquiries' },
  { key: 'featured', label: 'Featured' },
];

export default function OwnerDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [rows, setRows] = useState<OwnerDashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<ListFilter>('all');

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

  const filtered = useMemo(() => {
    if (listFilter === 'inquiries') {
      return rows.filter((r) => r.pendingRequests > 0);
    }
    if (listFilter === 'featured') {
      return rows.filter((r) => r.isFeaturedInSearch);
    }
    return rows;
  }, [rows, listFilter]);

  if (!isOwner) {
    return (
      <BrandLoading message="Loading…" />
    );
  }

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
        onMyPayments={() => navigation.navigate('MyPayments', undefined)}
      />

      <Text style={styles.sectionTitle}>Your listings</Text>
      <Text style={styles.sectionSub}>
        Tap a listing to view details or open inquiries and chat in the app
      </Text>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
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
      </View>

      <Text style={styles.resultCount}>
        {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'}
        {listFilter !== 'all' ? ' in this view' : ''}
      </Text>
    </View>
  );

  return (
    <AuthenticatedScreenLayout>
      <View style={styles.wrap}>
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
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
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
            />
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
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
