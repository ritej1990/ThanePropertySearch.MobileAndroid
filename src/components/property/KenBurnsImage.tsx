import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PropertyImage } from './PropertyImage';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

type Props = {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  /** Picks one of a few pan/zoom patterns so cards don't all move identically. */
  variant?: number;
  quietLoading?: boolean;
};

const PATTERNS = [
  { fromScale: 1, toScale: 1.14, fromX: 0, toX: -10 },
  { fromScale: 1.12, toScale: 1, fromX: 10, toX: 0 },
  { fromScale: 1, toScale: 1.12, fromX: -8, toX: 8 },
  { fromScale: 1.1, toScale: 1.1, fromX: 9, toX: -9 },
];

const DURATION_MS = 3200;

/** Slow continuous zoom + pan ("Ken Burns") on a card photo — purely decorative, no layout impact. */
export function KenBurnsImage({ uri, style, variant = 0, quietLoading }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const pattern = PATTERNS[Math.abs(variant) % PATTERNS.length];

  useEffect(() => {
    progress.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: DURATION_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: DURATION_MS,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress, uri]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [pattern.fromScale, pattern.toScale],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [pattern.fromX, pattern.toX],
  });

  return (
    <Animated.View style={[style, { transform: [{ scale }, { translateX }] }]}>
      <PropertyImage uri={uri} style={styles.fill} quietLoading={quietLoading} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
});
