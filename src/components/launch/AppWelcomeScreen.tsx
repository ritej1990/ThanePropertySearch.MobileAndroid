import React, { useEffect, useRef } from 'react';
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
import { LoginBackdrop } from '../auth/LoginBackdrop';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import type { AuthProfileSnapshot } from '../../storage/tokenStorage';
import {
  getProfileFirstName,
  getProfileInitials,
  getRoleLabel,
} from '../../utils/profileDisplay';
import { colors, gradients, radius, spacing } from '../../theme';

const WELCOME_MS = 3000;
const EXIT_MS = 400;

type Props = {
  profile: AuthProfileSnapshot | null;
  onComplete: () => void;
};

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AppWelcomeScreen({ profile, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const finishedRef = useRef(false);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.92)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;

  const firstName = getProfileFirstName(profile?.fullName);
  const displayName =
    profile?.fullName?.trim() || profile?.username?.trim() || 'there';
  const initials = getProfileInitials(profile?.fullName);
  const roleLabel = getRoleLabel(profile?.role);
  const greeting = getTimeGreeting();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: WELCOME_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulse, {
          toValue: 1.05,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const timer = setTimeout(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      pulseLoop.stop();
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onComplete();
      });
    }, WELCOME_MS);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [
    avatarPulse,
    contentOpacity,
    contentScale,
    onComplete,
    progress,
    screenOpacity,
  ]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      <StatusBar style="light" />
      <LoginBackdrop />
      <LinearGradient
        colors={[...gradients.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xxl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <ThaneFlatsLogo size={40} showWordmark onDark />

        <Animated.View
          style={[
            styles.heroBlock,
            {
              opacity: contentOpacity,
              transform: [{ scale: contentScale }],
            },
          ]}
        >
          <Animated.View
            style={[styles.avatarRing, { transform: [{ scale: avatarPulse }] }]}
          >
            <LinearGradient
              colors={[...gradients.goldBadge]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={styles.waveIcon}>
              <Ionicons name="hand-right" size={18} color={colors.navyDeep} />
            </View>
          </Animated.View>

          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.welcomeLine}>Welcome back to Thane Flats</Text>

          <View style={styles.metaRow}>
            <Text style={styles.fullName} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.hint}>Getting things ready for you…</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  heroBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  avatarRing: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.navyDeep,
  },
  waveIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.heroText,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.85)',
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.8,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  welcomeLine: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.goldSoft,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    maxWidth: '100%',
  },
  fullName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.75)',
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 183, 0.45)',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6ee7b7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    gap: spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(248, 250, 252, 0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.goldAccent,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.65)',
    textAlign: 'center',
  },
});
