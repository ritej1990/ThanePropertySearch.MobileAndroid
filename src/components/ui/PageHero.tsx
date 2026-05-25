import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, spacing } from '../../theme';

type Variant = 'owner' | 'builder' | 'user' | 'neutral';

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: Variant;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const VARIANT_GRADIENT: Record<Variant, readonly [string, string, ...string[]]> = {
  owner: gradients.ownerHero,
  builder: gradients.builder,
  user: gradients.hero,
  neutral: ['#1e293b', '#334155', '#475569'],
};

const VARIANT_ICON_BG: Record<Variant, string> = {
  owner: 'rgba(13, 148, 136, 0.35)',
  builder: 'rgba(109, 40, 217, 0.4)',
  user: 'rgba(37, 99, 235, 0.35)',
  neutral: 'rgba(255,255,255,0.12)',
};

export function PageHero({
  title,
  subtitle,
  icon = 'speedometer',
  variant = 'neutral',
  children,
  style,
}: Props) {
  return (
    <LinearGradient
      colors={[...VARIANT_GRADIENT[variant]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, style]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: VARIANT_ICON_BG[variant] }]}>
          <Ionicons name={icon} size={26} color={colors.heroText} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children ? <View style={styles.children}>{children}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textCol: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(248, 250, 252, 0.88)',
    lineHeight: 20,
    marginTop: 4,
  },
  children: {
    marginTop: spacing.md,
  },
});
