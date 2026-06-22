import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

type IconName = keyof typeof Ionicons.glyphMap;

type TickerItem = {
  icon: IconName;
  text: string;
};

const ITEMS: TickerItem[] = [
  { icon: 'sparkles', text: 'AI-matched listings, picked for you' },
  { icon: 'pricetag', text: 'Lowest service charges in Thane' },
  { icon: 'key', text: 'Built for tenants & buyers' },
  { icon: 'home', text: 'Built for property owners' },
  { icon: 'briefcase', text: 'Built for agents & brokers' },
];

const HOLD_MS = 1900;
const TRANSITION_MS = 260;

/** Rotating one-line value-prop strip — cycles AI, pricing & role messaging on the splash. */
export function LaunchValueTicker() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: TRANSITION_MS,
            easing: Easing.in(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(translateY, {
            toValue: -8,
            duration: TRANSITION_MS,
            easing: Easing.in(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]).start(() => {
        setIndex((i) => (i + 1) % ITEMS.length);
        translateY.setValue(8);
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: TRANSITION_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: TRANSITION_MS,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]).start();
      });
    }, HOLD_MS);
    return () => clearInterval(interval);
  }, [opacity, translateY]);

  const item = ITEMS[index];

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.row, { opacity, transform: [{ translateY }] }]}
      >
        <Ionicons name={item.icon} size={13} color={colors.goldAccent} />
        <Text style={styles.text} numberOfLines={1}>
          {item.text}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(248, 250, 252, 0.92)',
    letterSpacing: 0.1,
  },
});
