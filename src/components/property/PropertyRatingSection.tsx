import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { propertiesApi } from '../../api/singleton';
import { ApiError } from '../../api/client';
import { colors, radius, spacing } from '../../theme';

type Props = {
  propertyId: number;
};

export function PropertyRatingSection({ propertyId }: Props) {
  const [stars, setStars] = useState('5');
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const n = Number(stars);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      Alert.alert('Invalid rating', 'Stars must be between 1 and 5.');
      return;
    }
    setSubmitting(true);
    try {
      await propertiesApi.rateProperty(propertyId, n, review.trim());
      Alert.alert('Thank you', 'Your rating was submitted.');
      setReview('');
    } catch (e) {
      Alert.alert(
        'Could not submit',
        e instanceof ApiError ? e.message : 'Try again'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        <Ionicons name="star-half" size={18} color={colors.gold} /> Rate this property
      </Text>
      <View style={styles.row}>
        <View style={styles.starsCol}>
          <Text style={styles.label}>Stars (1–5)</Text>
          <TextInput
            style={styles.starsInput}
            value={stars}
            onChangeText={(t) => setStars(t.replace(/[^0-9]/g, '').slice(0, 1))}
            keyboardType="number-pad"
            maxLength={1}
          />
        </View>
        <View style={styles.reviewCol}>
          <Text style={styles.label}>Your review</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience…"
            value={review}
            onChangeText={setReview}
          />
        </View>
      </View>
      <Pressable
        style={[styles.btn, submitting && styles.btnDisabled]}
        onPress={submit}
        disabled={submitting}
      >
        <Ionicons name="checkmark" size={18} color={colors.heroText} />
        <Text style={styles.btnText}>Submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  starsCol: { width: 72 },
  reviewCol: { flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slateLight,
    marginBottom: 4,
  },
  starsInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.navy,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.navy,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.navy,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.heroText, fontWeight: '800', fontSize: 15 },
});
