import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LEGAL_COPYRIGHT_YEAR, LEGAL_LINKS, legalPageUrl } from '../../config/legalLinks';
import { colors, spacing } from '../../theme';

type Variant = 'onDark' | 'onLight';

type Props = {
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

async function openLegalPage(path: string, label: string) {
  const url = legalPageUrl(path);
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(label, `Open in your browser:\n${url}`);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert(label, `Could not open the link. Visit:\n${url}`);
  }
}

export function LegalFooter({ variant = 'onLight', style }: Props) {
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
          <React.Fragment key={item.path}>
            {index > 0 ? (
              <Text style={[styles.sep, onDark && styles.sepOnDark]}> · </Text>
            ) : null}
            <Pressable
              onPress={() => openLegalPage(item.path, item.label)}
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
