import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { POLICY_FOOTER_LINKS, type PolicyKind } from '../../content/policies';
import type { RootStackParamList } from '../../navigation/types';
import { useTranslation } from '../../context/LocaleContext';
import type { TranslateFn } from '../../i18n';
import { colors, spacing } from '../../theme';

type Props = {
  navigation: NavigationProp<RootStackParamList>;
  variant?: 'light' | 'dark';
};

function policyLabel(t: TranslateFn, kind: PolicyKind): string {
  switch (kind) {
    case 'legal':
      return t('legal.legal');
    case 'privacy':
      return t('legal.privacy');
    case 'terms':
      return t('legal.terms');
    case 'refund':
      return t('legal.refund');
  }
}

export function PolicyFooterLinks({ navigation, variant = 'dark' }: Props) {
  const { t } = useTranslation();
  const linkColor = variant === 'dark' ? 'rgba(248, 250, 252, 0.88)' : colors.primaryDark;
  const mutedColor = variant === 'dark' ? 'rgba(248, 250, 252, 0.45)' : colors.slateLight;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {POLICY_FOOTER_LINKS.map((link, index) => (
          <React.Fragment key={link.kind}>
            {index > 0 ? <Text style={[styles.sep, { color: mutedColor }]}>·</Text> : null}
            <Pressable
              onPress={() => navigation.navigate('Policy', { kind: link.kind })}
              hitSlop={6}
              accessibilityRole="link"
              accessibilityLabel={policyLabel(t, link.kind)}
            >
              <Text style={[styles.link, { color: linkColor }]}>{policyLabel(t, link.kind)}</Text>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  link: {
    fontSize: 12,
    fontWeight: '600',
  },
  sep: {
    fontSize: 12,
    fontWeight: '600',
  },
});
