import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

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

/** Original Thane Flats mark — geometric building, no third-party artwork. */
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
  const bodyW = markSize * 0.42;
  const bodyH = markSize * 0.38;
  const roofH = markSize * 0.14;
  const win = markSize * 0.08;

  const mark = (
    <LinearGradient
      colors={['#0d9488', '#2563eb', '#c9a227']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.mark,
        {
          width: markSize,
          height: markSize,
          borderRadius: markSize * 0.22,
        },
      ]}
    >
      <View style={styles.building}>
        <View
          style={[
            styles.roof,
            {
              borderLeftWidth: bodyW * 0.55,
              borderRightWidth: bodyW * 0.55,
              borderBottomWidth: roofH,
              marginBottom: -1,
            },
          ]}
        />
        <View
          style={[
            styles.body,
            {
              width: bodyW,
              height: bodyH,
              borderRadius: markSize * 0.04,
            },
          ]}
        >
          <View style={styles.windows}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  width: win,
                  height: win,
                  borderRadius: win * 0.2,
                  backgroundColor: 'rgba(12, 24, 41, 0.35)',
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
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
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  building: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  roof: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(248, 250, 252, 0.95)',
  },
  body: {
    backgroundColor: 'rgba(248, 250, 252, 0.92)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 3,
  },
  windows: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 2,
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
