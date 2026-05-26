import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

/** Animated orbs and glow for launch / splash screens. */
export function LaunchAnimatedBackdrop() {
  const goldDrift = useRef(new Animated.Value(0)).current;
  const blueDrift = useRef(new Animated.Value(0)).current;
  const tealDrift = useRef(new Animated.Value(0)).current;
  const goldPulse = useRef(new Animated.Value(0.22)).current;
  const bluePulse = useRef(new Animated.Value(0.18)).current;
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
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );

    const a = drift(goldDrift, 5200);
    const b = drift(blueDrift, 6400);
    const c = drift(tealDrift, 5800);
    const p1 = pulse(goldPulse, 0.16, 0.32);
    const p2 = pulse(bluePulse, 0.12, 0.26);

    a.start();
    b.start();
    c.start();
    p1.start();
    p2.start();
    shimmerLoop.start();

    return () => {
      a.stop();
      b.stop();
      c.stop();
      p1.stop();
      p2.stop();
      shimmerLoop.stop();
    };
  }, [blueDrift, bluePulse, goldDrift, goldPulse, shimmer, tealDrift]);

  const goldX = goldDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 28],
  });
  const goldY = goldDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const blueX = blueDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -22],
  });
  const blueY = blueDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });
  const tealX = tealDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
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
      <LinearGradient
        colors={[...gradients.page]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[colors.navyDeep, '#1a4d6e', '#0e7490', 'transparent']}
        locations={[0, 0.4, 0.72, 1]}
        style={styles.heroBand}
      />
      <Animated.View
        style={{
          transform: [{ translateX: goldX }, { translateY: goldY }],
        }}
      >
        <Animated.View style={[styles.goldOrb, { opacity: goldPulse }]} />
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ translateX: blueX }, { translateY: blueY }],
        }}
      >
        <Animated.View style={[styles.blueOrb, { opacity: bluePulse }]} />
      </Animated.View>
      <Animated.View
        style={[
          styles.tealOrb,
          {
            transform: [{ translateX: tealX }, { translateY: tealY }],
          },
        ]}
      />
      <Animated.View
        style={[styles.lightBeam, { transform: [{ translateX: beamX }] }]}
      />
      <View style={styles.warmWash} />
    </View>
  );
}

const styles = StyleSheet.create({
  heroBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
  },
  goldOrb: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(201, 162, 39, 0.35)',
  },
  blueOrb: {
    position: 'absolute',
    top: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37, 99, 235, 0.28)',
  },
  tealOrb: {
    position: 'absolute',
    bottom: '38%',
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(13, 148, 136, 0.22)',
  },
  lightBeam: {
    position: 'absolute',
    top: '22%',
    left: 0,
    width: 80,
    height: '40%',
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  warmWash: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor: 'rgba(250, 248, 245, 0.5)',
  },
});
