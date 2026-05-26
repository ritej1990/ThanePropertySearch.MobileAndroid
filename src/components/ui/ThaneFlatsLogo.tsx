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
  subtitle,
  animated = false,
  onDark = false,
  style,
}: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, pulse]);

  const markSize = size;
  const source = markSize >= 64 ? brandMarkLg : brandMark;

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
    <Animated.View style={{ transform: [{ scale: pulse }] }}>{mark}</Animated.View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textCol: {
    flexShrink: 1,
    minWidth: 0,
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.3,
    color: colors.navy,
  },
  wordmarkDark: {
    color: colors.heroText,
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
