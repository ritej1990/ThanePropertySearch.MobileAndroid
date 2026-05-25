import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { propertiesApi } from '../api/singleton';
import type { PropertyInquirySummary } from '../api/inquiryTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyInquiries'>;

function statusColors(status: string) {
  const s = status.toLowerCase();
  if (s === 'approved') return { bg: colors.successSoft, text: colors.success };
  if (s === 'rejected') return { bg: colors.errorSoft, text: colors.error };
  return { bg: colors.warningSoft, text: colors.warning };
}

export default function PropertyInquiriesScreen({ navigation, route }: Props) {
  const { propertyId, title } = route.params;
  const [rows, setRows] = useState<PropertyInquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await propertiesApi.getPropertyInquiries(propertyId);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function updateStatus(
    inquiryId: number,
    status: 'Approved' | 'Rejected'
  ) {
    setBusyId(inquiryId);
    try {
      const res = await propertiesApi.updateInquiryStatus(inquiryId, status);
      Alert.alert('Updated', res.message);
      await load();
    } catch (e) {
      Alert.alert(
        'Failed',
        e instanceof ApiError ? e.message : 'Could not update request'
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <View style={styles.wrap}>
        <View style={styles.pad}>
          <PageHero
            variant="owner"
            icon="mail-unread-outline"
            title="Property requests"
            subtitle={
              title
                ? `Inquiries for ${title}`
                : 'Approve requests to open chat with seekers.'
            }
          />
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message="Loading requests…" />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>No requests yet for this listing.</Text>
            }
            renderItem={({ item }) => {
              const st = statusColors(item.status);
              const pending = item.status.toLowerCase() === 'pending';
              return (
                <View style={styles.row}>
                  <Pressable
                    style={styles.rowMain}
                    onPress={() =>
                      navigation.navigate('PropertyChat', {
                        propertyId,
                        inquiryId: item.id,
                        title: item.requestBy,
                      })
                    }
                  >
                    <Text style={styles.rowTitle}>{item.requestBy}</Text>
                    <Text style={styles.rowMeta}>
                      {new Date(item.createdAtUtc).toLocaleDateString('en-IN')}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </Pressable>
                  {pending ? (
                    <View style={styles.actions}>
                      <Pressable
                        style={styles.approveBtn}
                        disabled={busyId != null}
                        onPress={() => updateStatus(item.id, 'Approved')}
                      >
                        <Text style={styles.approveText}>Approve</Text>
                      </Pressable>
                      <Pressable
                        style={styles.rejectBtn}
                        disabled={busyId != null}
                        onPress={() => updateStatus(item.id, 'Rejected')}
                      >
                        <Text style={styles.rejectText}>Reject</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.chatBtn}
                      onPress={() =>
                        navigation.navigate('PropertyChat', {
                          propertyId,
                          inquiryId: item.id,
                          title: item.requestBy,
                        })
                      }
                    >
                      <Text style={styles.chatBtnText}>Open chat</Text>
                    </Pressable>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  rowMain: { padding: spacing.lg },
  rowTitle: { fontSize: 16, fontWeight: '800', color: colors.navy },
  rowMeta: { fontSize: 13, color: colors.slateLight, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  approveText: { color: colors.heroText, fontWeight: '700' },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  rejectText: { color: colors.slateMuted, fontWeight: '700' },
  chatBtn: {
    padding: spacing.md,
    paddingTop: 0,
    alignItems: 'center',
  },
  chatBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  empty: { textAlign: 'center', color: colors.slateLight, marginTop: 40 },
});
