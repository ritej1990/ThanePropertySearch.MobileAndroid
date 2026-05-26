import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApiError } from '../../api/client';
import { paymentsApi } from '../../api/singleton';
import { propertiesApi } from '../../api/singleton';
import type { EssentialStatus } from '../../api/paymentTypes';
import type { OwnerContact } from '../../api/inquiryTypes';
import type { RootStackParamList } from '../../navigation/types';
import {
  alertPlanRequired,
  handlePlanUsageError,
  hasActivePlanCredits,
} from '../../utils/planUsage';
import { colors, radius, spacing } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  propertyId: number;
  navigation: Nav;
  onUsageChanged?: () => void;
};

function ActionButton({
  label,
  icon,
  variant,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: 'success' | 'primary' | 'warning' | 'outline' | 'dark';
  onPress: () => void;
}) {
  const styles = actionStyles[variant];
  return (
    <Pressable style={[actionStyles.base, styles.btn]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={styles.icon} />
      <Text style={[actionStyles.label, styles.label]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const actionStyles = {
  base: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    minWidth: '47%' as const,
    flexGrow: 1,
  },
  label: { fontSize: 12, fontWeight: '700' as const, flex: 1 },
  success: {
    btn: { backgroundColor: '#10b981' },
    icon: colors.heroText,
    label: { color: colors.heroText },
  },
  primary: {
    btn: { backgroundColor: '#2563eb' },
    icon: colors.heroText,
    label: { color: colors.heroText },
  },
  warning: {
    btn: { backgroundColor: '#ea580c' },
    icon: colors.heroText,
    label: { color: colors.heroText },
  },
  outline: {
    btn: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: '#2563eb',
    },
    icon: '#2563eb',
    label: { color: '#2563eb' },
  },
  dark: {
    btn: { backgroundColor: colors.navy },
    icon: colors.heroText,
    label: { color: colors.heroText },
  },
};

export function PropertyNextStepsPanel({
  propertyId,
  navigation,
  onUsageChanged,
}: Props) {
  const [essential, setEssential] = useState<EssentialStatus | null>(null);
  const [visitModal, setVisitModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [visitMessage, setVisitMessage] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const e = await paymentsApi.getEssentialStatus();
      setEssential(e);
    } catch {
      /* optional */
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const hasPlan = hasActivePlanCredits(essential);

  function ensurePlanCredits(): boolean {
    if (hasPlan) return true;
    alertPlanRequired(navigation, propertyId);
    return false;
  }

  async function revealContact() {
    if (!ensurePlanCredits()) return;
    setBusy(true);
    try {
      const contact: OwnerContact = await propertiesApi.getOwnerContact(propertyId);
      Alert.alert(
        'Owner contact',
        `${contact.ownerName}\n\n📧 ${contact.email || '—'}\n📞 ${contact.phoneNumber || '—'}`,
        [
          contact.phoneNumber
            ? {
                text: 'Call',
                onPress: () => Linking.openURL(`tel:${contact.phoneNumber}`),
              }
            : undefined,
          { text: 'OK' },
        ].filter(Boolean) as { text: string; onPress?: () => void }[]
      );
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(
          'Could not reveal',
          e instanceof ApiError ? e.message : 'Try again'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitVisit() {
    if (!ensurePlanCredits()) return;
    if (!visitDate.trim()) {
      Alert.alert('Date required', 'Enter visit date/time (ISO format or YYYY-MM-DDTHH:mm).');
      return;
    }
    setBusy(true);
    try {
      const res = await propertiesApi.scheduleVisit(
        propertyId,
        visitDate.trim(),
        visitMessage.trim() || 'I would like to schedule a visit.'
      );
      setVisitModal(false);
      Alert.alert('Visit requested', res.message);
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(
          'Failed',
          e instanceof ApiError ? e.message : 'Could not schedule visit'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitRequest() {
    if (!ensurePlanCredits()) return;
    if (!requestMessage.trim()) {
      Alert.alert('Message required', 'Describe your interest in this property.');
      return;
    }
    setBusy(true);
    try {
      const res = await propertiesApi.createInquiry(
        propertyId,
        requestMessage.trim()
      );
      setRequestModal(false);
      Alert.alert('Request sent', res.message);
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(
          'Failed',
          e instanceof ApiError ? e.message : 'Could not send request'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function startChat() {
    if (!ensurePlanCredits()) return;
    setBusy(true);
    try {
      const list = await propertiesApi.getPropertyInquiries(propertyId);
      let inquiryId = list[0]?.id;
      if (!inquiryId) {
        const created = await propertiesApi.createInquiry(
          propertyId,
          "Hello, I'm interested in this property and would like more details."
        );
        inquiryId = created.inquiryId;
      }
      navigation.navigate('PropertyChat', {
        propertyId,
        inquiryId,
        title: 'Chat with owner',
      });
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(
          'Chat unavailable',
          e instanceof ApiError ? e.message : 'Try again'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function openVisitModal() {
    if (!ensurePlanCredits()) return;
    setVisitModal(true);
  }

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.navyDeep, '#1a4d6e']}
        style={styles.head}
      >
        <View style={styles.headTitleRow}>
          <Ionicons name="flash" size={16} color={colors.goldAccent} />
          <Text style={styles.headTitle}>Next steps</Text>
        </View>
        <Text style={styles.headSub}>Contact the owner or manage conversations</Text>
      </LinearGradient>

      <View style={styles.body}>
        {!hasPlan && (
          <View style={styles.hintBox}>
            <Ionicons name="information-circle" size={18} color="#2563eb" />
            <Text style={styles.hintText}>
              Essential plan required. Each action uses 1 credit (contact, visit,
              request, chat).{' '}
              <Text
                style={styles.hintLink}
                onPress={() =>
                  navigation.navigate('EssentialService', {
                    returnPropertyId: propertyId,
                  })
                }
              >
                View plans
              </Text>
            </Text>
          </View>
        )}

        <View style={styles.grid}>
          <ActionButton
            label="Reveal owner contact"
            icon="call-outline"
            variant="success"
            onPress={revealContact}
          />
          <ActionButton
            label="Schedule visit"
            icon="calendar-outline"
            variant="primary"
            onPress={openVisitModal}
          />
          <ActionButton
            label="Request property"
            icon="send-outline"
            variant="warning"
            onPress={() => (hasPlan ? setRequestModal(true) : ensurePlanCredits())}
          />
          <ActionButton
            label="Requests & threads"
            icon="chatbubbles-outline"
            variant="outline"
            onPress={() =>
              navigation.navigate('PropertyInquiries', {
                propertyId,
                title: 'Requests',
              })
            }
          />
          <ActionButton
            label="Chat with owner"
            icon="chatbubble-ellipses-outline"
            variant="dark"
            onPress={startChat}
          />
        </View>

        {busy && (
          <Text style={styles.busyText}>Please wait…</Text>
        )}
      </View>

      <FormModal
        visible={visitModal}
        title="Schedule visit"
        onClose={() => setVisitModal(false)}
        onSubmit={submitVisit}
      >
        <Text style={styles.inputLabel}>Visit date & time</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-06-15T10:00"
          value={visitDate}
          onChangeText={setVisitDate}
        />
        <Text style={styles.inputLabel}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Preferred time window, who is visiting…"
          value={visitMessage}
          onChangeText={setVisitMessage}
          multiline
        />
      </FormModal>

      <FormModal
        visible={requestModal}
        title="Request property"
        onClose={() => setRequestModal(false)}
        onSubmit={submitRequest}
      >
        <Text style={styles.inputLabel}>Your message to the owner</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="I'm interested because…"
          value={requestMessage}
          onChangeText={setRequestMessage}
          multiline
        />
      </FormModal>
    </View>
  );
}

function FormModal({
  visible,
  title,
  onClose,
  onSubmit,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.backdrop}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>{title}</Text>
          {children}
          <View style={modalStyles.actions}>
            <Pressable style={modalStyles.cancel} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={modalStyles.submit} onPress={onSubmit}>
              <Text style={modalStyles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  head: { padding: spacing.lg },
  headTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headTitle: { fontSize: 16, fontWeight: '800', color: colors.heroText },
  headSub: { fontSize: 13, color: 'rgba(248,250,252,0.85)', marginTop: 4 },
  body: { padding: spacing.lg },
  hintBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#eff6ff',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  hintText: { flex: 1, fontSize: 13, color: '#1e40af', lineHeight: 18 },
  hintLink: { fontWeight: '800', textDecorationLine: 'underline' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  busyText: {
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.slateLight,
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slateMuted,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: colors.surfaceMuted,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.navy, marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancel: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  cancelText: { fontWeight: '700', color: colors.slateMuted },
  submit: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: '#0d9488',
  },
  submitText: { fontWeight: '700', color: colors.heroText },
});
