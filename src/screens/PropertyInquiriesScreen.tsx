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
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { getFloatingRailHeight } from '../components/layout/FloatingSupportChat';
import { AiLeadBadge } from '../components/property/AiLeadBadge';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { useTranslation } from '../context/LocaleContext';
import type { TranslateFn } from '../i18n';
import { apiErrorMessage } from '../utils/apiErrorMessage';
import { formatLocaleDate } from '../utils/formatLocaleDate';
import { isOwnerRole } from '../utils/roles';

function translateStatus(t: TranslateFn, status: string): string {
  const s = status.toLowerCase();
  if (s === 'approved') return t('statusLabels.approved');
  if (s === 'rejected') return t('statusLabels.rejected');
  if (s === 'pending') return t('statusLabels.pending');
  if (s === 'declined') return t('statusLabels.declined');
  return status;
}

type Props = NativeStackScreenProps<RootStackParamList, 'PropertyInquiries'>;

function statusColors(status: string) {
  const s = status.toLowerCase();
  if (s === 'approved') return { bg: colors.successSoft, text: colors.success };
  if (s === 'rejected') return { bg: colors.errorSoft, text: colors.error };
  return { bg: colors.warningSoft, text: colors.warning };
}

export default function PropertyInquiriesScreen({ navigation, route }: Props) {
  const { propertyId, title } = route.params;
  const { t, locale } = useTranslation();
  const { profile } = useAuth();
  const [rows, setRows] = useState<PropertyInquirySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [canManageRequests, setCanManageRequests] = useState(false);

  const load = useCallback(async () => {
    try {
      const [data, listing] = await Promise.all([
        propertiesApi.getPropertyInquiries(propertyId),
        propertiesApi.getById(propertyId).catch(() => null),
      ]);
      setRows(data);
      const isListingOwner =
        listing?.ownerId != null &&
        profile?.userId != null &&
        listing.ownerId === profile.userId;
      setCanManageRequests(isOwnerRole(profile?.role) && isListingOwner);
    } finally {
      setLoading(false);
    }
  }, [propertyId, profile?.role, profile?.userId]);

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
      Alert.alert(t('shared.updated'), res.message);
      await load();
    } catch (e) {
      Alert.alert(t('shared.failed'), apiErrorMessage(e, t('inquiries.couldNotUpdate')));
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
            title={t('inquiries.title')}
            subtitle={
              canManageRequests
                ? title
                  ? t('inquiries.subtitleOwnerFor', { title })
                  : t('inquiries.subtitleOwner')
                : title
                  ? t('inquiries.subtitleBuyerFor', { title })
                  : t('inquiries.subtitleBuyer')
            }
          />
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message={t('inquiries.loading')} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: spacing.xxxl + getFloatingRailHeight(false) },
            ]}
            ListEmptyComponent={
              <Text style={styles.empty}>{t('inquiries.empty')}</Text>
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
                      {formatLocaleDate(item.createdAtUtc, locale)}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.badgeText, { color: st.text }]}>
                        {translateStatus(t, item.status)}
                      </Text>
                    </View>
                    <AiLeadBadge inquiryId={item.id} />
                  </Pressable>
                  {pending && canManageRequests ? (
                    <View style={styles.actions}>
                      <Pressable
                        style={styles.approveBtn}
                        disabled={busyId != null}
                        onPress={() => updateStatus(item.id, 'Approved')}
                      >
                        <Text style={styles.approveText}>{t('shared.approve')}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.rejectBtn}
                        disabled={busyId != null}
                        onPress={() => updateStatus(item.id, 'Rejected')}
                      >
                        <Text style={styles.rejectText}>{t('shared.reject')}</Text>
                      </Pressable>
                    </View>
                  ) : pending && !canManageRequests ? (
                    <View style={styles.pendingNote}>
                      <Text style={styles.pendingNoteText}>
                        {t('inquiries.waitingForOwner')}
                      </Text>
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
                      <Text style={styles.chatBtnText}>{t('shared.openChat')}</Text>
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
  list: { paddingHorizontal: spacing.lg },
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
  pendingNote: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  pendingNoteText: {
    fontSize: 13,
    color: colors.slateLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  chatBtn: {
    padding: spacing.md,
    paddingTop: 0,
    alignItems: 'center',
  },
  chatBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  empty: { textAlign: 'center', color: colors.slateLight, marginTop: 40 },
});
