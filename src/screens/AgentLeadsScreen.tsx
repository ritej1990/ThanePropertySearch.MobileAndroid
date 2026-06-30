import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { agentLeadsApi } from '../api/singleton';
import type { AgentLead } from '../api/agentTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useTranslation } from '../context/LocaleContext';
import { localeToCulture } from '../i18n/types';
import type { AppLocale } from '../i18n/types';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentLeads'>;

function formatWhen(iso: string, locale: AppLocale) {
  try {
    return new Date(iso).toLocaleString(localeToCulture(locale), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function AgentLeadsScreen({ navigation }: Props) {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<AgentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await agentLeadsApi.listMine();
      setRows(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('agent.couldNotLoadLeads'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('agent.leadsTitle')}</Text>
          <Text style={styles.sub}>{t('agent.leadsSub')}</Text>
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message={t('agent.loadingLeads')} />
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.err}>{error}</Text>
            <Pressable style={styles.retry} onPress={load}>
              <Text style={styles.retryText}>{t('shared.retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r) => String(r.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="mail-open-outline" size={40} color={colors.slateLight} />
                <Text style={styles.emptyTitle}>{t('agent.noLeads')}</Text>
                <Text style={styles.emptySub}>{t('agent.noLeadsEmptySub')}</Text>
                <Pressable
                  style={styles.cta}
                  onPress={() => navigation.navigate('AgentPayments')}
                >
                  <Text style={styles.ctaText}>{t('agent.viewPlans')}</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.listingTitle} numberOfLines={2}>
                  {item.listingTitle ||
                    t('agent.listingFallback', { id: item.listingId })}
                </Text>
                <Text style={styles.when}>{formatWhen(item.createdAtUtc, locale)}</Text>
                <View style={styles.contactRow}>
                  <Ionicons name="person-outline" size={16} color={colors.teal} />
                  <Text style={styles.contactText}>{item.name}</Text>
                </View>
                {item.phone ? (
                  <Pressable
                    style={styles.linkRow}
                    onPress={() => void Linking.openURL(`tel:${item.phone}`)}
                  >
                    <Ionicons name="call-outline" size={16} color={colors.primary} />
                    <Text style={styles.linkText}>{item.phone}</Text>
                  </Pressable>
                ) : null}
                {item.email ? (
                  <Pressable
                    style={styles.linkRow}
                    onPress={() => void Linking.openURL(`mailto:${item.email}`)}
                  >
                    <Ionicons name="mail-outline" size={16} color={colors.primary} />
                    <Text style={styles.linkText}>{item.email}</Text>
                  </Pressable>
                ) : null}
                {item.message?.trim() ? (
                  <Text style={styles.message}>{item.message.trim()}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
  },
  sub: {
    fontSize: 13,
    color: colors.slateLight,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  when: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  message: {
    fontSize: 13,
    color: colors.slateMuted,
    lineHeight: 19,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    color: colors.slateLight,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  ctaText: {
    color: colors.heroText,
    fontWeight: '700',
  },
  centered: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  err: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retry: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.heroText,
    fontWeight: '700',
  },
});
