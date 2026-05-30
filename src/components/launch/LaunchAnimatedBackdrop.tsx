import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

/** Brand-aligned dark backdrop for launch / splash screens. */
export function LaunchAnimatedBackdrop() {
  const goldDrift = useRef(new Animated.Value(0)).current;
  const tealDrift = useRef(new Animated.Value(0)).current;
  const goldPulse = useRef(new Animated.Value(0.18)).current;
  const tealPulse = useRef(new Animated.Value(0.14)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (value: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );

    const pulse = (value: Animated.Value, low: number, high: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: high,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(value, {
            toValue: low,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 4800,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );

    const a = drift(goldDrift, 5200);
    const b = drift(tealDrift, 5800);
    const p1 = pulse(goldPulse, 0.12, 0.28);
    const p2 = pulse(tealPulse, 0.1, 0.22);

    a.start();
    b.start();
    p1.start();
    p2.start();
    shimmerLoop.start();

    return () => {
      a.stop();
      b.stop();
      p1.stop();
      p2.stop();
      shimmerLoop.stop();
    };
  }, [goldDrift, goldPulse, shimmer, tealDrift, tealPulse]);

  const goldX = goldDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });
  const goldY = goldDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });
  const tealX = tealDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const tealY = tealDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const beamX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 400],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Deep navy base — matches thaneflats.com hero */}
      <LinearGradient
        colors={['#0c1829', '#0f2847', '#122d4a', '#0c1829']}
        locations={[0, 0.38, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Teal horizon glow (upper-mid) */}
      <LinearGradient
        colors={['transparent', 'rgba(13, 148, 136, 0.22)', 'transparent']}
        locations={[0.2, 0.5, 0.85]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Gold warmth (top-right) */}
      <LinearGradient
        colors={['rgba(201, 162, 39, 0.12)', 'transparent', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.dotGrid}>
        {DOTS.map((dot, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                top: dot.top,
                left: dot.left,
                opacity: dot.o,
                width: dot.s,
                height: dot.s,
                borderRadius: dot.s / 2,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={{ transform: [{ translateX: goldX }, { translateY: goldY }] }}
      >
        <Animated.View style={[styles.goldOrb, { opacity: goldPulse }]} />
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: tealX }, { translateY: tealY }],
        }}
      >
        <Animated.View style={[styles.tealOrb, { opacity: tealPulse }]} />
      </Animated.View>

      <Animated.View
        style={[styles.lightBeam, { transform: [{ translateX: beamX }] }]}
      />

      <View style={styles.skyline}>
        {SKYLINE.map((block, i) => (
          <View
            key={i}
            style={[
              styles.skylineBlock,
              {
                width: block.w,
                height: block.h,
                opacity: block.o,
                borderTopLeftRadius: block.r,
                borderTopRightRadius: block.r,
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom vignette — keeps footer readable, no white wash */}
      <LinearGradient
        colors={['transparent', 'rgba(12, 24, 41, 0.75)', 'rgba(7, 15, 28, 0.95)']}
        locations={[0.55, 0.82, 1]}
        style={styles.bottomVignette}
      />

      {/* Brand accent stripe at bottom */}
      <LinearGradient
        colors={[colors.gold, colors.teal, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.brandStripe}
      />
    </View>
  );
}

const SKYLINE = [
  { w: 28, h: 52, o: 0.35, r: 3 },
  { w: 18, h: 38, o: 0.25, r: 2 },
  { w: 34, h: 68, o: 0.45, r: 4 },
  { w: 22, h: 44, o: 0.3, r: 2 },
  { w: 40, h: 78, o: 0.5, r: 5 },
  { w: 26, h: 56, o: 0.38, r: 3 },
  { w: 30, h: 62, o: 0.42, r: 4 },
  { w: 20, h: 40, o: 0.28, r: 2 },
  { w: 36, h: 72, o: 0.44, r: 4 },
  { w: 24, h: 48, o: 0.32, r: 3 },
] as const;

const DOTS = [
  { top: '8%', left: '12%', s: 2, o: 0.35 },
  { top: '14%', left: '78%', s: 2, o: 0.28 },
  { top: '22%', left: '45%', s: 2, o: 0.22 },
  { top: '32%', left: '88%', s: 2, o: 0.3 },
  { top: '18%', left: '28%', s: 2, o: 0.2 },
  { top: '42%', left: '8%', s: 2, o: 0.25 },
  { top: '48%', left: '62%', s: 2, o: 0.22 },
] as const;

const styles = StyleSheet.create({
  dotGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  dot: {
    position: 'absolute',
    backgroundColor: 'rgba(252, 211, 77, 0.55)',
  },
  skyline: {
    position: 'absolute',
    bottom: '18%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  skylineBlock: {
    backgroundColor: 'rgba(13, 148, 136, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.12)',
    borderBottomWidth: 0,
  },
  goldOrb: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201, 162, 39, 0.28)',
  },
  tealOrb: {
    position: 'absolute',
    top: 120,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(13, 148, 136, 0.24)',
  },
  lightBeam: {
    position: 'absolute',
    top: '18%',
    left: 0,
    width: 72,
    height: '38%',
    borderRadius: 36,
    backgroundColor: 'rgba(94, 234, 212, 0.04)',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  brandStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.85,
  },
});
