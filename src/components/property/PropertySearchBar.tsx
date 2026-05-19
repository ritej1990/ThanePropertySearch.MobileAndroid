import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function PropertySearchBar({
  value,
  onChangeText,
  placeholder = 'Search by area, title, or address…',
}: Props) {
  return (
    <View style={styles.shell}>
      <View style={styles.iconWrap}>
        <Ionicons name="search" size={18} color="#0d9488" />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slateLight}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.32)',
    backgroundColor: colors.surface,
    minHeight: 48,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRightWidth: 1,
    borderRightColor: 'rgba(148, 163, 184, 0.2)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.navy,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
