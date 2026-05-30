import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { paymentsApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PageHero } from '../components/ui/PageHero';
import { BrandLoading } from '../components/ui/BrandLoading';
import { formatInr } from '../utils/propertyFormat';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'BuilderPayments'>;

export default function BuilderPaymentsScreen({ navigation }: Props) {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await paymentsApi.getBuilderSummary();
      setSummary(data);
    } catch (e) {
      Alert.alert('Error', e instanceof ApiError ? e.message : 'Could not load plans');
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

  const uploadPrice = Number(summary?.projectUploadPriceInr ?? 0);
  const credits = Number(summary?.projectUploadCredits ?? 0);

  async function buyUpload() {
    setBusy(true);
    try {
      const order = await paymentsApi.createBuilderProjectUploadOrder(
        'BUPLOAD1',
        'thaneproperty://payment-return'
      );
      navigation.navigate('CashfreeCheckout', {
        product: 'builder_upload',
        paymentSessionId: order.paymentSessionId,
        orderId: order.orderId,
        environment: order.environment,
        tierCode: 'BUPLOAD1',
        amountInr: uploadPrice || 1999,
      });
    } catch (e) {
      Alert.alert('Checkout', e instanceof ApiError ? e.message : 'Could not start payment');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <PageHero
          variant="builder"
          icon="cloud-upload-outline"
          title="Builder plans"
          subtitle="Project upload credits and lead packages — aligned with the web builder dashboard."
        />
        {loading ? (
          <BrandLoading fullScreen={false} message="Loading…" />
        ) : (
          <>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{credits}</Text>
                <Text style={styles.statLabel}>Upload credits</Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text style={styles.planTitle}>Project upload credit</Text>
              <Text style={styles.planPrice}>{formatInr(uploadPrice || 1999)}</Text>
              <Text style={styles.planHint}>
                Required to publish a new builder project to the directory.
              </Text>
              <Pressable style={styles.buyBtn} onPress={buyUpload} disabled={busy}>
                <Text style={styles.buyBtnText}>{busy ? 'Starting…' : 'Buy upload credit'}</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.linkBtn}
              onPress={() => navigation.navigate('MyPayments')}
            >
              <Text style={styles.linkBtnText}>View all payments & invoices</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  statVal: { fontSize: 28, fontWeight: '800', color: colors.builder },
  statLabel: { fontSize: 12, fontWeight: '600', color: colors.slateLight, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  planTitle: { fontSize: 16, fontWeight: '800', color: colors.navy },
  planPrice: { fontSize: 24, fontWeight: '800', color: colors.builder, marginTop: spacing.sm },
  planHint: { fontSize: 13, color: colors.slateLight, lineHeight: 18, marginTop: spacing.sm },
  buyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.builder,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buyBtnText: { color: colors.heroText, fontWeight: '700' },
  linkBtn: { alignItems: 'center', marginTop: spacing.xl },
  linkBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
