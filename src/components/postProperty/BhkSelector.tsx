import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BHK_OPTIONS } from '../../utils/postPropertyForm';
import { colors, radius, spacing } from '../../theme';

type Props = {
  value: string;
  onChange: (bhk: string) => void;
};

export function BhkSelector({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {BHK_OPTIONS.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.tile, active && styles.tileOn]}
          >
            <Text style={[styles.tileMain, active && styles.tileMainOn]}>
              {opt.split(' ')[0]}
            </Text>
            <Text style={[styles.tileSub, active && styles.tileSubOn]}>
              {opt.includes(' ') ? opt.split(' ').slice(1).join(' ') : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
  },
  tileOn: {
    borderColor: '#0d9488',
    backgroundColor: '#ecfdf5',
  },
  tileMain: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.slateMuted,
  },
  tileMainOn: {
    color: '#0f766e',
  },
  tileSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateLight,
    marginTop: 2,
  },
  tileSubOn: {
    color: '#0d9488',
  },
});
