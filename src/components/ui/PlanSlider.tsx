import React, { useState } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clampToStep } from '../../utils/agentPlanPricing';
import { colors, radius, spacing } from '../../theme';

const THUMB = 24;

type Props = {
  label: string;
  step?: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  min: number;
  max: number;
  increment?: number;
  accent?: string;
  valueLabel: string;
  minLabel: string;
  maxLabel: string;
  onChange: (next: number) => void;
};

export function PlanSlider({
  label,
  step,
  icon,
  value,
  min,
  max,
  increment = 1,
  accent = colors.primary,
  valueLabel,
  minLabel,
  maxLabel,
  onChange,
}: Props) {
  const [width, setWidth] = useState(0);
  const range = Math.max(1, max - min);
  const ratio = Math.min(1, Math.max(0, (value - min) / range));

  function handleTouch(e: GestureResponderEvent) {
    if (width <= 0) return;
    const x = Math.min(width, Math.max(0, e.nativeEvent.locationX));
    const raw = min + (x / width) * range;
    const next = clampToStep(raw, min, max, increment);
    if (next !== value) onChange(next);
  }

  const fillWidth = ratio * width;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.labelRow}>
          <View style={[styles.iconChip, { backgroundColor: accent + '1a' }]}>
            <Ionicons name={icon} size={15} color={accent} />
          </View>
          <View style={styles.labelCol}>
            {step ? <Text style={styles.step}>{step}</Text> : null}
            <Text style={styles.label}>{label}</Text>
          </View>
        </View>
        <View style={styles.valuePill}>
          <Text style={[styles.value, { color: accent }]}>{valueLabel}</Text>
        </View>
      </View>

      <View style={styles.controlRow}>
        <Pressable
          style={styles.stepBtn}
          onPress={() => onChange(clampToStep(value - increment, min, max, increment))}
          hitSlop={8}
          accessibilityLabel={`Decrease ${label}`}
        >
          <Ionicons name="remove" size={18} color={colors.slateMuted} />
        </Pressable>

        <View
          style={styles.trackArea}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleTouch}
          onResponderMove={handleTouch}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: fillWidth, backgroundColor: accent }]} />
          </View>
          <View
            style={[
              styles.thumb,
              { left: Math.max(0, Math.min(width - THUMB, fillWidth - THUMB / 2)), borderColor: accent },
            ]}
          />
        </View>

        <Pressable
          style={styles.stepBtn}
          onPress={() => onChange(clampToStep(value + increment, min, max, increment))}
          hitSlop={8}
          accessibilityLabel={`Increase ${label}`}
        >
          <Ionicons name="add" size={18} color={colors.slateMuted} />
        </Pressable>
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>{minLabel}</Text>
        <Text style={styles.scaleText}>{maxLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 0 },
  iconChip: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  labelCol: { flex: 1, minWidth: 0 },
  step: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.slateLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  label: { fontSize: 14, fontWeight: '800', color: colors.navy },
  valuePill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    minWidth: 56,
    alignItems: 'center',
  },
  value: { fontSize: 15, fontWeight: '900' },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackArea: { flex: 1, height: THUMB, justifyContent: 'center' },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: 3 },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.surface,
    borderWidth: 3,
    top: 0,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  scaleText: { fontSize: 11, color: colors.slateLight, fontWeight: '600' },
});
