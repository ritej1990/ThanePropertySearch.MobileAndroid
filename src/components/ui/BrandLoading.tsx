import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ThaneFlatsLogo } from './ThaneFlatsLogo';
import { colors, spacing } from '../../theme';

type Props = {
  message?: string;
  /** Fill parent / screen center */
  fullScreen?: boolean;
  /** Logo mark size */
  size?: number;
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BrandLoading({
  message,
  fullScreen = true,
  size = 56,
  onDark = false,
  style,
}: Props) {
  return (
    <View style={[fullScreen ? styles.full : styles.inline, style]}>
      <ThaneFlatsLogo
        size={size}
        showWordmark
        subtitle={message}
        animated
        onDark={onDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.surfaceMuted,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
});
