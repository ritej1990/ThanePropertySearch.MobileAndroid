import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { propertiesApi } from '../api/singleton';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

type DashRow = {
  id: number;
  title: string;
  areaName: string;
  reviewStatus: string;
  ownerListingTier: string | null;
  listingDurationDays: number;
  listingPeriodEndUtc: string | null;
  isFeaturedInSearch: boolean;
  daysRemaining: number | null;
  totalRequests: number;
  pendingRequests: number;
};

type Props = NativeStackScreenProps<RootStackParamList, 'OwnerDashboard'>;

export default function OwnerDashboardScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [rows, setRows] = useState<DashRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await propertiesApi.ownerDashboard();
      setRows(data as DashRow[]);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError('Owner access only. Sign in as an owner account.');
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
      if (profile?.role !== 'Owner') {
        setLoading(false);
        setError('Owner access only.');
        return;
      }
      setLoading(true);
      load();
    }, [load, profile?.role])
  );

  if (profile?.role !== 'Owner') {
    return (
      <View style={styles.centered}>
        <Text style={styles.err}>{error ?? 'Owner access only.'}</Text>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {loading && rows.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.err}>{error}</Text>
          <Pressable style={styles.back} onPress={load}>
            <Text style={styles.backText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No listings yet. Post from the website or add create flow in the app.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{item.areaName}</Text>
              <View style={styles.row}>
                <Text style={styles.badge}>{item.reviewStatus}</Text>
                {item.daysRemaining != null ? (
                  <Text style={styles.small}>Visible: {item.daysRemaining}d left</Text>
                ) : null}
              </View>
              <Text style={styles.small}>
                Requests: {item.pendingRequests} pending / {item.totalRequests} total
              </Text>
              {item.ownerListingTier ? (
                <Text style={styles.small}>Plan: {item.ownerListingTier}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f1f5f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { padding: 12, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: { fontWeight: '700', fontSize: 16, color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  small: { fontSize: 12, color: '#475569', marginTop: 4 },
  err: { color: '#b91c1c', textAlign: 'center', marginBottom: 12 },
  back: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24, paddingHorizontal: 16 },
});
