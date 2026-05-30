import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type SearchViewMode = 'list' | 'map';

type Props = {
  mode: SearchViewMode;
  onChange: (mode: SearchViewMode) => void;
  mapDisabled?: boolean;
  /** Icon-only — for compact sticky bars. */
  compact?: boolean;
};

type SegmentProps = {
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  a11yLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
};

function Segment({
  selected,
  icon,
  label,
  a11yLabel,
  onPress,
  disabled,
  compact,
}: SegmentProps) {
  return (
    <Pressable
      style={[
        styles.segment,
        compact && styles.segmentCompact,
        selected && styles.segmentOn,
        disabled && styles.segmentDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled: disabled ?? false }}
      accessibilityLabel={a11yLabel ?? label}
    >
      <Ionicons
        name={icon}
        size={compact ? 14 : 13}
        color={selected ? colors.heroText : colors.navy}
      />
      {!compact ? (
        <Text style={[styles.segmentLabel, selected && styles.segmentLabelOn]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** List ↔ Map switch — one clear control, obvious selected state. */
export function SearchViewToggle({
  mode,
  onChange,
  mapDisabled,
  compact,
}: Props) {
  return (
    <View
      style={[styles.track, compact && styles.trackCompact]}
      accessibilityRole="tablist"
      accessibilityLabel="Search view mode"
    >
      <Segment
        selected={mode === 'list'}
        icon={mode === 'list' ? 'list' : 'list-outline'}
        label="List"
        a11yLabel="List view"
        onPress={() => onChange('list')}
        compact={compact}
      />
      <Segment
        selected={mode === 'map'}
        icon={mode === 'map' ? 'map' : 'map-outline'}
        label="Map"
        a11yLabel={mapDisabled ? 'Map view unavailable' : 'Map view'}
        onPress={() => onChange('map')}
        disabled={mapDisabled}
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: radius.sm,
    padding: 2,
    gap: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackCompact: {
    padding: 1,
    borderRadius: 6,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 58,
  },
  segmentCompact: {
    flex: 0,
    minWidth: 34,
    width: 34,
    height: 28,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  segmentOn: {
    backgroundColor: '#0d9488',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentDisabled: {
    opacity: 0.4,
  },
  segmentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: 0.1,
  },
  segmentLabelOn: {
    color: colors.heroText,
  },
});
