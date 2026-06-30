import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { LEGAL_COPYRIGHT_YEAR, LEGAL_LINK_KINDS } from '../../config/legalLinks';
import type { RootStackParamList } from '../../navigation/types';
import { useTranslation } from '../../context/LocaleContext';
import { colors, spacing } from '../../theme';

type Variant = 'onDark' | 'onLight';

type Props = {
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function LegalFooter({ variant = 'onLight', style }: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const onDark = variant === 'onDark';

  const linkLabels: Record<(typeof LEGAL_LINK_KINDS)[number], string> = {
    legal: t('legal.legal'),
    privacy: t('legal.privacy'),
    terms: t('legal.terms'),
    refund: t('legal.refund'),
  };

  return (
    <View
      style={[
        styles.bar,
        onDark ? styles.barOnDark : styles.barOnLight,
        style,
      ]}
      accessibilityRole="toolbar"
      accessibilityLabel={t('legal.a11y')}
    >
      <Text style={[styles.copyright, onDark && styles.copyrightOnDark]}>
        {t('legal.copyright', { year: LEGAL_COPYRIGHT_YEAR })}
      </Text>

      <View style={styles.linksRow}>
        {LEGAL_LINK_KINDS.map((kind, index) => (
          <React.Fragment key={kind}>
            {index > 0 ? (
              <Text style={[styles.sep, onDark && styles.sepOnDark]}> · </Text>
            ) : null}
            <Pressable
              onPress={() => navigation.navigate('Policy', { kind })}
              hitSlop={6}
              accessibilityRole="link"
              accessibilityLabel={linkLabels[kind]}
            >
              <Text style={[styles.link, onDark && styles.linkOnDark]}>
                {linkLabels[kind]}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
  },
  barOnLight: {
    backgroundColor: colors.navyDeep,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  barOnDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  copyright: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.75)',
  },
  copyrightOnDark: {
    color: 'rgba(248, 250, 252, 0.72)',
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    minWidth: 0,
  },
  link: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(248, 250, 252, 0.9)',
    textDecorationLine: 'underline',
  },
  linkOnDark: {
    color: 'rgba(248, 250, 252, 0.85)',
  },
  sep: {
    fontSize: 11,
    color: 'rgba(248, 250, 252, 0.45)',
  },
  sepOnDark: {
    color: 'rgba(248, 250, 252, 0.4)',
  },
});
