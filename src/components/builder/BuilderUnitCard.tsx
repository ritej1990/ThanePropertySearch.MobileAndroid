import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BuilderUnit } from '../../api/builderTypes';
import { colors, radius, spacing } from '../../theme';
import { formatBuilderPrice, formatSqft } from '../../utils/builderFormat';

type Props = {
  unit: BuilderUnit;
  onEnquire: () => void;
};

export function BuilderUnitCard({ unit, onEnquire }: Props) {
  const available = unit.availabilityStatus.toLowerCase() === 'available';

  return (
    <View style={[styles.card, available && styles.cardAvailable]}>
      <View style={styles.topRow}>
        <View style={styles.configBadge}>
          <Text style={styles.configText}>{unit.configuration}</Text>
        </View>
        <View style={[styles.status, !available && styles.statusMuted]}>
          <View style={[styles.statusDot, !available && styles.statusDotMuted]} />
          <Text style={[styles.statusText, !available && styles.statusTextMuted]}>
            {unit.availabilityStatus}
          </Text>
        </View>
      </View>

      <View style={styles.midRow}>
        <View>
          <Text style={styles.unitLabel}>
            {unit.towerName} · Unit {unit.unitNumber}
          </Text>
          <Text style={styles.size}>
            {formatSqft(unit.carpetSqft)} carpet · {formatSqft(unit.builtupSqft)} built-up
          </Text>
        </View>
        <Text style={styles.price}>{formatBuilderPrice(unit.price)}</Text>
      </View>

      {available ? (
        <Pressable style={styles.enquireBtn} onPress={onEnquire}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.builder} />
          <Text style={styles.enquireText}>Enquire on this unit</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.builder} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardAvailable: {
    borderColor: colors.builderBorder,
    backgroundColor: colors.builderSoft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  configBadge: {
    backgroundColor: colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  configText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.heroText,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: '#ecfdf5',
  },
  statusMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusDotMuted: {
    backgroundColor: colors.slateLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    textTransform: 'uppercase',
  },
  statusTextMuted: {
    color: colors.slateMuted,
  },
  midRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
  size: {
    fontSize: 11,
    color: colors.slateMuted,
    marginTop: 4,
    maxWidth: 200,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f766e',
  },
  enquireBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  enquireText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.builder,
  },
});
