import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../api/client';
import type { FavoriteResourceType } from '../../api/favoriteTypes';
import { toggleFavorite, useFavoriteStatus } from '../../state/favoritesStore';
import { useTranslation } from '../../context/LocaleContext';
import { colors } from '../../theme';

type Props = {
  resourceType: FavoriteResourceType;
  resourceId: number;
  /** Smaller pill used on list cards; larger filled circle used on the details toolbar. */
  variant?: 'card' | 'toolbar';
};

/** Heart toggle mirroring the web's _ListingFavoriteButton — optimistic, synced across screens. */
export function FavoriteButton({ resourceType, resourceId, variant = 'card' }: Props) {
  const { t } = useTranslation();
  const status = useFavoriteStatus(resourceType, resourceId);
  const [busy, setBusy] = useState(false);
  const isFavorite = status?.isFavorite ?? false;

  const onPress = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await toggleFavorite(resourceType, resourceId);
    } catch (e) {
      console.warn('[favorites] toggle failed', resourceType, resourceId, e);
      const detail =
        e instanceof ApiError
          ? `${e.status}: ${e.message}`
          : e instanceof Error
            ? e.message
            : t('shared.pleaseTryAgain');
      Alert.alert(t('shared.couldNotUpdateFavorites'), detail);
    } finally {
      setBusy(false);
    }
  }, [busy, resourceType, resourceId]);

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={
        isFavorite ? t('shared.removeFromFavorites') : t('shared.saveToFavorites')
      }
      style={({ pressed }) => [
        variant === 'card' ? styles.card : styles.toolbar,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={variant === 'card' ? 18 : 20}
        color={isFavorite ? '#ef4444' : variant === 'card' ? colors.heroText : colors.navy}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
