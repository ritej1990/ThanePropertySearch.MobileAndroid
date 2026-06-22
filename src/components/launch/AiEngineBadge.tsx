import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

const PARTICLES = [
  { angle: 20, dist: 30, size: 4, delay: 0 },
  { angle: 95, dist: 34, size: 3, delay: 240 },
  { angle: 165, dist: 28, size: 3.5, delay: 480 },
  { angle: 230, dist: 33, size: 3, delay: 120 },
  { angle: 300, dist: 29, size: 4, delay: 360 },
] as const;

function Particle({
  angle,
  dist,
  size,
  delay,
}: {
  angle: number;
  dist: number;
  size: number;
  delay: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, pulse]);

  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * dist;
  const y = Math.sin(rad) * dist;
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.95] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.15] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: x - size / 2,
        marginTop: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.goldAccent,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/** Animated central AI-engine emblem — rotating scan ring, pulsing core, drifting sparkle particles. */
export function AiEngineBadge() {
  const spin = useRef(new Animated.Value(0)).current;
  const corePulse = useRef(new Animated.Value(0)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );
    const coreLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(corePulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(corePulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(ringPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    spinLoop.start();
    coreLoop.start();
    ringLoop.start();
    return () => {
      spinLoop.stop();
      coreLoop.stop();
      ringLoop.stop();
    };
  }, [corePulse, ringPulse, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateReverse = spin.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const coreScale = corePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const ringScale = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.35] });
  const ringOpacity = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.expandRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
      />
      <Animated.View style={[styles.dashRing, { transform: [{ rotate }] }]} />
      <Animated.View style={[styles.dashRingInner, { transform: [{ rotate: rotateReverse }] }]} />

      {PARTICLES.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <Animated.View style={[styles.coreOuter, { transform: [{ scale: coreScale }] }]}>
        <LinearGradient
          colors={['#7c3aed', '#a78bfa', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coreGradient}
        >
          <Ionicons name="sparkles" size={22} color={colors.heroText} />
        </LinearGradient>
      </Animated.View>

      <View style={styles.labelPill}>
        <Text style={styles.labelText}>AI ENGINE LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  expandRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.7)',
  },
  dashRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    borderStyle: 'dashed',
  },
  dashRingInner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    borderStyle: 'dashed',
  },
  coreOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  coreGradient: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  labelPill: {
    position: 'absolute',
    bottom: -10,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(124, 58, 237, 0.9)',
  },
  labelText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: 0.6,
  },
});
