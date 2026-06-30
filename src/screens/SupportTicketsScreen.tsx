import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supportApi } from '../api/singleton';
import { ApiError } from '../api/client';
import type { SupportTicketSummary } from '../api/supportTypes';
import { useAuth } from '../context/AuthContext';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PolicyFooterLinks } from '../components/policy/PolicyFooterLinks';
import { BrandLoading } from '../components/ui/BrandLoading';
import { useTranslation } from '../context/LocaleContext';
import type { RootStackParamList } from '../navigation/types';
import { formatShortDate } from '../utils/formatLocaleDate';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SupportTickets'>;

export default function SupportTicketsScreen({ navigation }: Props) {
  const { t, locale } = useTranslation();
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(profile?.fullName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supportApi.listTickets();
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function submitTicket() {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert(t('support.missingFieldsTitle'), t('support.missingFields'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await supportApi.createTicket({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      });
      Alert.alert(t('support.submitted'), res.message);
      setSubject('');
      setMessage('');
      await load();
    } catch (e) {
      Alert.alert(
        t('support.couldNotSubmit'),
        e instanceof ApiError ? e.message : t('shared.tryAgain')
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={['#0c4a6e', '#0f172a']}
          style={styles.hero}
        >
          <Ionicons name="help-buoy" size={28} color="#7dd3fc" />
          <Text style={styles.heroTitle}>{t('support.title')}</Text>
          <Text style={styles.heroSub}>{t('support.heroSub')}</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>{t('support.raiseTicket')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('shared.name')}
            placeholderTextColor={colors.slateLight}
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('shared.email')}
            placeholderTextColor={colors.slateLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('support.phoneOptional')}
            placeholderTextColor={colors.slateLight}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
            placeholder={t('support.subjectPlaceholder')}
            placeholderTextColor={colors.slateLight}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder={t('support.detailsPlaceholder')}
            placeholderTextColor={colors.slateLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.submitBtn, submitting && styles.submitDisabled]}
            onPress={submitTicket}
            disabled={submitting}
          >
            <Ionicons name="send" size={16} color={colors.heroText} />
            <Text style={styles.submitText}>
              {submitting ? t('support.submitting') : t('support.submitRequest')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.listHead}>
          <Text style={styles.cardTitle}>{t('support.myRequests')}</Text>
          <Text style={styles.badge}>{t('support.total', { count: tickets.length })}</Text>
        </View>

        {loading ? (
          <BrandLoading fullScreen={false} message={t('support.loading')} />
        ) : tickets.length === 0 ? (
          <Text style={styles.empty}>{t('support.empty')}</Text>
        ) : (
          tickets.map((ticket) => (
            <Pressable
              key={ticket.id}
              style={styles.ticketRow}
              onPress={() =>
                navigation.navigate('SupportTicketDetails', {
                  ticketId: ticket.id,
                  subject: ticket.subject,
                })
              }
            >
              <View style={styles.ticketBody}>
                <Text style={styles.ticketSubject} numberOfLines={1}>
                  #{ticket.id} · {ticket.subject}
                </Text>
                <Text style={styles.ticketMeta}>
                  {ticket.status} · {formatShortDate(ticket.createdAtUtc, locale)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.slateLight} />
            </Pressable>
          ))
        )}

        <PolicyFooterLinks navigation={navigation} variant="light" />
      </ScrollView>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.heroText,
    marginTop: spacing.sm,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(248,250,252,0.88)',
    marginTop: spacing.xs,
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.navy, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.sm,
  },
  textArea: { minHeight: 96 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#2563eb',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.heroText, fontWeight: '800', fontSize: 15 },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  empty: { fontSize: 14, color: colors.slateMuted, textAlign: 'center', padding: spacing.lg },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ticketBody: { flex: 1, minWidth: 0 },
  ticketSubject: { fontSize: 14, fontWeight: '700', color: colors.navy },
  ticketMeta: { fontSize: 12, color: colors.slateLight, marginTop: 4 },
});
