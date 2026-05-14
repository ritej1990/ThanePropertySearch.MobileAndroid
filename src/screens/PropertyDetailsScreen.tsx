import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { propertiesApi } from '../api/singleton';
import type { PropertyResponse } from '../api/types';
import { ApiError } from '../api/client';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyDetails'>;

export default function PropertyDetailsScreen({ route }: Props) {
  const { propertyId } = route.params;
  const [item, setItem] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await propertiesApi.getById(propertyId);
      setItem(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load property');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [propertyId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? 'Property not found'}</Text>
        <Pressable style={styles.retry} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const gallery = item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : [];

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
        {gallery.length > 0 ? (
          gallery.map((uri, index) => (
            <Image key={`${uri}-${index}`} source={{ uri }} style={styles.heroImage} />
          ))
        ) : (
          <View style={[styles.heroImage, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No image available</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.area}>{item.areaName}</Text>
        <Text style={styles.status}>{item.reviewStatus}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Rent</Text>
            <Text style={styles.infoValue}>₹{item.rentAmount}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Sale</Text>
            <Text style={styles.infoValue}>
              {item.sellPrice != null ? `₹${item.sellPrice}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Deposit</Text>
            <Text style={styles.infoValue}>₹{item.depositAmount}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Built-up</Text>
            <Text style={styles.infoValue}>{item.builtupSqft} sqft</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{item.description || 'No description provided.'}</Text>

        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.body}>{item.address}</Text>

        <Text style={styles.sectionTitle}>Listing type</Text>
        <Text style={styles.body}>
          {[
            item.isForRent ? 'Rent' : null,
            item.isForSale ? 'Sale' : null,
            item.isForPg ? 'PG' : null,
          ]
            .filter(Boolean)
            .join(' · ') || 'Not specified'}
        </Text>

        <Text style={styles.sectionTitle}>Owner</Text>
        <Text style={styles.body}>{item.ownerName}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 28 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  error: {
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  retry: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  gallery: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  heroImage: {
    width: 300,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#64748b',
    fontWeight: '600',
  },
  card: {
    marginTop: 14,
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  area: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 15,
  },
  status: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  infoBox: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#0f172a',
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 6,
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  body: {
    color: '#334155',
    lineHeight: 21,
  },
});
