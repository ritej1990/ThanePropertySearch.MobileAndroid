import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export type DetailTab = 'overview' | 'society' | 'about';

type Props = {
  overview: React.ReactNode;
  society: React.ReactNode;
  about: React.ReactNode;
};

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'society', label: 'Society' },
  { id: 'about', label: 'About & amenities' },
];

export function PropertyDetailTabs({ overview, society, about }: Props) {
  const [active, setActive] = useState<DetailTab>('overview');

  const panel =
    active === 'overview' ? overview : active === 'society' ? society : about;

  return (
    <View style={styles.wrap}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActive(tab.id)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.panel}>{panel}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slateLight,
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#0f766e',
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
});
