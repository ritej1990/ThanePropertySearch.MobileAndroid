import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PaymentTransaction } from '../../api/paymentHistoryTypes';
import { colors, radius, spacing } from '../../theme';
import {
  formatPaymentAmount,
  formatPaymentDate,
  paymentProductLabel,
  paymentStatusTone,
  showInvoiceDownload,
} from '../../utils/paymentDisplay';

type Props = {
  item: PaymentTransaction;
  onInvoice?: () => void;
};

export function PaymentHistoryRow({ item, onInvoice }: Props) {
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
        {item.tierCode ? <Text style={styles.tier}>{item.tierCode}</Text> : null}
      </View>
      <Text style={styles.date}>
        {formatPaymentDate(item.completedAtUtc ?? item.createdAtUtc)}
      </Text>
      {item.payerReferenceNote ? (
        <Text style={styles.ref} numberOfLines={1}>
          Ref: {item.payerReferenceNote}
        </Text>
      ) : null}
      {showInvoiceDownload(item) && onInvoice ? (
        <Pressable style={styles.invoiceBtn} onPress={onInvoice}>
          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
          <Text style={styles.invoiceBtnText}>
            Download invoice{item.invoiceNumber ? ` · ${item.invoiceNumber}` : ''}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignSelf: 'flex-start',
  },
  invoiceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
