import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { POST_PROPERTY_STEPS, type PostPropertyStepIndex } from '../../utils/postPropertyForm';
import { useTranslation } from '../../context/LocaleContext';
import type { TranslationKey } from '../../i18n';
import { colors, radius, spacing } from '../../theme';

const STEP_TITLE_KEYS: TranslationKey[] = [
  'postProperty.stepBasics',
  'postProperty.stepPricing',
  'postProperty.stepDetails',
  'postProperty.stepLocation',
  'postProperty.stepPhotos',
];

type Props = {
  current: PostPropertyStepIndex;
  /** Use on white page background (below profile header). */
  variant?: 'light' | 'dark';
};

export function StepProgress({ current, variant = 'light' }: Props) {
  const { t } = useTranslation();
  const isLight = variant === 'light';

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, isLight && styles.trackLight]}>
        <View
          style={[
            styles.fill,
            isLight && styles.fillLight,
            { width: `${((current + 1) / POST_PROPERTY_STEPS.length) * 100}%` },
          ]}
        />
      </View>
      <View style={styles.steps}>
        {POST_PROPERTY_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <View key={step.key} style={styles.stepCol}>
              <View
                style={[
                  styles.dot,
                  isLight && styles.dotLight,
                  done && styles.dotDone,
                  active && (isLight ? styles.dotActiveLight : styles.dotActive),
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color={colors.heroText} />
                ) : (
                  <Text
                    style={[
                      styles.dotNum,
                      isLight && styles.dotNumLight,
                      active && (isLight ? styles.dotNumActiveLight : styles.dotNumActive),
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isLight && styles.stepLabelLight,
                  active && (isLight ? styles.stepLabelActiveLight : styles.stepLabelActive),
                  done && (isLight ? styles.stepLabelDoneLight : styles.stepLabelDone),
                ]}
                numberOfLines={1}
              >
                {t(STEP_TITLE_KEYS[index])}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
  },
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  trackLight: {
    backgroundColor: colors.borderLight,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.goldAccent,
    borderRadius: radius.pill,
  },
  fillLight: {
    backgroundColor: '#0d9488',
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLight: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  dotDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  dotActive: {
    backgroundColor: colors.heroText,
    borderColor: colors.goldAccent,
  },
  dotActiveLight: {
    backgroundColor: colors.navyMid,
    borderColor: '#0d9488',
  },
  dotNum: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(248,250,252,0.7)',
  },
  dotNumLight: {
    color: colors.slateLight,
  },
  dotNumActive: {
    color: colors.navy,
  },
  dotNumActiveLight: {
    color: colors.heroText,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(248,250,252,0.55)',
    textAlign: 'center',
  },
  stepLabelLight: {
    color: colors.slateLight,
  },
  stepLabelActive: {
    color: colors.heroText,
    fontWeight: '800',
  },
  stepLabelActiveLight: {
    color: colors.navy,
    fontWeight: '800',
  },
  stepLabelDone: {
    color: 'rgba(248,250,252,0.85)',
  },
  stepLabelDoneLight: {
    color: colors.slateMuted,
  },
});
