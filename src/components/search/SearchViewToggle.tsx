import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type SearchViewMode = 'list' | 'map';

type Props = {
  mode: SearchViewMode;
  onChange: (mode: SearchViewMode) => void;
  mapDisabled?: boolean;
  compact?: boolean;
  gradientActive?: boolean;
};

function TabContent({
  icon,
  label,
  active,
  compact,
  gradientActive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  compact?: boolean;
  gradientActive?: boolean;
}) {
  const iconColor = active ? colors.heroText : colors.slateMuted;
  const textStyle = [
    styles.tabText,
    compact && styles.tabTextCompact,
    active && styles.tabTextOn,
  ];

  const inner = (
    <>
      <Ionicons name={icon} size={compact ? 14 : 16} color={iconColor} />
      <Text style={textStyle}>{label}</Text>
    </>
  );

  if (active && gradientActive) {
    return (
      <LinearGradient
        colors={['#0d9488', '#0f766e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tab, compact && styles.tabCompact, styles.tabOnGrad]}
      >
        {inner}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.tab, compact && styles.tabCompact, active && styles.tabOn]}>
      {inner}
    </View>
  );
}

export function SearchViewToggle({
  mode,
  onChange,
  mapDisabled,
  compact,
  gradientActive,
}: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        style={styles.tabPress}
        onPress={() => onChange('list')}
      >
        <TabContent
          icon="list"
          label="List"
          active={mode === 'list'}
          compact={compact}
          gradientActive={gradientActive}
        />
      </Pressable>
      <Pressable
        style={[styles.tabPress, mapDisabled && styles.tabPressDisabled]}
        onPress={() => !mapDisabled && onChange('map')}
        disabled={mapDisabled}
      >
        <TabContent
          icon="map"
          label="Map"
          active={mode === 'map'}
          compact={compact}
          gradientActive={gradientActive}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wrapCompact: {
    padding: 2,
  },
  tabPress: {
    flex: 1,
  },
  tabPressDisabled: {
    opacity: 0.45,
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
    paddingVertical: 6,
    gap: 4,
  },
  tabOn: {
    backgroundColor: '#0d9488',
  },
  tabOnGrad: {
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
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
