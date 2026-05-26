import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchPlaceDetails,
  fetchPlacePredictions,
  type PlacePrediction,
  type SelectedPlace,
} from '../../services/googlePlaces';
import { hasGoogleMapsKey } from '../../config/env';
import { ThaneFlatsLogo } from '../ui/ThaneFlatsLogo';
import { colors, radius, spacing } from '../../theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  selectedPlace: SelectedPlace | null;
  onPlaceSelected: (place: SelectedPlace | null) => void;
  onSearchSubmit?: () => void;
  compact?: boolean;
  /** Tighter height for home toolbar */
  dense?: boolean;
  /** Soft shadow + white shell for home */
  elevated?: boolean;
};

export function PropertyLocationSearch({
  value,
  onChangeText,
  selectedPlace,
  onPlaceSelected,
  onSearchSubmit,
  compact,
  dense,
  elevated,
}: Props) {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickLoading, setPickLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapsEnabled = hasGoogleMapsKey();

  useEffect(() => {
    if (!mapsEnabled || selectedPlace) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setPredictions([]);
      setOpen(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchPlacePredictions(value);
        setPredictions(list);
        setOpen(list.length > 0);
      } catch (e) {
        setPredictions([]);
        setOpen(false);
        setError(e instanceof Error ? e.message : 'Autocomplete failed');
      } finally {
        setLoading(false);
      }
    }, 320);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, mapsEnabled, selectedPlace]);

  async function handleSelect(prediction: PlacePrediction) {
    setPickLoading(true);
    setError(null);
    setOpen(false);
    try {
      const place = await fetchPlaceDetails(prediction.placeId);
      onChangeText(place.label);
      onPlaceSelected(place);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resolve place');
    } finally {
      setPickLoading(false);
    }
  }

  function clearLocation() {
    onChangeText('');
    onPlaceSelected(null);
    setPredictions([]);
    setOpen(false);
    setError(null);
  }

  function handleChangeText(text: string) {
    if (selectedPlace && text !== selectedPlace.label) {
      onPlaceSelected(null);
    }
    onChangeText(text);
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View
        style={[
          styles.shell,
          compact && styles.shellCompact,
          dense && styles.shellDense,
          elevated && styles.shellElevated,
        ]}
      >
        <View
          style={[
            styles.iconWrap,
            compact && styles.iconWrapCompact,
            dense && styles.iconWrapDense,
            elevated && styles.iconWrapElevated,
          ]}
        >
          {pickLoading || loading ? (
            <ThaneFlatsLogo size={22} animated />
          ) : (
            <Ionicons name="location" size={compact ? 18 : 20} color="#0d9488" />
          )}
        </View>
        <TextInput
          style={[
            styles.input,
            compact && styles.inputCompact,
            dense && styles.inputDense,
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={
            mapsEnabled
              ? compact
                ? 'Area in Thane…'
                : 'Search area in Thane on Google Maps…'
              : 'Search by area, title, or address…'
          }
          placeholderTextColor={colors.slateLight}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={onSearchSubmit}
          onFocus={() => {
            if (predictions.length > 0) setOpen(true);
          }}
        />
        {(value.length > 0 || selectedPlace) && (
          <Pressable style={styles.clearBtn} onPress={clearLocation} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={colors.slateLight} />
          </Pressable>
        )}
      </View>

      {selectedPlace && !compact && (
        <View style={styles.selectedChip}>
          <Ionicons name="navigate-circle" size={16} color="#0f766e" />
          <Text style={styles.selectedText} numberOfLines={2}>
            Near {selectedPlace.label}
          </Text>
        </View>
      )}

      {!mapsEnabled && !compact && (
        <Text style={styles.hint}>
          Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in `.env` for Google Maps autocomplete
          across Thane.
        </Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {open && predictions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            style={styles.dropdownList}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.predictionRow,
                  pressed && styles.predictionPressed,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={colors.slateLight}
                  style={styles.predictionIcon}
                />
                <View style={styles.predictionText}>
                  <Text style={styles.predictionMain} numberOfLines={1}>
                    {item.mainText}
                  </Text>
                  {item.secondaryText ? (
                    <Text style={styles.predictionSub} numberOfLines={1}>
                      {item.secondaryText}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 100,
    marginBottom: spacing.sm,
  },
  wrapCompact: {
    marginBottom: 0,
  },
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 148, 136, 0.35)',
    backgroundColor: colors.surfaceMuted,
    minHeight: 48,
  },
  shellCompact: {
    minHeight: 40,
    borderRadius: radius.sm,
  },
  shellDense: {
    minHeight: 36,
  },
  shellElevated: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(13, 148, 136, 0.25)',
    borderWidth: 1,
  },
  iconWrap: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderRightWidth: 1,
    borderRightColor: 'rgba(148, 163, 184, 0.2)',
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  iconWrapCompact: {
    width: 38,
  },
  iconWrapDense: {
    width: 34,
  },
  iconWrapElevated: {
    backgroundColor: '#ccfbf1',
    borderRightColor: 'rgba(13, 148, 136, 0.15)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.navy,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  inputCompact: {
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  inputDense: {
    fontSize: 13,
    paddingVertical: 6,
  },
  clearBtn: {
    paddingHorizontal: spacing.md,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#ecfdf5',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  selectedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f766e',
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.slateLight,
    lineHeight: 17,
  },
  error: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.error,
    lineHeight: 17,
  },
  dropdown: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    maxHeight: 220,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownList: {
    flexGrow: 0,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  predictionPressed: {
    backgroundColor: '#f0fdfa',
  },
  predictionIcon: {
    marginRight: spacing.sm,
  },
  predictionText: {
    flex: 1,
  },
  predictionMain: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  predictionSub: {
    fontSize: 12,
    color: colors.slateLight,
    marginTop: 2,
  },
});
