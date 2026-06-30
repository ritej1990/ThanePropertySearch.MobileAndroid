import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { paymentsApi } from '../api/singleton';
import type { PaymentTransaction } from '../api/paymentHistoryTypes';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PaymentHistoryRow } from '../components/payments/PaymentHistoryRow';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useTranslation } from '../context/LocaleContext';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { filterEssentialPayments, showInvoiceDownload } from '../utils/paymentDisplay';
import { isUserRole } from '../utils/roles';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPayments'>;

export default function MyPaymentsScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const essentialOnly = route.params?.essentialOnly ?? false;
  const [rows, setRows] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEssential, setFilterEssential] = useState(essentialOnly);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await paymentsApi.getMyTransactions();
      setRows(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('payments.couldNotLoad'));
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

  const displayed = useMemo(
    () => (filterEssential ? filterEssentialPayments(rows) : rows),
    [rows, filterEssential]
  );

  const showEssentialFilter = isUserRole(profile?.role);

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <View style={styles.wrap}>
        <View style={styles.pad}>
          <PageHero
            variant="owner"
            icon="receipt-outline"
            title={t('payments.title')}
            subtitle={
              filterEssential
                ? t('payments.subtitleEssential')
                : t('payments.subtitleAll')
            }
          />

          <View style={styles.toolbar}>
            <Text style={styles.count}>
              {displayed.length}{' '}
              {displayed.length === 1
                ? t('payments.transaction')
                : t('payments.transactions')}
            </Text>
            <View style={styles.toolbarActions}>
              {showEssentialFilter ? (
                <Pressable
                  style={[
                    styles.filterChip,
                    filterEssential && styles.filterChipOn,
                  ]}
                  onPress={() => setFilterEssential((v) => !v)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filterEssential && styles.filterTextOn,
                    ]}
                  >
                    {t('payments.essentialFilter')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message={t('payments.loading')} />
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.err}>{error}</Text>
            <Pressable style={styles.retry} onPress={load}>
              <Text style={styles.retryText}>{t('shared.retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={displayed}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="wallet-outline" size={48} color={colors.slateLight} />
                <Text style={styles.emptyTitle}>{t('payments.empty')}</Text>
                <Text style={styles.emptySub}>{t('payments.emptySub')}</Text>
              </View>
            }
            renderItem={({ item }) => (
              <PaymentHistoryRow
                item={item}
                onInvoice={
                  showInvoiceDownload(item)
                    ? () =>
                        navigation.navigate('InvoiceViewer', {
                          paymentTransactionId: item.id,
                          invoiceNumber: item.invoiceNumber ?? undefined,
                        })
                    : undefined
                }
              />
            )}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.surfaceMuted },
  pad: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  count: { fontSize: 14, fontWeight: '700', color: colors.slateMuted },
  toolbarActions: { flexDirection: 'row', gap: spacing.sm },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  filterChipOn: { backgroundColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  filterTextOn: { color: colors.heroText },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  empty: { alignItems: 'center', padding: spacing.xxxl },
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
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  centered: { padding: spacing.xxl, alignItems: 'center' },
  err: { color: colors.error, textAlign: 'center', marginBottom: spacing.lg },
  retry: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  retryText: { color: colors.heroText, fontWeight: '700' },
});
