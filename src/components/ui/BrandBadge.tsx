import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThaneFlatsLogo } from './ThaneFlatsLogo';
import { colors, spacing } from '../../theme';

type Props = {
  compact?: boolean;
  /** Single-line title for app header bar (no subtitle). */
  header?: boolean;
  /** Use on white/light backgrounds (login card) */
  onLight?: boolean;
};

export function BrandBadge({ compact, header, onLight }: Props) {
  const showSubtitle = !compact && !header;
  const size = compact ? 34 : header ? 30 : 44;
  const onDark = !onLight;

  return (
    <View style={[styles.wrap, header && styles.wrapHeader]}>
      <ThaneFlatsLogo
        size={size}
        showWordmark={!compact}
        onDark={onDark}
      />
      {showSubtitle ? (
        <Text style={[styles.brandSub, onLight && styles.brandSubLight]}>
          thane property search
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  wrapHeader: {
    flexShrink: 0,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: colors.heroText,
    opacity: 0.78,
    textTransform: 'lowercase',
    marginLeft: 2,
  },
  brandSubLight: {
    color: colors.slateLight,
    opacity: 1,
  },
});
