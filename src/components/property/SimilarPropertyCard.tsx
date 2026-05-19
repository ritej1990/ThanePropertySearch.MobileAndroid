import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PropertyResponse } from '../../api/types';
import { PropertyImage } from './PropertyImage';
import { colors, radius, spacing } from '../../theme';
import { getPrimaryPrice } from '../../utils/propertyDisplay';

type Props = {
  item: PropertyResponse;
  onPress: () => void;
};

export function SimilarPropertyCard({ item, onPress }: Props) {
  const price = getPrimaryPrice(item);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <PropertyImage uri={item.imageUrl} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.area} numberOfLines={1}>
          {item.areaName}
        </Text>
        <Text style={styles.price}>
          {price.amount}
          {price.suffix}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 108,
  },
  body: {
    padding: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 18,
  },
  area: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
    marginTop: 6,
  },
});
