import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../../context/LocaleContext';
import type { AppLocale } from '../../i18n/types';
import { colors, radius } from '../../theme';

type Variant = 'header' | 'auth' | 'surface';

type Props = {
  variant?: Variant;
  compact?: boolean;
};

const OPTIONS: { locale: AppLocale; labelKey: 'language.english' | 'language.marathi' }[] = [
  { locale: 'en', labelKey: 'language.english' },
  { locale: 'mr', labelKey: 'language.marathi' },
];

/** Matches web `site-lang-switch` — English | मराठी pill toggle. */
export function LanguageToggle({ variant = 'header', compact }: Props) {
  const { locale, setLocale, t } = useLocale();
  const palette = VARIANT_STYLES[variant];

  return (
    <View
      style={[styles.track, palette.track, compact && styles.trackCompact]}
      accessibilityRole="tablist"
      accessibilityLabel={t('language.label')}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.locale;
        return (
          <Pressable
            key={opt.locale}
            style={[
              styles.btn,
              compact && styles.btnCompact,
              active && [styles.btnActive, palette.btnActive],
            ]}
            onPress={() => setLocale(opt.locale)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t(opt.labelKey)}
          >
            <Text
              style={[
                styles.label,
                compact && styles.labelCompact,
                palette.label,
                active && palette.labelActive,
              ]}
            >
              {t(opt.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const VARIANT_STYLES = {
  header: {
    track: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.22)',
    },
    btnActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    label: { color: 'rgba(255, 255, 255, 0.82)' },
    labelActive: { color: colors.heroText, fontWeight: '800' as const },
  },
  auth: {
    track: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    btnActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    label: { color: 'rgba(255, 255, 255, 0.78)' },
    labelActive: { color: colors.heroText, fontWeight: '800' as const },
  },
  surface: {
    track: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.borderLight,
    },
    btnActive: {
      backgroundColor: '#ecfdf5',
      borderColor: '#99f6e4',
    },
    label: { color: colors.slate },
    labelActive: { color: colors.tealDark, fontWeight: '800' as const },
  },
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  trackCompact: {
    padding: 1,
  },
  btn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnCompact: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  btnActive: {},
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  labelCompact: {
    fontSize: 9,
  },
});
