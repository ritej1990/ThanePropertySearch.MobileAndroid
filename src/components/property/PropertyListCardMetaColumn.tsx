import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompactCardFact } from '../../utils/propertyListMeta';
import { colors, radius } from '../../theme';

type Props = {
  facts?: CompactCardFact[];
  tags?: string[];
  notes?: string[];
  /** Right column shows a divider on the left edge. */
  edge?: 'left' | 'right';
};

export function PropertyListCardMetaColumn({
  facts = [],
  tags = [],
  notes = [],
  edge = 'right',
}: Props) {
  if (facts.length === 0 && tags.length === 0 && notes.length === 0) return null;

  return (
    <View style={[styles.col, edge === 'right' && styles.colRight]}>
      {notes.map((note) => (
        <Text key={note} style={styles.note} numberOfLines={2}>
          {note}
        </Text>
      ))}

      {tags.length > 0 ? (
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {facts.map((fact) => (
        <View key={fact.key} style={styles.row}>
          <Ionicons name={fact.icon} size={12} color="#0f766e" style={styles.icon} />
          <Text style={styles.value} numberOfLines={1}>
            {fact.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    flex: 1,
    minWidth: 0,
    gap: 5,
    paddingVertical: 2,
  },
  colRight: {
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
  },
  note: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: colors.slateMuted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    maxWidth: '100%',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slateMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  icon: {
    width: 14,
    textAlign: 'center',
  },
  value: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.slateMuted,
    lineHeight: 14,
  },
});
