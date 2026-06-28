import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  MAINTENANCE_BANNER_BODY_HEIGHT,
  useSiteMaintenance,
} from '../../context/SiteMaintenanceContext';

export function MaintenanceBanner() {
  const insets = useSafeAreaInsets();
  const { enabled, message } = useSiteMaintenance();

  if (!enabled || !message) return null;

  return (
    <View
      style={[styles.banner, { paddingTop: insets.top + 6 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.inner}>
        <Ionicons name="construct" size={16} color="#fffbeb" style={styles.icon} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

export function MaintenanceBannerSpacer() {
  const insets = useSafeAreaInsets();
  const { enabled } = useSiteMaintenance();
  if (!enabled) return null;
  return <View style={{ height: insets.top + MAINTENANCE_BANNER_BODY_HEIGHT }} />;
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10000,
    backgroundColor: '#d97706',
    borderBottomWidth: 1,
    borderBottomColor: '#b45309',
    shadowColor: '#78350f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#fffbeb',
  },
});
