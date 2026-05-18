import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  webUrl: string;
  hasMap: boolean;
  latitude?: number;
  longitude?: number;
};

export function PropertyDetailStickyBar({
  webUrl,
  hasMap,
  latitude,
  longitude,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}>
      <Pressable
        style={styles.primary}
        onPress={() => Linking.openURL(webUrl)}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.heroText} />
        <Text style={styles.primaryText}>Contact on web</Text>
      </Pressable>
      {hasMap && latitude != null && longitude != null && (
        <Pressable
          style={styles.iconBtn}
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
            )
          }
        >
          <Ionicons name="map-outline" size={22} color={colors.navy} />
        </Pressable>
      )}
      <Pressable
        style={styles.iconBtn}
        onPress={() => Linking.openURL(webUrl)}
      >
        <Ionicons name="open-outline" size={22} color={colors.navy} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  primary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  primaryText: {
    color: colors.heroText,
    fontWeight: '700',
    fontSize: 15,
  },
  iconBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
});
