import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

const brandMark = require('../../../assets/logo-mark.png');
const brandMarkLg = require('../../../assets/logo-mark-lg.png');

type Props = {
  size?: number;
  /** Show “Thane Flats” beside the mark */
  showWordmark?: boolean;
  /** Inline element after the wordmark (e.g. plan usage %). */
  trailing?: React.ReactNode;
  /** Subtitle under wordmark (e.g. loading message) */
  subtitle?: string;
  /** Gentle pulse while loading */
  animated?: boolean;
  /** Light text for dark header backgrounds */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Thane Flats brand mark (Play Store medallion asset). */
export function ThaneFlatsLogo({
  size = 36,
  showWordmark = false,
  trailing,
  subtitle,
  animated = false,
  onDark = false,
  style,
}: Props) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) {
      spin.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animated, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const markSize = size;
  const source = markSize >= 64 ? brandMarkLg : brandMark;
  const ringSize = markSize + 18;
  const ringWidth = Math.max(2, Math.round(markSize * 0.045));

  const mark = (
    <Image
      source={source}
      style={{
        width: markSize,
        height: markSize,
        borderRadius: markSize / 2,
      }}
      resizeMode="contain"
      accessibilityLabel="Thane Flats"
    />
  );

  const animatedMark = animated ? (
    <View
      style={[
        styles.spinnerWrap,
        { width: ringSize, height: ringSize },
      ]}
    >
      <Animated.View
        style={[
          styles.spinRing,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: ringWidth,
            transform: [{ rotate }],
          },
        ]}
      />
      <View style={styles.markCenter}>{mark}</View>
    </View>
  ) : (
    mark
  );

  if (!showWordmark && !subtitle) {
    return <View style={[styles.row, style]}>{animatedMark}</View>;
  }

  return (
    <View style={[styles.row, style]}>
      {animatedMark}
      <View style={styles.textCol}>
        <View style={styles.wordmarkRow}>
          <Text
            style={[
              styles.wordmark,
              onDark && styles.wordmarkDark,
              { fontSize: Math.max(13, size * 0.38) },
            ]}
            numberOfLines={1}
          >
            Thane Flats
          </Text>
          {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </View>
        {subtitle ? (
          <Text
            style={[styles.subtitle, onDark && styles.subtitleDark]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinRing: {
    position: 'absolute',
    borderColor: 'rgba(13, 148, 136, 0.18)',
    borderTopColor: '#0d9488',
    borderRightColor: '#14b8a6',
  },
  markCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textCol: {
    flexShrink: 1,
    minWidth: 0,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.3,
    color: colors.navy,
  },
  wordmarkDark: {
    color: colors.heroText,
  },
  trailing: {
    flexShrink: 0,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
  },
  subtitleDark: {
    color: 'rgba(248, 250, 252, 0.75)',
  },
});
