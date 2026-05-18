import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { paymentsApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { ThaneFlatsLogo } from '../components/ui/ThaneFlatsLogo';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactPackPurchase'>;

export default function ContactPackPurchaseScreen({ navigation, route }: Props) {
  const returnPropertyId = route.params?.returnPropertyId;
  const [paying, setPaying] = useState(false);
  const [pack, setPack] = useState({ priceInr: 149, credits: 10 });

  React.useEffect(() => {
    paymentsApi.getPricing().then((p) => {
      if (p.userContactPack) setPack(p.userContactPack);
    });
  }, []);

  async function pay() {
    setPaying(true);
    try {
      const order = await paymentsApi.createContactPackOrder();
      navigation.navigate('CashfreeCheckout', {
        product: 'contact_pack',
        paymentSessionId: order.paymentSessionId,
        orderId: order.orderId,
        environment: order.environment,
        amountInr: pack.priceInr,
        returnPropertyId,
      });
    } catch (e) {
      Alert.alert(
        'Checkout failed',
        e instanceof ApiError ? e.message : 'Could not start payment'
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <View style={styles.wrap}>
        <ThaneFlatsLogo size={48} showWordmark />
        <Text style={styles.title}>Contact reveal pack</Text>
        <Text style={styles.sub}>
          ₹{pack.priceInr} — {pack.credits} owner phone & email reveals. Separate from
          the chat plan.
        </Text>
        <Pressable style={styles.payBtn} onPress={pay} disabled={paying}>
          {paying ? (
            <ThaneFlatsLogo size={22} animated onDark />
          ) : (
            <Text style={styles.payBtnText}>Pay with Cashfree</Text>
          )}
        </Pressable>
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
  },
  sub: {
    fontSize: 15,
    color: colors.slateMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  payBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: radius.md,
    minWidth: 220,
    alignItems: 'center',
  },
  payBtnText: { color: colors.heroText, fontWeight: '800', fontSize: 16 },
});
