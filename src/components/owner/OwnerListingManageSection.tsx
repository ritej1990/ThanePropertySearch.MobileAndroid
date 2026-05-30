import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OwnerAvailabilityOutcome, OwnerDashboardItem } from '../../api/ownerTypes';
import { colors, radius, spacing } from '../../theme';
import { isOwnerClosedOutcome } from '../../utils/ownerDashboard';

type Props = {
  item: OwnerDashboardItem;
  onOutcomeChange: (outcome: OwnerAvailabilityOutcome) => Promise<void>;
  onHideToggle: (hidden: boolean) => Promise<void>;
  onDelete: () => Promise<void>;
};

const OUTCOMES: { value: OwnerAvailabilityOutcome; label: string }[] = [
  { value: '', label: 'On market' },
  { value: 'Rented', label: 'Rented' },
  { value: 'Sold', label: 'Sold' },
];

export function OwnerListingManageSection({
  item,
  onOutcomeChange,
  onHideToggle,
  onDelete,
}: Props) {
  const [busy, setBusy] = useState<'outcome' | 'hide' | 'delete' | null>(null);
  const closedOut = isOwnerClosedOutcome(item.ownerAvailabilityOutcome);
  const currentOutcome = (item.ownerAvailabilityOutcome ?? '').trim();
  const selectedOutcome: OwnerAvailabilityOutcome =
    currentOutcome === 'Sold' ? 'Sold' : currentOutcome === 'Rented' ? 'Rented' : '';

  async function handleOutcome(next: OwnerAvailabilityOutcome) {
    if (busy || next === selectedOutcome) return;
    setBusy('outcome');
    try {
      await onOutcomeChange(next);
    } finally {
      setBusy(null);
    }
  }

  async function handleHide(value: boolean) {
    if (busy) return;
    if (!closedOut) {
      Alert.alert(
        'Mark as Rented or Sold first',
        'Hide from search is available after you close out the unit as Rented or Sold.'
      );
      return;
    }
    setBusy('hide');
    try {
      await onHideToggle(value);
    } finally {
      setBusy(null);
    }
  }

  function confirmDelete() {
    if (!closedOut) {
      Alert.alert(
        'Mark as Rented or Sold first',
        'Delete is available after you mark the unit as Rented or Sold.'
      );
      return;
    }
    Alert.alert(
      'Delete listing?',
      `Permanently delete "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy('delete');
            try {
              await onDelete();
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>
        <Ionicons name="flag-outline" size={14} color={colors.slateMuted} /> Unit status
      </Text>
      <View style={styles.outcomeRow}>
        {OUTCOMES.map((opt) => {
          const active = opt.value === selectedOutcome;
          return (
            <Pressable
              key={opt.label}
              style={[styles.outcomeChip, active && styles.outcomeChipOn]}
              disabled={busy != null}
              onPress={() => handleOutcome(opt.value)}
            >
              {busy === 'outcome' && active ? (
                <ActivityIndicator size="small" color={colors.heroText} />
              ) : (
                <Text style={[styles.outcomeText, active && styles.outcomeTextOn]}>
                  {opt.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.closedTools}>
        <View style={[styles.hideRow, !closedOut && styles.toolDisabled]}>
          <View style={styles.hideLabelWrap}>
            <Ionicons
              name="eye-off-outline"
              size={16}
              color={closedOut ? colors.slateMuted : colors.slateLight}
            />
            <Text style={[styles.hideLabel, !closedOut && styles.toolLabelDisabled]}>
              Hide from search
            </Text>
          </View>
          {busy === 'hide' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={item.isHiddenFromSearch === true}
              onValueChange={handleHide}
              disabled={!closedOut || busy != null}
              trackColor={{ false: colors.border, true: colors.teal }}
              thumbColor={colors.surface}
            />
          )}
        </View>

        <Pressable
          style={[
            styles.deleteBtn,
            !closedOut && styles.deleteBtnDisabled,
            busy === 'delete' && styles.deleteBtnBusy,
          ]}
          onPress={confirmDelete}
          disabled={busy != null}
        >
          {busy === 'delete' ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <Ionicons
                name="trash-outline"
                size={16}
                color={closedOut ? colors.error : colors.slateLight}
              />
              <Text style={[styles.deleteText, !closedOut && styles.toolLabelDisabled]}>
                Delete post
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.hint}>
          {closedOut
            ? 'Hide temporarily removes the listing from search; delete removes it permanently.'
            : 'Mark the unit as Rented or Sold to enable hide and delete.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slateMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  outcomeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  outcomeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    minWidth: 88,
    alignItems: 'center',
  },
  outcomeChipOn: {
    backgroundColor: colors.navyMid,
    borderColor: colors.navyMid,
  },
  outcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  outcomeTextOn: {
    color: colors.heroText,
  },
  closedTools: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  toolDisabled: {
    opacity: 0.72,
  },
  toolLabelDisabled: {
    color: colors.slateLight,
  },
  hideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  hideLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hideLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  deleteBtnBusy: {
    opacity: 0.7,
  },
  deleteBtnDisabled: {
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.error,
  },
  hint: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.slateLight,
  },
});
