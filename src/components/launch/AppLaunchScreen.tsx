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
import { LoginBackdrop } from '../auth/LoginBackdrop';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { colors, gradients, radius, spacing, typography } from '../../theme';

const MIN_VISIBLE_MS = 2600;
const EXIT_MS = 420;

const STATUS_LINES = [
  'Curating Thane homes for you…',
  'Maps, filters & verified listings…',
  'Search flats · Post your property…',
] as const;

const TRUST_ITEMS = [
  { icon: 'shield-checkmark' as const, label: 'Verified listings' },
  { icon: 'location' as const, label: 'Thane local' },
  { icon: 'people' as const, label: 'Owners & buyers' },
] as const;

type Props = {
  authReady: boolean;
  onComplete: () => void;
};

type ActionCardProps = {
  variant: 'search' | 'post';
  delay: number;
  entrance: Animated.Value;
};

function LaunchActionCard({ variant, delay, entrance }: ActionCardProps) {
  const isSearch = variant === 'search';
  const float = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const plusSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: isSearch ? 2200 : 2600,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: isSearch ? 2200 : 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.12,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    pulseLoop.start();

    let shimmerLoop: Animated.CompositeAnimation | undefined;
    let spinLoop: Animated.CompositeAnimation | undefined;

    if (isSearch) {
      shimmerLoop = Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      );
      shimmerLoop.start();
    } else {
      spinLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(plusSpin, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(plusSpin, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      spinLoop.start();
    }

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
      shimmerLoop?.stop();
      spinLoop?.stop();
    };
  }, [delay, float, iconPulse, isSearch, plusSpin, shimmer]);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, isSearch ? -6 : -5],
  });

  const cardOpacity = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardTranslateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 120],
  });

  const plusRotate = plusSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Animated.View
      style={[
        styles.actionCard,
        isSearch ? styles.actionCardSearch : styles.actionCardPost,
        {
          opacity: cardOpacity,
          transform: [{ translateY: Animated.add(cardTranslateY, translateY) }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.actionIconWrap,
          isSearch ? styles.actionIconSearch : styles.actionIconPost,
          { transform: [{ scale: iconPulse }] },
        ]}
      >
        {isSearch ? (
          <Ionicons name="search" size={26} color={colors.heroText} />
        ) : (
          <Animated.View style={{ transform: [{ rotate: plusRotate }] }}>
            <Ionicons name="add-circle" size={28} color={colors.heroText} />
          </Animated.View>
        )}
      </Animated.View>

      <Text style={styles.actionTitle}>
        {isSearch ? 'Search properties' : 'Post property'}
      </Text>
      <Text style={styles.actionSub}>
        {isSearch
          ? 'Browse buy & rent across Thane'
          : 'List your flat in minutes'}
      </Text>

      {isSearch ? (
        <View style={styles.mockSearch}>
          <Ionicons name="location-outline" size={14} color={colors.slateLight} />
          <Text style={styles.mockSearchText} numberOfLines={1}>
            Search area in Thane…
          </Text>
          <Animated.View
            pointerEvents="none"
            style={[styles.mockSearchShimmer, { transform: [{ translateX: shimmerX }] }]}
          />
        </View>
      ) : (
        <View style={styles.mockSteps}>
          {['Details', 'Photos', 'Publish'].map((step, i) => (
            <View key={step} style={styles.mockStep}>
              <View
                style={[
                  styles.mockStepDot,
                  i === 2 && styles.mockStepDotActive,
                ]}
              />
              <Text
                style={[
                  styles.mockStepText,
                  i === 2 && styles.mockStepTextActive,
                ]}
              >
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

export function AppLaunchScreen({ authReady, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const [statusIndex, setStatusIndex] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);
  const finishedRef = useRef(false);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const headerEntrance = useRef(new Animated.Value(0)).current;
  const cardsEntrance = useRef(new Animated.Value(0)).current;
  const trustEntrance = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerEntrance, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardsEntrance, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(trustEntrance, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardsEntrance, headerEntrance, trustEntrance]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(statusOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(statusOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
      setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [statusOpacity]);

  useEffect(() => {
    if (!authReady || !minElapsed || finishedRef.current) return;
    finishedRef.current = true;

    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: EXIT_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [authReady, minElapsed, onComplete, screenOpacity]);

  const headerTranslateY = headerEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  const trustOpacity = trustEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const trustTranslateY = trustEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
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
            paddingTop: insets.top + spacing.xl,
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
          <ThaneFlatsLogo size={52} showWordmark animated onDark />
          <Text style={styles.tagline}>Thane's trusted property platform</Text>
          <Text style={styles.lead}>
            Search verified homes or post your listing — same experience as
            thaneflats.com
          </Text>
        </Animated.View>

        <View style={styles.cardsRow}>
          <LaunchActionCard
            variant="search"
            delay={0}
            entrance={cardsEntrance}
          />
          <LaunchActionCard
            variant="post"
            delay={180}
            entrance={cardsEntrance}
          />
        </View>

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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  tagline: {
    marginTop: spacing.lg,
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.4,
  },
  lead: {
    ...typography.heroLead,
    color: 'rgba(248, 250, 252, 0.88)',
    marginTop: spacing.sm,
    maxWidth: 340,
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.xl,
  },
  actionCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    minHeight: 168,
    overflow: 'hidden',
  },
  actionCardSearch: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
  },
  actionCardPost: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderColor: 'rgba(52, 211, 153, 0.45)',
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionIconSearch: {
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.5)',
  },
  actionIconPost: {
    backgroundColor: 'rgba(15, 118, 110, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 183, 0.5)',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.heroText,
    marginBottom: 4,
  },
  actionSub: {
    fontSize: 11,
    color: 'rgba(248, 250, 252, 0.78)',
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  mockSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(248, 250, 252, 0.12)',
    overflow: 'hidden',
  },
  mockSearchText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.7)',
  },
  mockSearchShimmer: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: 36,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  mockSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: spacing.xs,
  },
  mockStep: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  mockStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(248, 250, 252, 0.35)',
  },
  mockStepDotActive: {
    backgroundColor: colors.goldAccent,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mockStepText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.55)',
  },
  mockStepTextActive: {
    color: colors.goldSoft,
    fontWeight: '800',
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
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.8)',
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
