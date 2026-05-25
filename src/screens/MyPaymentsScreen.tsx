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
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import {
  filterEssentialPayments,
  formatPaymentAmount,
  formatPaymentDate,
  paymentProductLabel,
  paymentStatusTone,
} from '../utils/paymentDisplay';
import { isUserRole } from '../utils/roles';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPayments'>;

export default function MyPaymentsScreen({ navigation, route }: Props) {
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
      setError(e instanceof ApiError ? e.message : 'Could not load payments');
    } finally {
      setLoading(false);
    }
  }, []);

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
            title="My payments"
            subtitle={
              filterEssential
                ? 'Essential plan payments only.'
                : 'All recorded transactions and plan purchases.'
            }
          />

          <View style={styles.toolbar}>
            <Text style={styles.count}>
              {displayed.length}{' '}
              {displayed.length === 1 ? 'transaction' : 'transactions'}
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
                    Essential
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message="Loading payments…" />
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.err}>{error}</Text>
            <Pressable style={styles.retry} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
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
                <Text style={styles.emptyTitle}>No payments yet</Text>
                <Text style={styles.emptySub}>
                  Purchases and listing fees will appear here after checkout.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <PaymentRow item={item} />
            )}
          />
        )}
      </View>
    </AuthenticatedScreenLayout>
  );
}

function PaymentRow({ item }: { item: PaymentTransaction }) {
  const tone = paymentStatusTone(item.status);
  const statusColors = {
    success: { bg: colors.successSoft, text: colors.success },
    pending: { bg: colors.warningSoft, text: colors.warning },
    failed: { bg: colors.errorSoft, text: colors.error },
    neutral: { bg: colors.surfaceMuted, text: colors.slateMuted },
  }[tone];

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.rowProduct}>{paymentProductLabel(item.productType)}</Text>
        <Text style={styles.rowAmount}>
          {formatPaymentAmount(item.amount, item.currency)}
        </Text>
      </View>
      <View style={styles.rowMeta}>
        <View style={[styles.statusPill, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {item.status}
          </Text>
        </View>
        {item.tierCode ? (
          <Text style={styles.tier}>{item.tierCode}</Text>
        ) : null}
      </View>
      <Text style={styles.date}>
        {formatPaymentDate(item.completedAtUtc ?? item.createdAtUtc)}
      </Text>
      {item.payerReferenceNote ? (
        <Text style={styles.ref} numberOfLines={1}>
          Ref: {item.payerReferenceNote}
        </Text>
      ) : null}
    </View>
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
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rowProduct: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
  },
  rowAmount: { fontSize: 16, fontWeight: '800', color: colors.tealDark },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tier: { fontSize: 11, fontWeight: '600', color: colors.slateLight },
  date: { fontSize: 12, color: colors.slateLight, marginTop: spacing.sm },
  ref: { fontSize: 11, color: colors.slateLight, marginTop: 4 },
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
