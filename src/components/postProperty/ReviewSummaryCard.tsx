import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PostPropertyFormState } from '../../utils/postPropertyForm';
import {
  formatInr,
  listingTypeSummary,
} from '../../utils/postPropertyForm';
import { colors, radius, spacing } from '../../theme';

type Props = {
  form: PostPropertyFormState;
  photoCount: number;
};

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.slateLight} style={styles.rowIcon} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function ReviewSummaryCard({ form, photoCount }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Review your listing</Text>
      <Text style={styles.sub}>
        Check everything looks right before posting. You can go back to edit any step.
      </Text>

      <Row icon="pricetag-outline" label="Title" value={form.title || '—'} />
      <Row icon="home-outline" label="Configuration" value={form.bhkConfiguration || '—'} />
      <Row icon="layers-outline" label="Listing type" value={listingTypeSummary(form)} />
      <Row icon="cash-outline" label="Rent / month" value={formatInr(form.rentAmount)} />
      {form.isForSale && (
        <Row icon="trending-up-outline" label="Sale price" value={formatInr(form.sellPrice)} />
      )}
      <Row
        icon="location-outline"
        label="Location"
        value={
          form.areaName
            ? `${form.areaName}${form.pincode ? ` · ${form.pincode}` : ''}`
            : '—'
        }
      />
      <Row
        icon="navigate-outline"
        label="Address"
        value={form.address || '—'}
      />
      <Row
        icon="images-outline"
        label="Photos"
        value={photoCount > 0 ? `${photoCount} photo${photoCount > 1 ? 's' : ''}` : 'None added'}
      />

      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={16} color="#15803d" />
        <Text style={styles.badgeText}>
          Free posting · Pending admin review after submit
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: colors.slateLight,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowIcon: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
    marginTop: 2,
    lineHeight: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#dcfce7',
    borderRadius: radius.md,
  },
  badgeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
    lineHeight: 17,
  },
});
