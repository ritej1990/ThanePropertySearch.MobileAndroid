import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PolicyDocument } from '../../content/policies';
import { formatIndiaDate } from '../../utils/indiaTime';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  document: PolicyDocument;
};

export function PolicyDocumentView({ document }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{document.title}</Text>
      {document.subtitle ? (
        <Text style={styles.subtitle}>{document.subtitle}</Text>
      ) : null}
      {document.showLastUpdated ? (
        <Text style={styles.updated}>Last updated: {formatIndiaDate()}</Text>
      ) : null}

      {document.blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <Text key={index} style={styles.heading}>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <Text key={index} style={styles.paragraph}>
              {block.text}
            </Text>
          );
        }

        if (block.type === 'list') {
          return (
            <View key={index} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <View key={index} style={styles.table}>
            {block.rows.map((row) => (
              <View key={row.label} style={styles.tableRow}>
                <Text style={styles.tableLabel}>{row.label}</Text>
                <Text style={styles.tableValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 22,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.slateLight,
    marginBottom: spacing.md,
  },
  updated: {
    fontSize: 14,
    color: colors.slateLight,
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.slate,
    marginTop: spacing.sm,
  },
  list: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.slate,
    marginTop: 1,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.slate,
  },
  table: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableLabel: {
    width: 132,
    padding: spacing.md,
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    backgroundColor: colors.surfaceMuted,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  tableValue: {
    flex: 1,
    padding: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate,
  },
});
