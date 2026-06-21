import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../api/singleton';
import type { LeadQualificationResponse } from '../../api/aiTypes';
import { colors, radius, spacing } from '../../theme';

type Props = {
  inquiryId: number;
};

function toneFor(leadType: string): { bg: string; fg: string } {
  const t = leadType.toLowerCase();
  if (t.includes('hot')) return { bg: '#fef2f2', fg: '#b91c1c' };
  if (t.includes('warm')) return { bg: '#fffbeb', fg: '#92400e' };
  if (t.includes('cold')) return { bg: '#eff6ff', fg: '#1d4ed8' };
  return { bg: '#f5f3ff', fg: '#6d28d9' };
}

/** Per-inquiry AI lead quality — GET /api/ai/leads/inquiry/{id} (renders nothing if none). */
export function AiLeadBadge({ inquiryId }: Props) {
  const [lead, setLead] = useState<LeadQualificationResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    aiApi
      .getLeadByInquiry(inquiryId)
      .then((res) => {
        if (!cancelled) setLead(res);
      })
      .catch(() => {
        /* no qualification yet — render nothing */
      });
    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  if (!lead) return null;

  const tone = toneFor(lead.leadType);

  return (
    <View style={[styles.chip, { backgroundColor: tone.bg }]}>
      <Ionicons name="sparkles" size={11} color={tone.fg} />
      <Text style={[styles.chipText, { color: tone.fg }]}>
        {lead.leadType} · {lead.leadScore}/100
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
