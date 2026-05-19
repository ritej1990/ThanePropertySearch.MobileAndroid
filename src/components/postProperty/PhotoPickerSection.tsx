import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';

export type PickedImage = {
  uri: string;
  fileName: string;
  mimeType: string;
};

type Props = {
  images: PickedImage[];
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function PhotoPickerSection({ images, onAdd, onRemove }: Props) {
  const slotsLeft = Math.max(0, 8 - images.length);

  return (
    <View>
      <View style={styles.tipRow}>
        <Ionicons name="information-circle" size={18} color="#0d9488" />
        <Text style={styles.tip}>
          Add up to 8 photos. The first one is your cover — bright, wide shots work
          best.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Pressable style={styles.addTile} onPress={onAdd}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={28} color="#0f766e" />
          </View>
          <Text style={styles.addLabel}>Add photos</Text>
          <Text style={styles.addSub}>{slotsLeft} slots left</Text>
        </Pressable>

        {images.map((img, index) => (
          <View key={`${img.uri}-${index}`} style={styles.thumbWrap}>
            <Image source={{ uri: img.uri }} style={styles.thumb} />
            {index === 0 && (
              <View style={styles.coverRibbon}>
                <Ionicons name="star" size={10} color={colors.goldAccent} />
                <Text style={styles.coverText}>Cover</Text>
              </View>
            )}
            <Pressable
              style={styles.removeBtn}
              onPress={() => onRemove(index)}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={16} color={colors.heroText} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {images.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={40} color={colors.border} />
          <Text style={styles.emptyText}>No photos yet — optional but recommended</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#ecfdf5',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  tip: {
    flex: 1,
    fontSize: 13,
    color: '#0f766e',
    lineHeight: 18,
  },
  row: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  addTile: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6ee7b7',
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  addLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
  },
  addSub: {
    fontSize: 11,
    color: colors.slateLight,
    marginTop: 2,
  },
  thumbWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceMuted,
  },
  coverRibbon: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 4,
  },
  coverText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.heroText,
  },
  removeBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(185, 28, 28, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.slateLight,
  },
});
