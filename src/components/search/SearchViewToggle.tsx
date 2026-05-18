import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type SearchViewMode = 'list' | 'map';

type Props = {
  mode: SearchViewMode;
  onChange: (mode: SearchViewMode) => void;
  mapDisabled?: boolean;
  compact?: boolean;
};

export function SearchViewToggle({ mode, onChange, mapDisabled, compact }: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        style={[styles.tab, compact && styles.tabCompact, mode === 'list' && styles.tabOn]}
        onPress={() => onChange('list')}
      >
        <Ionicons
          name="list"
          size={compact ? 14 : 16}
          color={mode === 'list' ? colors.heroText : colors.slateMuted}
        />
        <Text style={[styles.tabText, compact && styles.tabTextCompact, mode === 'list' && styles.tabTextOn]}>
          List
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.tab,
          compact && styles.tabCompact,
          mode === 'map' && styles.tabOn,
          mapDisabled && styles.tabDisabled,
        ]}
        onPress={() => !mapDisabled && onChange('map')}
        disabled={mapDisabled}
      >
        <Ionicons
          name="map"
          size={compact ? 14 : 16}
          color={mode === 'map' ? colors.heroText : colors.slateMuted}
        />
        <Text style={[styles.tabText, compact && styles.tabTextCompact, mode === 'map' && styles.tabTextOn]}>
          Map
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  wrapCompact: {
    padding: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  tabCompact: {
    paddingVertical: 5,
    gap: 4,
  },
  tabOn: {
    backgroundColor: '#0d9488',
  },
  tabDisabled: {
    opacity: 0.45,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  tabTextCompact: {
    fontSize: 11,
  },
  tabTextOn: {
    color: colors.heroText,
  },
});
