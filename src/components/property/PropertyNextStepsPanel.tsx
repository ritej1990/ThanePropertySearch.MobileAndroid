import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { useTranslation } from '../../context/LocaleContext';
import {
  alertPlanRequired,
  canRevealOwnerContact,
  handlePlanUsageError,
  hasActivePlanCredits,
  isEssentialPlanExpired,
} from '../../utils/planUsage';
import { apiErrorMessage } from '../../utils/apiErrorMessage';
import {
  defaultVisitDateTime,
  formatVisitAtLocalForApi,
  formatVisitDateTimeLabel,
} from '../../utils/visitSchedule';
import { colors, radius, spacing } from '../../theme';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

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
  const { t } = useTranslation();
  const [essential, setEssential] = useState<EssentialStatus | null>(null);
  const [visitModal, setVisitModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [visitMessage, setVisitMessage] = useState('');
  const [visitAt, setVisitAt] = useState(defaultVisitDateTime);
  const [showIosVisitPicker, setShowIosVisitPicker] = useState(false);
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
    alertPlanRequired(navigation, propertyId, isEssentialPlanExpired(essential), t);
    return false;
  }

  async function getOrCreateInquiry(message: string, appendIfExists = true): Promise<number> {
    const list = await propertiesApi.getPropertyInquiries(propertyId);
    const existing = list
      .filter((row) => row.status.toLowerCase() !== 'rejected')
      .sort((a, b) => b.id - a.id)[0];
    if (existing) {
      const trimmed = message.trim();
      if (appendIfExists && trimmed) {
        await propertiesApi.sendInquiryMessage(existing.id, trimmed);
      }
      return existing.id;
    }

    const created = await propertiesApi.createInquiry(propertyId, message.trim());
    return created.inquiryId;
  }

  async function revealContact() {
    // Reveal can also be paid for with contact-pack credits, not just the plan.
    if (!canRevealOwnerContact(essential)) {
      alertPlanRequired(navigation, propertyId);
      return;
    }
    setBusy(true);
    try {
      const contact: OwnerContact = await propertiesApi.getOwnerContact(propertyId);
      Alert.alert(
        t('nextSteps.ownerContact'),
        `${contact.ownerName}\n\n📧 ${contact.email || '—'}\n📞 ${contact.phoneNumber || '—'}`,
        [
          contact.phoneNumber
            ? {
                text: t('shared.call'),
                onPress: () => Linking.openURL(`tel:${contact.phoneNumber}`),
              }
            : undefined,
          { text: t('common.ok') },
        ].filter(Boolean) as { text: string; onPress?: () => void }[]
      );
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(
          t('nextSteps.couldNotReveal'),
          e instanceof ApiError ? e.message : t('shared.tryAgain')
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function openVisitModal() {
    if (!ensurePlanCredits()) return;
    setVisitAt(defaultVisitDateTime());
    setVisitMessage('');
    setShowIosVisitPicker(Platform.OS === 'ios');
    setVisitModal(true);
  }

  function pickVisitDateTimeAndroid() {
    DateTimePickerAndroid.open({
      value: visitAt,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type !== 'set' || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, time) => {
            if (timeEvent.type !== 'set' || !time) return;
            const merged = new Date(date);
            merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setVisitAt(merged);
          },
        });
      },
    });
  }

  async function submitVisit() {
    if (!ensurePlanCredits()) return;
    if (visitAt.getTime() < Date.now()) {
      Alert.alert(t('visits.invalidTime'), t('visits.invalidTimeBody'));
      return;
    }
    setBusy(true);
    try {
      const res = await propertiesApi.scheduleVisit(
        propertyId,
        formatVisitAtLocalForApi(visitAt),
        visitMessage.trim() || t('nextSteps.defaultVisitMessage')
      );
      setVisitModal(false);
      setShowIosVisitPicker(false);
      Alert.alert(t('visits.visitRequested'), res.message);
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(t('shared.failed'), apiErrorMessage(e, t('visits.couldNotSchedule')));
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitRequest() {
    if (!ensurePlanCredits()) return;
    if (!requestMessage.trim()) {
      Alert.alert(t('nextSteps.messageRequired'), t('nextSteps.messageRequiredBody'));
      return;
    }
    setBusy(true);
    try {
      await getOrCreateInquiry(requestMessage.trim());
      setRequestModal(false);
      Alert.alert(t('inquiries.requestSent'), t('inquiries.requestSentBody'));
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(t('shared.failed'), apiErrorMessage(e, t('nextSteps.couldNotSendRequest')));
      }
    } finally {
      setBusy(false);
    }
  }

  async function startChat() {
    if (!ensurePlanCredits()) return;
    setBusy(true);
    try {
      const inquiryId = await getOrCreateInquiry(
        t('nextSteps.defaultChatMessage'),
        false
      );
      navigation.navigate('PropertyChat', {
        propertyId,
        inquiryId,
        title: t('propertyChat.chatWithOwner'),
      });
      load();
      onUsageChanged?.();
    } catch (e) {
      if (!handlePlanUsageError(e, navigation, propertyId)) {
        Alert.alert(
          t('nextSteps.chatUnavailable'),
          e instanceof ApiError ? e.message : t('shared.tryAgain')
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.navyDeep, '#1a4d6e']}
        style={styles.head}
      >
        <View style={styles.headTitleRow}>
          <Ionicons name="flash" size={16} color={colors.goldAccent} />
          <Text style={styles.headTitle}>{t('nextSteps.title')}</Text>
        </View>
        <Text style={styles.headSub}>{t('nextSteps.subtitle')}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {!hasPlan && (
          <View style={styles.hintBox}>
            <Ionicons name="information-circle" size={18} color="#2563eb" />
            <Text style={styles.hintText}>
              {t('nextSteps.planHint')}{' '}
              <Text
                style={styles.hintLink}
                onPress={() =>
                  navigation.navigate('EssentialService', {
                    returnPropertyId: propertyId,
                  })
                }
              >
                {t('shared.viewPlans')}
              </Text>
            </Text>
          </View>
        )}

        <View style={styles.grid}>
          <ActionButton
            label={t('nextSteps.revealContact')}
            icon="call-outline"
            variant="success"
            onPress={revealContact}
          />
          <ActionButton
            label={t('nextSteps.scheduleVisit')}
            icon="calendar-outline"
            variant="primary"
            onPress={openVisitModal}
          />
          <ActionButton
            label={t('nextSteps.requestProperty')}
            icon="send-outline"
            variant="warning"
            onPress={() => (hasPlan ? setRequestModal(true) : ensurePlanCredits())}
          />
          <ActionButton
            label={t('nextSteps.myRequests')}
            icon="chatbubbles-outline"
            variant="outline"
            onPress={() =>
              navigation.navigate('PropertyInquiries', {
                propertyId,
              })
            }
          />
          <ActionButton
            label={t('nextSteps.chatOwner')}
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
        title={t('nextSteps.scheduleVisit')}
        onClose={() => {
          setShowIosVisitPicker(false);
          setVisitModal(false);
        }}
        onSubmit={submitVisit}
      >
        <Text style={styles.inputLabel}>Visit date & time</Text>
        <Pressable
          style={styles.datePickerBtn}
          onPress={() => {
            if (Platform.OS === 'android') {
              pickVisitDateTimeAndroid();
            } else {
              setShowIosVisitPicker(true);
            }
          }}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.tealDark} />
          <Text style={styles.datePickerText}>{formatVisitDateTimeLabel(visitAt)}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.slateLight} />
        </Pressable>
        {showIosVisitPicker && Platform.OS === 'ios' ? (
          <DateTimePicker
            value={visitAt}
            mode="datetime"
            minimumDate={new Date()}
            display="spinner"
            onChange={(_, date) => {
              if (date) setVisitAt(date);
            }}
          />
        ) : null}
        <Text style={styles.inputLabel}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('nextSteps.visitMessagePlaceholder')}
          value={visitMessage}
          onChangeText={setVisitMessage}
          multiline
          textAlignVertical="top"
        />
      </FormModal>

      <FormModal
        visible={requestModal}
        title={t('nextSteps.requestProperty')}
        onClose={() => setRequestModal(false)}
        onSubmit={submitRequest}
      >
        <Text style={styles.inputLabel}>{t('nextSteps.messageToOwner')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('nextSteps.requestMessagePlaceholder')}
          value={requestMessage}
          onChangeText={setRequestMessage}
          multiline
          textAlignVertical="top"
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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible) {
      setKeyboardInset(0);
      return;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardInset(event.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [visible]);

  const scrollFormToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    if (visible && keyboardInset > 0) {
      scrollFormToEnd();
    }
  }, [visible, keyboardInset, scrollFormToEnd]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={modalStyles.backdrop}>
        <Pressable style={modalStyles.dismissArea} onPress={handleClose} accessibilityLabel={t('shared.close')} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            modalStyles.sheetAvoid,
            { marginBottom: Platform.OS === 'android' ? keyboardInset : 0 },
          ]}
        >
          <View
            style={[
              modalStyles.sheet,
              { paddingBottom: Math.max(insets.bottom, spacing.lg) },
            ]}
          >
            <ScrollView
              ref={scrollRef}
              style={modalStyles.scroll}
              contentContainerStyle={modalStyles.scrollContent}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={modalStyles.title}>{title}</Text>
              {children}
            </ScrollView>
            <View style={modalStyles.actions}>
              <Pressable style={modalStyles.cancel} onPress={handleClose}>
                <Text style={modalStyles.cancelText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable style={modalStyles.submit} onPress={onSubmit}>
                <Text style={modalStyles.submitText}>{t('shared.submit')}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetAvoid: {
    maxHeight: '92%',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: '88%',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.navy, marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, paddingTop: spacing.sm },
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
