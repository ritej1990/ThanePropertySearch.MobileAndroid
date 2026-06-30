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
import { Ionicons } from '@expo/vector-icons';
import { propertiesApi } from '../api/singleton';
import type { VisitRequest } from '../api/visitTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useTranslation } from '../context/LocaleContext';
import type { TranslateFn } from '../i18n';
import { localeToCulture } from '../i18n/types';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VisitRequests'>;

function translateStatus(t: TranslateFn, status: string): string {
  const s = status.toLowerCase();
  if (s === 'approved') return t('statusLabels.approved');
  if (s === 'rejected') return t('statusLabels.rejected');
  if (s === 'pending') return t('statusLabels.pending');
  if (s === 'declined') return t('statusLabels.declined');
  return status;
}

function maskPhone(phone: string | null): string {
  if (!phone?.trim()) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 2) return '**';
  return digits.slice(0, 2) + 'X'.repeat(digits.length - 2);
}

function statusStyle(status: string) {
  const s = status.toLowerCase();
  if (s === 'approved') {
    return { bg: colors.successSoft, text: colors.success };
  }
  if (s === 'declined') {
    return { bg: colors.surfaceMuted, text: colors.slateMuted };
  }
  return { bg: colors.warningSoft, text: colors.warning };
}

export default function VisitRequestsScreen({ navigation, route }: Props) {
  const { propertyId, title } = route.params;
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await propertiesApi.getVisitRequests(propertyId);
      setRows(data);
    } catch (e) {
      Alert.alert(
        t('shared.couldNotLoad'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId, t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  async function setStatus(visitId: number, status: 'Approved' | 'Declined') {
    setBusyId(visitId);
    try {
      const res = await propertiesApi.updateVisitRequestStatus(
        propertyId,
        visitId,
        status
      );
      Alert.alert(t('shared.updated'), res.message);
      await load();
    } catch (e) {
      Alert.alert(
        t('shared.failed'),
        e instanceof ApiError ? e.message : t('visits.couldNotUpdate')
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
            icon="calendar-outline"
            title={t('visits.title')}
            subtitle={
              title
                ? t('visits.subtitleFor', { title })
                : t('visits.subtitle')
            }
          />
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message={t('visits.loading')} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="calendar-clear-outline" size={40} color={colors.slateLight} />
                <Text style={styles.emptyText}>{t('visits.empty')}</Text>
              </View>
            }
            renderItem={({ item }) => {
              const st = statusStyle(item.status);
              const pending = item.status.toLowerCase() === 'pending';
              return (
                <View style={styles.card}>
                  <View style={styles.cardHead}>
                    <Text style={styles.when}>
                      {new Date(item.visitAtLocal).toLocaleString(localeToCulture(locale), {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.text }]}>
                        {translateStatus(t, item.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.seeker}>{item.requestedBy}</Text>
                  <Text style={styles.phone}>📞 {maskPhone(item.phone)}</Text>
                  {item.message ? (
                    <Text style={styles.message}>{item.message}</Text>
                  ) : null}
                  {pending ? (
                    <View style={styles.actions}>
                      <Pressable
                        style={[styles.approveBtn, busyId === item.id && styles.busy]}
                        disabled={busyId != null}
                        onPress={() => setStatus(item.id, 'Approved')}
                      >
                        <Text style={styles.approveText}>{t('shared.approve')}</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.declineBtn, busyId === item.id && styles.busy]}
                        disabled={busyId != null}
                        onPress={() => setStatus(item.id, 'Declined')}
                      >
                        <Text style={styles.declineText}>{t('shared.decline')}</Text>
                      </Pressable>
                    </View>
                  ) : null}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  when: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.navy },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  seeker: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    marginTop: spacing.sm,
  },
  phone: { fontSize: 13, color: colors.slateMuted, marginTop: 4 },
  message: {
    fontSize: 13,
    color: colors.slateLight,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  approveBtn: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  approveText: { color: colors.heroText, fontWeight: '700' },
  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  declineText: { color: colors.slateMuted, fontWeight: '700' },
  busy: { opacity: 0.6 },
  empty: { alignItems: 'center', padding: spacing.xxxl },
  emptyText: {
    textAlign: 'center',
    color: colors.slateLight,
    marginTop: spacing.md,
    lineHeight: 20,
  },
});
