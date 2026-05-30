import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LaunchAnimatedBackdrop } from './LaunchAnimatedBackdrop';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { colors, radius, spacing } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

/** Brief branded screen while auth session restores on cold start. */
export function LaunchHoldScreen() {
  const cardEntrance = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardEntrance, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    const spinLoop = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );
    shimmerLoop.start();
    spinLoop.start();
    return () => {
      shimmerLoop.stop();
      spinLoop.stop();
    };
  }, [cardEntrance, ringSpin, shimmer]);

  const cardScale = cardEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });
  const cardOpacity = cardEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const shimmerWidth = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['18%', '88%'],
  });
  const ringRotate = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <LaunchAnimatedBackdrop />
      <LinearGradient
        colors={['rgba(12, 24, 41, 0.35)', 'rgba(15, 40, 62, 0.25)', 'rgba(12, 24, 41, 0.5)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.heroTint]}
        pointerEvents="none"
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <Animated.View
            style={[styles.logoRing, { transform: [{ rotate: ringRotate }] }]}
          >
            <View style={styles.logoRingInner} />
          </Animated.View>
          <View style={styles.logoWrap}>
            <ThaneFlatsLogo size={72} showWordmark animated onDark />
          </View>
          <View style={styles.locationChip}>
            <Ionicons name="location" size={13} color={colors.goldAccent} />
            <Text style={styles.locationText}>Thane · Maharashtra</Text>
          </View>
          <Text style={styles.tagline}>Your Thane property companion</Text>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: shimmerWidth }]}>
              <LinearGradient
                colors={[colors.goldAccent, colors.teal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <Text style={styles.status}>Starting Thane Flats…</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navyDeep,
  },
  heroTint: {
    opacity: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxxl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  logoRing: {
    position: 'absolute',
    top: '22%',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRingInner: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  logoWrap: {
    marginBottom: spacing.lg,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(252, 211, 77, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.28)',
    marginBottom: spacing.sm,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.goldSoft,
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.82)',
    textAlign: 'center',
    lineHeight: 21,
  },
  footer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(248, 250, 252, 0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.72)',
  },
});
