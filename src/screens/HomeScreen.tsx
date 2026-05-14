import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { propertiesApi } from '../api/singleton';
import type { PropertyResponse } from '../api/types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { profile, logout } = useAuth();
  const [items, setItems] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await propertiesApi.list();
      setItems(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not load listings';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const isOwner = profile?.role === 'Owner';

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Text style={styles.hi} numberOfLines={1}>
          Hi, {profile?.fullName ?? 'there'}
        </Text>
        {isOwner ? (
          <Pressable
            style={styles.linkBtn}
            onPress={() => navigation.navigate('OwnerDashboard')}
          >
            <Text style={styles.linkText}>My listings</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.outlineBtn} onPress={() => logout()}>
          <Text style={styles.outlineText}>Sign out</Text>
        </Pressable>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.err}>{error}</Text>
          <Pressable style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
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
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate('PropertyDetails', {
                  propertyId: item.id,
                  title: item.title,
                })
              }
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]} />
              )}
              <View style={styles.cardBody}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.areaName}</Text>
                <Text style={styles.metaSmall}>
                  {item.isForRent ? `Rent ₹${item.rentAmount}` : ''}
                  {item.isForRent && item.isForSale ? ' · ' : ''}
                  {item.isForSale && item.sellPrice != null
                    ? `Sale ₹${item.sellPrice}`
                    : ''}
                </Text>
                <Text style={styles.status}>{item.reviewStatus}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f1f5f9' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  hi: { flex: 1, fontWeight: '600', color: '#0f172a' },
  linkBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  linkText: { color: '#2563eb', fontWeight: '600', fontSize: 13 },
  outlineBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
  },
  outlineText: { color: '#475569', fontWeight: '600', fontSize: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { color: '#b91c1c', textAlign: 'center', marginBottom: 12 },
  retry: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  listContent: { padding: 12, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumb: { width: 100, height: 100, backgroundColor: '#e2e8f0' },
  thumbPlaceholder: { backgroundColor: '#e2e8f0' },
  cardBody: { flex: 1, padding: 10, justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 16, color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 4, fontSize: 13 },
  metaSmall: { color: '#334155', marginTop: 2, fontSize: 12 },
  status: { marginTop: 6, fontSize: 11, color: '#64748b' },
});
