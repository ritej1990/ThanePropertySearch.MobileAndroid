import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../theme';

export type ChipTone = 'rent' | 'sale' | 'pg' | 'neutral' | 'bhk' | 'featured';

type Props = {
  label: string;
  tone?: ChipTone;
  small?: boolean;
};

function getToneStyles(tone: ChipTone) {
  switch (tone) {
    case 'rent':
      return { box: chipStyles.chipRent, text: chipStyles.textRent };
    case 'sale':
      return { box: chipStyles.chipSale, text: chipStyles.textSale };
    case 'pg':
      return { box: chipStyles.chipPg, text: chipStyles.textPg };
    case 'bhk':
      return { box: chipStyles.chipBhk, text: chipStyles.textBhk };
    case 'featured':
      return { box: chipStyles.chipFeatured, text: chipStyles.textFeatured };
    default:
      return { box: chipStyles.chipNeutral, text: chipStyles.textNeutral };
  }
}

export function PropertyChip({ label, tone = 'neutral', small }: Props) {
  const t = getToneStyles(tone);
  return (
    <View style={[chipStyles.chip, t.box, small && chipStyles.chipSmall]}>
      <Text style={[chipStyles.text, t.text, small && chipStyles.textSmall]}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipSmall: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 10,
  },
  chipRent: { backgroundColor: '#ecfdf5', borderColor: '#86efac' },
  textRent: { color: '#166534' },
  chipSale: { backgroundColor: '#fff7ed', borderColor: '#fdba74' },
  textSale: { color: '#9a3412' },
  chipPg: { backgroundColor: '#f5f3ff', borderColor: '#c4b5fd' },
  textPg: { color: '#5b21b6' },
  chipNeutral: { backgroundColor: '#eff6ff', borderColor: '#93c5fd' },
  textNeutral: { color: '#1e40af' },
  chipBhk: { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
  textBhk: { color: colors.slate },
  chipFeatured: { backgroundColor: '#fef3c7', borderColor: '#fcd34d' },
  textFeatured: { color: '#92400e' },
});
