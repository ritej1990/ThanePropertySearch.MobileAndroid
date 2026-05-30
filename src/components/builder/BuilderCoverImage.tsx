import React from 'react';
import { StyleSheet, Text, View, type ImageStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PropertyImage } from '../property/PropertyImage';
import { colors, gradients } from '../../theme';

type Props = {
  uri?: string | null;
  projectName?: string;
  style?: StyleProp<ImageStyle>;
  compact?: boolean;
};

export function BuilderCoverImage({ uri, projectName, style, compact }: Props) {
  const hasImage = Boolean(uri?.trim());

  if (hasImage) {
    return <PropertyImage uri={uri!} style={[styles.fill, style]} />;
  }

  const initial = projectName?.trim()?.charAt(0)?.toUpperCase() ?? 'B';

  return (
    <LinearGradient
      colors={[...gradients.builderCover]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}
    >
      <View style={styles.pattern} pointerEvents="none">
        <View style={[styles.ring, compact && styles.ringCompact]} />
        <View style={[styles.ringInner, compact && styles.ringInnerCompact]} />
      </View>
      <View style={styles.placeholderContent}>
        <View style={[styles.iconWrap, compact && styles.iconWrapCompact]}>
          <Ionicons
            name="business"
            size={compact ? 28 : 40}
            color="rgba(248, 250, 252, 0.95)"
          />
        </View>
        {!compact ? (
          <>
            <Text style={styles.initial}>{initial}</Text>
            <Text style={styles.hint} numberOfLines={2}>
              {projectName ?? 'New project'}
            </Text>
          </>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  ringCompact: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  ringInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ringInnerCompact: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapCompact: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  initial: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: 1,
  },
  hint: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.85)',
    textAlign: 'center',
    maxWidth: 200,
  },
});
