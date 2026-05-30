import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  compact?: boolean;
};

/** Corner cross-tag ribbon for listings posted within NEW_LISTING_DAYS (matches web portal-badge-new). */
export function NewListingRibbon({ compact }: Props) {
  return (
    <View
      style={[styles.host, compact && styles.hostCompact]}
      pointerEvents="none"
      accessibilityLabel="New listing"
    >
      <LinearGradient
        colors={['#15803d', '#4ade80', '#22c55e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ribbon, compact && styles.ribbonCompact]}
      >
        <Text style={[styles.text, compact && styles.textCompact]}>New</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 12,
    left: -38,
    zIndex: 4,
    transform: [{ rotate: '-45deg' }],
  },
  hostCompact: {
    top: 8,
    left: -30,
  },
  ribbon: {
    width: 104,
    paddingVertical: 4,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.55,
    shadowRadius: 6,
    elevation: 4,
  },
  ribbonCompact: {
    width: 86,
    paddingVertical: 3,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  textCompact: {
    fontSize: 9,
    letterSpacing: 1,
  },
});
