import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PropertyResponse } from '../../api/types';
import type { SelectedPlace } from '../../services/googlePlaces';
import { colors, spacing } from '../../theme';

type Props = {
  properties: PropertyResponse[];
  selectedPlace: SelectedPlace | null;
  onPropertyPress: (item: PropertyResponse) => void;
};

/** Web build — react-native-maps is native-only; use list view on web. */
export function PropertySearchMap(_props: Props) {
  return (
    <View style={styles.placeholder}>
      <Ionicons name="phone-portrait-outline" size={48} color={colors.slateLight} />
      <Text style={styles.placeholderTitle}>Map view on mobile app</Text>
      <Text style={styles.placeholderSub}>
        Property map search is available in the Thane Flats iOS and Android app. On
        web preview, use List view to browse homes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceMuted,
  },
  placeholderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.navy,
    marginTop: spacing.lg,
  },
  placeholderSub: {
    fontSize: 14,
    color: colors.slateLight,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
    maxWidth: 320,
  },
});
