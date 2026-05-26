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
import { LEGAL_COPYRIGHT_YEAR, LEGAL_LINKS } from '../../config/legalLinks';
import type { RootStackParamList } from '../../navigation/types';
import { colors, spacing } from '../../theme';

type Variant = 'onDark' | 'onLight';

type Props = {
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export function LegalFooter({ variant = 'onLight', style }: Props) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const onDark = variant === 'onDark';

  return (
    <View
      style={[
        styles.bar,
        onDark ? styles.barOnDark : styles.barOnLight,
        style,
      ]}
      accessibilityRole="toolbar"
      accessibilityLabel="Legal and policy links"
    >
      <Text style={[styles.copyright, onDark && styles.copyrightOnDark]}>
        © {LEGAL_COPYRIGHT_YEAR} Thane Flats
      </Text>

      <View style={styles.linksRow}>
        {LEGAL_LINKS.map((item, index) => (
          <React.Fragment key={item.kind}>
            {index > 0 ? (
              <Text style={[styles.sep, onDark && styles.sepOnDark]}> · </Text>
            ) : null}
            <Pressable
              onPress={() => navigation.navigate('Policy', { kind: item.kind })}
              hitSlop={6}
              accessibilityRole="link"
              accessibilityLabel={item.label}
            >
              <Text style={[styles.link, onDark && styles.linkOnDark]}>
                {item.label}
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
