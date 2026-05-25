import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { LaunchAnimatedBackdrop } from './LaunchAnimatedBackdrop';
import { LaunchMarketShowcase } from './LaunchMarketShowcase';
import { colors, gradients, radius, spacing, typography } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

const MIN_VISIBLE_MS = 2800;
const EXIT_MS = 420;
const LAUNCH_SAFETY_MS = MIN_VISIBLE_MS + EXIT_MS + 800;

const STATUS_LINES = [
  'Buy · Rent · Sell · PG in Thane…',
  'Verified listings & live maps…',
  'Search homes or post your property…',
] as const;

const TRUST_ITEMS = [
  { icon: 'shield-checkmark' as const, label: 'Verified' },
  { icon: 'location' as const, label: 'Thane local' },
  { icon: 'flash' as const, label: 'Fast search' },
] as const;

type Props = {
  authReady: boolean;
  onComplete: () => void;
};

export function AppLaunchScreen({ authReady, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const [statusIndex, setStatusIndex] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const finishedRef = useRef(false);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const headerEntrance = useRef(new Animated.Value(0)).current;
  const showcaseEntrance = useRef(new Animated.Value(0)).current;
  const trustEntrance = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(1)).current;
  const loadProgress = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(headerEntrance, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(showcaseEntrance, {
        toValue: 1,
        duration: 680,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(trustEntrance, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    Animated.timing(loadProgress, {
      toValue: 1,
      duration: MIN_VISIBLE_MS,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [headerEntrance, loadProgress, logoGlow, showcaseEntrance, trustEntrance]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(statusOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(statusOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
      setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 1300);
    return () => clearInterval(interval);
  }, [statusOpacity]);

  useEffect(() => {
    if (!authReady || !minElapsed || finishedRef.current) return;
    finishedRef.current = true;

    let completed = false;
    const finishBoot = () => {
      if (completed) return;
      completed = true;
      onComplete();
    };

    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: EXIT_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(({ finished }) => {
      if (finished) finishBoot();
    });

    const safety = setTimeout(finishBoot, EXIT_MS + 400);
    return () => clearTimeout(safety);
  }, [authReady, minElapsed, onComplete, screenOpacity]);

  useEffect(() => {
    const safety = setTimeout(() => {
      if (finishedRef.current) return;
      if (!authReady || !minElapsed) return;
      finishedRef.current = true;
      onComplete();
    }, LAUNCH_SAFETY_MS);
    return () => clearTimeout(safety);
  }, [authReady, minElapsed, onComplete]);

  const headerTranslateY = headerEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const trustOpacity = trustEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const trustTranslateY = trustEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });
  const progressWidth = loadProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const logoScale = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      <StatusBar style="light" />
      <LaunchAnimatedBackdrop />
      <LinearGradient
        colors={[...gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.heroTint]}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <Animated.View
          style={{
            opacity: headerEntrance,
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <ThaneFlatsLogo size={56} showWordmark animated onDark />
          </Animated.View>
          <Text style={styles.tagline}>Your Thane property companion</Text>
          <Text style={styles.lead} numberOfLines={2}>
            Buy, rent, sell & list in Thane
          </Text>
        </Animated.View>

        <LaunchMarketShowcase entrance={showcaseEntrance} />

        <Animated.View
          style={[
            styles.trustRow,
            {
              opacity: trustOpacity,
              transform: [{ translateY: trustTranslateY }],
            },
          ]}
        >
          {TRUST_ITEMS.map((item) => (
            <View key={item.label} style={styles.trustPill}>
              <Ionicons name={item.icon} size={14} color={colors.goldAccent} />
              <Text style={styles.trustText}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
              <LinearGradient
                colors={[colors.goldAccent, colors.gold, colors.teal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <Animated.Text style={[styles.status, { opacity: statusOpacity }]}>
            {STATUS_LINES[statusIndex]}
          </Animated.Text>
          <View style={styles.dots}>
            {STATUS_LINES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === statusIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navyDeep,
  },
  heroTint: {
    opacity: 0.42,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: 18,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.3,
  },
  lead: {
    ...typography.heroLead,
    color: 'rgba(248, 250, 252, 0.88)',
    marginTop: spacing.xs,
    maxWidth: 320,
    lineHeight: 21,
    fontSize: 14,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.heroText,
    opacity: 0.92,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    width: '100%',
    maxWidth: 280,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(248, 250, 252, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.82)',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(248, 250, 252, 0.25)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.goldAccent,
  },
});
