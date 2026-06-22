import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { USE_NATIVE_DRIVER } from '../../utils/animation';

type IconName = keyof typeof Ionicons.glyphMap;

export type MarketIntent = {
  key: string;
  label: string;
  icon: IconName;
  subtitle: string;
  accent: string;
  accentSoft: string;
  gradient: readonly [string, string];
};

export const MARKET_INTENTS: MarketIntent[] = [
  {
    key: 'buy',
    label: 'Buy',
    icon: 'home',
    subtitle: 'Resale flats & ready homes',
    accent: '#2563eb',
    accentSoft: 'rgba(37, 99, 235, 0.25)',
    gradient: ['#1e3a8a', '#2563eb'],
  },
  {
    key: 'rent',
    label: 'Rent',
    icon: 'key',
    subtitle: 'Monthly rentals across Thane',
    accent: '#0d9488',
    accentSoft: 'rgba(13, 148, 136, 0.28)',
    gradient: ['#0f766e', '#14b8a6'],
  },
  {
    key: 'sell',
    label: 'Sell',
    icon: 'pricetag',
    subtitle: 'List & reach serious buyers',
    accent: '#c9a227',
    accentSoft: 'rgba(201, 162, 39, 0.3)',
    gradient: ['#92400e', '#d97706'],
  },
  {
    key: 'owner',
    label: 'Owner',
    icon: 'business',
    subtitle: 'List & manage your property, AI-priced',
    accent: '#0891b2',
    accentSoft: 'rgba(8, 145, 178, 0.28)',
    gradient: ['#0e7490', '#06b6d4'],
  },
  {
    key: 'agent',
    label: 'Agent',
    icon: 'briefcase',
    subtitle: 'Brokers & agencies, verified leads',
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.28)',
    gradient: ['#5b21b6', '#8b5cf6'],
  },
];

const CYCLE_MS = 1500;

type Props = {
  entrance: Animated.Value;
};

function IntentPill({
  intent,
  active,
  onPress,
}: {
  intent: MarketIntent;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(active ? 1 : 0.92)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.06 : 0.92,
      friction: 6,
      tension: 120,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [active, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          active && {
            backgroundColor: intent.accentSoft,
            borderColor: intent.accent,
          },
          pressed && styles.pillPressed,
        ]}
      >
        <Ionicons
          name={intent.icon}
          size={14}
          color={active ? intent.accent : 'rgba(248,250,252,0.75)'}
        />
        <Text
          style={[
            styles.pillLabel,
            active && { color: colors.heroText, fontWeight: '800' },
          ]}
        >
          {intent.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function LaunchMarketShowcase({ entrance }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroScale = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  const active = MARKET_INTENTS[activeIndex];

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.85,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.35,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    spinLoop.start();
    floatLoop.start();
    glowLoop.start();
    return () => {
      spinLoop.stop();
      floatLoop.stop();
      glowLoop.stop();
    };
  }, [floatY, glowPulse, ringSpin]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(heroScale, {
            toValue: 0.88,
            duration: 160,
            easing: Easing.in(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(heroOpacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]).start(() => {
        setActiveIndex((i) => (i + 1) % MARKET_INTENTS.length);
        Animated.parallel([
          Animated.spring(heroScale, {
            toValue: 1,
            friction: 5,
            tension: 90,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(heroOpacity, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]).start();
      });
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, [heroOpacity, heroScale]);

  const containerOpacity = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const containerY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });
  const floatTranslate = floatY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });
  const ringRotate = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: containerOpacity,
          transform: [{ translateY: containerY }],
        },
      ]}
    >
      <View style={styles.glassPanel}>
        <Text style={styles.panelEyebrow}>Everyone is welcome here</Text>
        <View style={styles.pillRow}>
        {MARKET_INTENTS.map((intent, i) => (
          <IntentPill
            key={intent.key}
            intent={intent}
            active={i === activeIndex}
            onPress={() => setActiveIndex(i)}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.heroOuter,
          { transform: [{ translateY: floatTranslate }] },
        ]}
      >
        <Animated.View
          style={[styles.orbitRing, { transform: [{ rotate: ringRotate }] }]}
        >
          {MARKET_INTENTS.map((intent, i) => {
            const angle = (i / MARKET_INTENTS.length) * 2 * Math.PI - Math.PI / 2;
            const x = Math.cos(angle) * 58;
            const y = Math.sin(angle) * 58;
            const isActive = i === activeIndex;
            return (
              <View
                key={intent.key}
                style={[
                  styles.orbitDot,
                  {
                    left: '50%',
                    top: '50%',
                    marginLeft: x - 14,
                    marginTop: y - 14,
                    backgroundColor: isActive ? intent.accent : 'rgba(248,250,252,0.2)',
                    transform: [{ scale: isActive ? 1.15 : 0.85 }],
                  },
                ]}
              >
                <Ionicons
                  name={intent.icon}
                  size={12}
                  color={isActive ? colors.heroText : 'rgba(248,250,252,0.6)'}
                />
              </View>
            );
          })}
        </Animated.View>

        <Animated.View
          style={[
            styles.heroGlow,
            {
              backgroundColor: active.accent,
              opacity: glowPulse,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: heroOpacity,
              transform: [{ scale: heroScale }],
            },
          ]}
        >
          <LinearGradient
            colors={[...active.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroIconRing}
          >
            <View style={styles.heroIconInner}>
              <Ionicons name={active.icon} size={36} color={colors.heroText} />
            </View>
          </LinearGradient>
          <Text style={styles.heroLabel}>{active.label}</Text>
          <Text style={styles.heroSub}>{active.subtitle}</Text>
        </Animated.View>
      </Animated.View>

      <View style={styles.taglineRow}>
        {['Search', 'Post', 'Chat', 'Maps'].map((word, i) => (
          <LaunchTagChip key={word} label={word} delay={i * 80} entrance={entrance} />
        ))}
      </View>
      </View>
    </Animated.View>
  );
}

function LaunchTagChip({
  label,
  delay,
  entrance,
}: {
  label: string;
  delay: number;
  entrance: Animated.Value;
}) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1800 + delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1800 + delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, delay]);

  const chipOpacity = entrance.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  const bobY = bob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  return (
    <Animated.View
      style={{
        opacity: chipOpacity,
        transform: [{ translateY: bobY }],
      }}
    >
      <View style={styles.tagChip}>
        <Text style={styles.tagChipText}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  glassPanel: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  panelEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(248, 250, 252, 0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(248, 250, 252, 0.78)',
  },
  pillPressed: {
    opacity: 0.88,
  },
  heroOuter: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  orbitRing: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  heroCard: {
    width: 148,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: spacing.sm,
  },
  heroIconInner: {
    flex: 1,
    borderRadius: 41,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.82)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  taglineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(248, 250, 252, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldSoft,
    letterSpacing: 0.3,
  },
});
