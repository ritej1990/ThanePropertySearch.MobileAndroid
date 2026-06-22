import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  methods: string[];
};

type IconName = keyof typeof Ionicons.glyphMap;

function iconFor(method: string): IconName {
  const m = method.trim().toLowerCase();
  if (m.includes('upi') || m.includes('pay')) return 'phone-portrait-outline';
  if (m.includes('paytm') || m.includes('wallet')) return 'wallet-outline';
  if (m.includes('card')) return 'card-outline';
  if (m.includes('netbank') || m.includes('bank')) return 'business-outline';
  return 'checkmark-circle-outline';
}

/** Trust-signal row of accepted payment methods — what's actually offered depends on the
 *  Cashfree merchant account configuration; this just communicates what's supported. */
export function PaymentMethodBadges({ methods }: Props) {
  const list = methods.filter((m) => m.trim() && m.trim().toLowerCase() !== 'cashfree');
  if (list.length === 0) return null;

  return (
    <View style={styles.row}>
      {list.map((method) => (
        <View key={method} style={styles.badge}>
          <Ionicons name={iconFor(method)} size={12} color="#0d9488" />
          <Text style={styles.text}>{method}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  text: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f766e',
  },
});
