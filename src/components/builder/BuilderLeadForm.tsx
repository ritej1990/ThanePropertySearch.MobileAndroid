import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { builderProjectsApi } from '../../api/singleton';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { AuthTextField } from '../ui/AuthTextField';
import { GradientButton } from '../ui/GradientButton';
import { colors, radius, spacing } from '../../theme';

type Props = {
  visible: boolean;
  projectId: number;
  projectName: string;
  unitId?: number | null;
  unitLabel?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function BuilderLeadForm({
  visible,
  projectId,
  projectName,
  unitId,
  unitLabel,
  onClose,
  onSuccess,
}: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.fullName ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    unitLabel
      ? `I am interested in ${unitLabel} at ${projectName}.`
      : `I am interested in ${projectName}.`
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await builderProjectsApi.submitLead(projectId, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        unitId: unitId ?? null,
      });
      Alert.alert('Enquiry sent', res.message || 'The builder will contact you soon.');
      onSuccess?.();
      onClose();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not send enquiry';
      Alert.alert('Enquiry failed', msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Contact builder</Text>
        <Text style={styles.sub}>{projectName}</Text>

        <AuthTextField
          label="Your name"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <AuthTextField
          label="Email"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthTextField
          label="Phone"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <AuthTextField
          label="Message"
          icon="chatbubble-outline"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <GradientButton
          label="Send enquiry"
          loading={submitting}
          onPress={handleSubmit}
        />
        <Pressable style={styles.cancel} onPress={onClose} hitSlop={8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
  },
  sub: {
    fontSize: 14,
    color: colors.slateMuted,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slateMuted,
  },
});
