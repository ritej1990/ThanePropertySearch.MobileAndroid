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
import { AiEngineBadge } from './AiEngineBadge';
import { LaunchValueTicker } from './LaunchValueTicker';
import { colors, radius, spacing, typography } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';
import { useTranslation } from '../../context/LocaleContext';

const MIN_VISIBLE_MS = 2800;
const EXIT_MS = 420;
const LAUNCH_SAFETY_MS = MIN_VISIBLE_MS + EXIT_MS + 800;

const FEATURE_KEYS = [
  { icon: 'sparkles' as const, titleKey: 'launch.featureAiTitle', descKey: 'launch.featureAiDesc', tint: '#7c3aed', border: 'rgba(167, 139, 250, 0.4)' },
  { icon: 'pricetag' as const, titleKey: 'launch.featureFeesTitle', descKey: 'launch.featureFeesDesc', tint: '#c9a227', border: 'rgba(252, 211, 77, 0.4)' },
  { icon: 'home' as const, titleKey: 'launch.featureOwnersTitle', descKey: 'launch.featureOwnersDesc', tint: '#0d9488', border: 'rgba(45, 212, 191, 0.4)' },
  { icon: 'briefcase' as const, titleKey: 'launch.featureAgentsTitle', descKey: 'launch.featureAgentsDesc', tint: '#2563eb', border: 'rgba(37, 99, 235, 0.45)' },
] as const;

const STATUS_KEYS = ['launch.status1', 'launch.status2', 'launch.status3', 'launch.status4', 'launch.status5'] as const;
const STEP_KEYS = ['launch.stepProfile', 'launch.stepListings', 'launch.stepMaps'] as const;

type Props = {
  authReady: boolean;
  onComplete: () => void;
};

export function AppLaunchScreen({ authReady, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [statusIndex, setStatusIndex] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const finishedRef = useRef(false);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const headerEntrance = useRef(new Animated.Value(0)).current;
  const showcaseEntrance = useRef(new Animated.Value(0)).current;
  const featuresEntrance = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(1)).current;
  const loadProgress = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Animated.stagger(90, [
      Animated.timing(headerEntrance, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(showcaseEntrance, {
        toValue: 1,
        duration: 640,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(featuresEntrance, {
        toValue: 1,
        duration: 480,
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
  }, [featuresEntrance, headerEntrance, loadProgress, logoGlow, showcaseEntrance]);

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
      setStatusIndex((i) => (i + 1) % STATUS_KEYS.length);
    }, 1400);
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
    outputRange: [24, 0],
  });
  const featuresOpacity = featuresEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const featuresTranslateY = featuresEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const progressWidth = loadProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const logoScale = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });
  const activeStep = Math.min(
    STEP_KEYS.length - 1,
    Math.floor(statusIndex)
  );

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      <StatusBar style="light" />
      <LaunchAnimatedBackdrop />
      <LinearGradient
        colors={['rgba(12, 24, 41, 0.35)', 'rgba(15, 40, 62, 0.25)', 'rgba(12, 24, 41, 0.5)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.heroTint]}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.md,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.headerCard,
            {
              opacity: headerEntrance,
              transform: [{ translateY: headerTranslateY }],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <Animated.View style={{ transform: [{ scale: logoScale }] }}>
              <ThaneFlatsLogo size={44} showWordmark animated onDark />
            </Animated.View>
            <AiEngineBadge />
          </View>

          <View style={styles.locationChip}>
            <Ionicons name="location" size={12} color={colors.goldAccent} />
            <Text style={styles.locationText}>{t('launch.location')}</Text>
          </View>
          <Text style={styles.tagline}>{t('launch.tagline')}</Text>
          <Text style={styles.lead} numberOfLines={2}>
            {t('launch.lead')}
          </Text>

          <LaunchValueTicker />

          <View style={styles.badgeRow}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={colors.navyDeep} />
              <Text style={styles.aiBadgeText}>{t('launch.aiPowered')}</Text>
            </View>
            <View style={styles.feeBadge}>
              <Ionicons name="pricetag" size={12} color={colors.heroText} />
              <Text style={styles.feeBadgeText}>{t('launch.lowestFeesBadge')}</Text>
            </View>
          </View>
        </Animated.View>

        <LaunchMarketShowcase entrance={showcaseEntrance} />

        <Animated.View
          style={[
            styles.featureGrid,
            {
              opacity: featuresOpacity,
              transform: [{ translateY: featuresTranslateY }],
            },
          ]}
        >
          {FEATURE_KEYS.map((item) => (
            <View
              key={item.titleKey}
              style={[styles.featureCard, { borderColor: item.border }]}
            >
              <View style={[styles.featureIcon, { backgroundColor: item.tint }]}>
                <Ionicons name={item.icon} size={16} color={colors.heroText} />
              </View>
              <Text style={styles.featureTitle}>{t(item.titleKey)}</Text>
              <Text style={styles.featureDesc} numberOfLines={1}>
                {t(item.descKey)}
              </Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.stepRow}>
            {STEP_KEYS.map((stepKey, i) => (
              <View key={stepKey} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    i <= activeStep && styles.stepDotActive,
                  ]}
                />
                <Text
                  style={[
                    styles.stepLabel,
                    i <= activeStep && styles.stepLabelActive,
                  ]}
                >
                  {t(stepKey)}
                </Text>
              </View>
            ))}
          </View>
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
            {t(STATUS_KEYS[statusIndex])}
          </Animated.Text>
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
    opacity: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  headerCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(201, 162, 39, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.32)',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldSoft,
    letterSpacing: 0.2,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: 17,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  lead: {
    ...typography.heroLead,
    color: 'rgba(248, 250, 252, 0.82)',
    marginTop: spacing.xs,
    maxWidth: 300,
    lineHeight: 20,
    fontSize: 13,
    textAlign: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.goldAccent,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.navyDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  feeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(13, 148, 136, 0.32)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.45)',
  },
  feeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.heroText,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  featureCard: {
    width: '47%',
    maxWidth: 168,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.heroText,
  },
  featureDesc: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(148, 163, 184, 0.95)',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(7, 15, 28, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.12)',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    width: '100%',
    maxWidth: 280,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(248, 250, 252, 0.2)',
  },
  stepDotActive: {
    backgroundColor: colors.goldAccent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stepLabelActive: {
    color: 'rgba(248, 250, 252, 0.88)',
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    maxWidth: 280,
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
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.78)',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: spacing.sm,
  },
});
