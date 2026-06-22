import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../api/singleton';
import { ApiError } from '../../api/client';
import type { PropertyAiListingDraftResponse } from '../../api/aiTypes';
import { colors, radius, spacing } from '../../theme';

const PRESETS = [
  '2 BHK rent · Hiranandani',
  '3 BHK sale · Ghodbunder',
  'PG · Kasarvadavali',
  '2 BHK · Thane West',
];

type Props = {
  onApply: (draft: PropertyAiListingDraftResponse) => void;
};

export function AiListingDraftPanel({ onApply }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PropertyAiListingDraftResponse | null>(null);

  async function generate() {
    if (!prompt.trim()) {
      setError('Describe the property first — e.g. "2 BHK for rent in Hiranandani Estate".');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await aiApi.generateListingDraft({ prompt: prompt.trim() });
      setDraft(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not generate a draft right now.');
    } finally {
      setLoading(false);
    }
  }

  function apply() {
    if (!draft) return;
    onApply(draft);
    setDraft(null);
  }

  return (
    <View style={styles.card}>
      <View style={styles.eyebrowRow}>
        <Ionicons name="sparkles" size={13} color="#7c3aed" />
        <Text style={styles.eyebrow}>ThaneFlats AI · Smart Posting</Text>
      </View>
      <Text style={styles.title}>Describe your property — we fill the form</Text>
      <Text style={styles.subtitle}>
        Minimum input. AI drafts title, address, BHK & nearby places. Description, rent and
        deposit are sensitive details you enter yourself — AI only suggests reference values.
      </Text>

      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="e.g. Semi-furnished 2 BHK for rent in Hiranandani Estate, 900 sqft, family only"
        placeholderTextColor={colors.slateLight}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <View style={styles.presetRow}>
        {PRESETS.map((p) => (
          <Pressable key={p} style={styles.presetChip} onPress={() => setPrompt(p)}>
            <Text style={styles.presetText}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.generateBtn} onPress={generate} disabled={loading}>
        <Ionicons name="flash" size={15} color={colors.heroText} />
        <Text style={styles.generateBtnText}>{loading ? 'Drafting…' : 'Generate draft'}</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {draft ? (
        <View style={styles.draftBox}>
          <View style={styles.draftHead}>
            <Ionicons name="hardware-chip-outline" size={15} color="#7c3aed" />
            <Text style={styles.draftHeadText}>AI draft ready</Text>
          </View>
          <Text style={styles.draftTitle}>{draft.title}</Text>
          <View style={styles.draftMetaRow}>
            <Text style={styles.draftMeta}>{draft.bhkConfiguration}</Text>
            <Text style={styles.draftMeta}>{draft.builtupSqft} sq.ft.</Text>
          </View>
          <Text style={styles.draftAddress} numberOfLines={2}>
            {draft.address}, {draft.areaName} · {draft.pincode}
          </Text>
          {draft.insightLines.length > 0 ? (
            <Text style={styles.draftNearby} numberOfLines={2}>
              Nearby: {draft.insightLines.map((l) => l.split('|')[0]).join(', ')}
            </Text>
          ) : null}

          <View style={styles.sensitiveBox}>
            <Ionicons name="information-circle-outline" size={13} color="#92400e" />
            <Text style={styles.sensitiveText}>
              Description, rent and deposit are not auto-filled — please enter these yourself.
              For reference, AI suggests: "{draft.description}" · rent ≈ ₹
              {draft.rentAmount.toLocaleString('en-IN')}/mo
              {draft.sellPrice != null ? ` · sale ≈ ₹${draft.sellPrice.toLocaleString('en-IN')}` : ''}
              {draft.depositAmount ? ` · deposit ≈ ₹${draft.depositAmount.toLocaleString('en-IN')}` : ''}.
            </Text>
          </View>

          <Pressable style={styles.applyBtn} onPress={apply}>
            <Ionicons name="checkmark-circle" size={15} color={colors.heroText} />
            <Text style={styles.applyBtnText}>Apply to form</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#faf5ff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7c3aed',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.slateMuted,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: 13,
    color: colors.navy,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d28d9',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7c3aed',
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.heroText,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.sm,
  },
  draftBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e9d5ff',
    padding: spacing.md,
  },
  draftHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  draftHeadText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c3aed',
  },
  draftTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  draftDesc: {
    fontSize: 12,
    color: colors.slateMuted,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  draftMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  draftMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  draftAddress: {
    fontSize: 12,
    color: colors.slateLight,
    marginBottom: spacing.xs,
  },
  draftNearby: {
    fontSize: 11,
    color: colors.slateLight,
    marginBottom: spacing.sm,
  },
  sensitiveBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sensitiveText: {
    flex: 1,
    fontSize: 11,
    color: '#92400e',
    lineHeight: 16,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#15803d',
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.heroText,
  },
});
