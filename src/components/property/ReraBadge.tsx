import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RERA_VERIFY_URL } from '../../utils/builderFormat';
import { colors, radius, spacing } from '../../theme';

type Props = {
  rera: string;
  compact?: boolean;
  onDark?: boolean;
};

export function ReraBadge({ rera, compact, onDark }: Props) {
  return (
    <Pressable
      style={[
        styles.wrap,
        compact && styles.wrapCompact,
        onDark && styles.wrapOnDark,
      ]}
      onPress={() => Linking.openURL(RERA_VERIFY_URL)}
      accessibilityRole="link"
      accessibilityLabel={`RERA ${rera}. Verify on MahaRERA`}
    >
      <Ionicons
        name="shield-checkmark"
        size={compact ? 12 : 14}
        color={onDark ? colors.goldSoft : colors.tealDark}
      />
      <Text
        style={[styles.text, compact && styles.textCompact, onDark && styles.textOnDark]}
        numberOfLines={1}
      >
        RERA {rera}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  wrapCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  wrapOnDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderColor: 'rgba(252, 211, 77, 0.35)',
  },
  text: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    color: colors.tealDark,
    letterSpacing: 0.2,
  },
  textCompact: {
    fontSize: 11,
  },
  textOnDark: {
    color: colors.goldSoft,
  },
});
