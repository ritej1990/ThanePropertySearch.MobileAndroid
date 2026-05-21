import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { POLICY_FOOTER_LINKS } from '../../content/policies';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

type Props = {
  navigation: NavigationProp<RootStackParamList>;
  variant?: 'light' | 'dark';
};

export function PolicyFooterLinks({ navigation, variant = 'dark' }: Props) {
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
              accessibilityLabel={link.label}
            >
              <Text style={[styles.link, { color: linkColor }]}>{link.label}</Text>
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
