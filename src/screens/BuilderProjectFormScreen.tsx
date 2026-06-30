import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { builderProjectsApi, paymentsApi, propertiesApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LocaleContext';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PropertyLocationSearch } from '../components/property/PropertyLocationSearch';
import { AuthTextField } from '../components/ui/AuthTextField';
import { BrandLoading } from '../components/ui/BrandLoading';
import { GradientButton } from '../components/ui/GradientButton';
import { SectionCard } from '../components/postProperty/SectionCard';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import { isBuilderRole } from '../utils/roles';
import {
  BUILDER_PROJECT_STATUSES,
  buildUpsertBuilderProjectRequest,
  builderProjectFormFromDetail,
  initialBuilderProjectForm,
  validateBuilderProjectForm,
  type BuilderProjectFormState,
} from '../utils/builderProjectForm';
import { hasGoogleMapsKey } from '../config/env';
import type { SelectedPlace } from '../services/googlePlaces';

type Props = NativeStackScreenProps<RootStackParamList, 'BuilderProjectForm'>;

export default function BuilderProjectFormScreen({ navigation, route }: Props) {
  const projectId = route.params?.projectId;
  const isEdit = projectId != null;
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState<BuilderProjectFormState>(() =>
    initialBuilderProjectForm(profile?.fullName ?? '')
  );
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadCredits, setUploadCredits] = useState(0);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const detail = await builderProjectsApi.getById(projectId);
      setForm(builderProjectFormFromDetail(detail));
      if (detail.coverImageUrl) {
        setCoverUri(null);
      }
    } catch (e) {
      Alert.alert(
        t('builder.couldNotLoadProjectForm'),
        e instanceof ApiError ? e.message : t('shared.tryAgain'),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  }, [navigation, projectId, t]);

  const loadCredits = useCallback(async () => {
    try {
      const summary = await paymentsApi.getBuilderSummary();
      setUploadCredits(Number(summary.projectUploadCredits ?? 0));
    } catch {
      setUploadCredits(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isBuilderRole(profile?.role)) {
        navigation.replace('Home');
        return;
      }
      void loadCredits();
      if (isEdit) void loadProject();
    }, [isEdit, loadCredits, loadProject, navigation, profile?.role])
  );

  function patch<K extends keyof BuilderProjectFormState>(
    key: K,
    value: BuilderProjectFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  function handlePlaceSelected(place: SelectedPlace | null) {
    if (!place) {
      patch('selectedPlace', null);
      return;
    }
    setForm((prev) => ({
      ...prev,
      selectedPlace: place,
      locationQuery: place.label,
      address: place.address || prev.address,
      areaName: place.areaName || prev.areaName,
    }));
    setFormError(null);
  }

  async function pickCover() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('postProperty.photosAccessTitle'), t('builder.coverPhotoAccess'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setCoverUri(result.assets[0].uri);
    setFormError(null);
  }

  async function handleSubmit() {
    const validationError = validateBuilderProjectForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!isEdit && form.isPublished && uploadCredits <= 0) {
      Alert.alert(
        t('builder.uploadCreditTitle'),
        t('builder.uploadCreditBody'),
        [
          { text: t('shared.viewPlans'), onPress: () => navigation.navigate('BuilderPayments') },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      let coverUrl = form.coverImageUrl.trim() || null;
      if (coverUri) {
        const uploaded = await propertiesApi.uploadImage({
          uri: coverUri,
          fileName: `cover-${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        });
        coverUrl = uploaded.imageUrl;
      }

      const body = buildUpsertBuilderProjectRequest(form, coverUrl);
      if (isEdit && projectId) {
        await builderProjectsApi.update(projectId, body);
        Alert.alert(
          t('builder.projectUpdated'),
          t('builder.projectUpdatedBody'),
          [
            {
              text: t('builder.dashboardBtn'),
              onPress: () => navigation.navigate('BuilderDashboard'),
            },
            { text: t('common.ok') },
          ]
        );
      } else {
        const created = await builderProjectsApi.create(body);
        Alert.alert(
          t('builder.projectSubmitted'),
          t('builder.projectSubmittedBody'),
          [
            {
              text: t('builder.viewProject'),
              onPress: () =>
                navigation.replace('BuilderProjectDetails', {
                  projectId: created.id,
                  title: created.projectName,
                }),
            },
            {
              text: t('builder.dashboardBtn'),
              onPress: () => navigation.navigate('BuilderDashboard'),
            },
          ]
        );
      }
    } catch (e) {
      setFormError(
        e instanceof ApiError
          ? e.message
          : isEdit
            ? t('builder.couldNotUpdateProject')
            : t('builder.couldNotCreateProject')
      );
    } finally {
      setSubmitting(false);
    }
  }

  const title = isEdit ? t('builder.editProject') : t('builder.postNewProject');
  const submitLabel = isEdit ? t('builder.saveChanges') : t('builder.submitProject');

  return (
    <AuthenticatedScreenLayout showBack onBack={() => navigation.goBack()}>
      {loading ? (
        <BrandLoading message={t('builder.loadingProject')} />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 56}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: insets.bottom + spacing.xxl },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.pageTitle}>{title}</Text>
            <Text style={styles.pageSub}>{t('builder.pageSub')}</Text>

            {!isEdit && form.isPublished && uploadCredits <= 0 ? (
              <Pressable
                style={styles.creditBanner}
                onPress={() => navigation.navigate('BuilderPayments')}
              >
                <Ionicons name="wallet-outline" size={20} color={colors.builder} />
                <Text style={styles.creditBannerText}>{t('builder.creditBannerText')}</Text>
              </Pressable>
            ) : null}

            {formError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <SectionCard title={t('builder.sectionBasics')} icon="business-outline" accent={colors.builder}>
              <AuthTextField
                label={t('builder.projectName')}
                icon="home-outline"
                value={form.projectName}
                onChangeText={(v) => patch('projectName', v)}
                placeholder={t('builder.projectNamePlaceholder')}
              />
              <AuthTextField
                label={t('builder.builderName')}
                icon="ribbon-outline"
                value={form.builderName}
                onChangeText={(v) => patch('builderName', v)}
              />
              <AuthTextField
                label={t('builder.description')}
                icon="document-text-outline"
                value={form.description}
                onChangeText={(v) => patch('description', v)}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </SectionCard>

            <SectionCard title={t('builder.sectionLocation')} icon="location-outline">
              {hasGoogleMapsKey() ? (
                <PropertyLocationSearch
                  value={form.locationQuery}
                  onChangeText={(v) => patch('locationQuery', v)}
                  selectedPlace={form.selectedPlace}
                  onPlaceSelected={handlePlaceSelected}
                />
              ) : null}
              <AuthTextField
                label={t('builder.address')}
                icon="map-outline"
                value={form.address}
                onChangeText={(v) => patch('address', v)}
              />
              <AuthTextField
                label={t('builder.area')}
                icon="navigate-outline"
                value={form.areaName}
                onChangeText={(v) => patch('areaName', v)}
              />
            </SectionCard>

            <SectionCard title={t('builder.sectionSpecs')} icon="grid-outline">
              <AuthTextField
                label={t('builder.towers')}
                icon="layers-outline"
                value={form.towerCount}
                onChangeText={(v) => patch('towerCount', v)}
                keyboardType="number-pad"
              />
              <AuthTextField
                label={t('builder.totalUnits')}
                icon="apps-outline"
                value={form.totalUnits}
                onChangeText={(v) => patch('totalUnits', v)}
                keyboardType="number-pad"
              />
              <Text style={styles.fieldLabel}>{t('builder.projectStatus')}</Text>
              <View style={styles.chipRow}>
                {BUILDER_PROJECT_STATUSES.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => patch('projectStatus', status)}
                    style={[
                      styles.chip,
                      form.projectStatus === status && styles.chipOn,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.projectStatus === status && styles.chipTextOn,
                      ]}
                    >
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <AuthTextField
                label={t('builder.possessionDate')}
                icon="calendar-outline"
                value={form.possessionDate}
                onChangeText={(v) => patch('possessionDate', v)}
                placeholder="YYYY-MM-DD"
              />
            </SectionCard>

            <SectionCard title={t('builder.sectionRera')} icon="shield-checkmark-outline">
              <AuthTextField
                label={t('builder.reraNumber')}
                icon="shield-outline"
                value={form.reraNumber}
                onChangeText={(v) => patch('reraNumber', v)}
              />
              <ToggleRow
                label={t('builder.loanFinance')}
                value={form.loanFinanceAvailable}
                onValueChange={(v) => patch('loanFinanceAvailable', v)}
              />
              <ToggleRow
                label={t('builder.apfAvailable')}
                value={form.apfNumberAvailable}
                onValueChange={(v) => patch('apfNumberAvailable', v)}
              />
              {form.apfNumberAvailable ? (
                <AuthTextField
                  label={t('builder.apfNumber')}
                  icon="document-outline"
                  value={form.apfNumber}
                  onChangeText={(v) => patch('apfNumber', v)}
                />
              ) : null}
              <AuthTextField
                label={t('builder.preferredBank')}
                icon="business-outline"
                value={form.preferredBank}
                onChangeText={(v) => patch('preferredBank', v)}
              />
              <AuthTextField
                label={t('builder.amenitiesOptional')}
                icon="leaf-outline"
                value={form.amenities}
                onChangeText={(v) => patch('amenities', v)}
                multiline
                numberOfLines={3}
              />
            </SectionCard>

            <SectionCard title={t('builder.sectionCover')} icon="image-outline">
              <Pressable style={styles.coverBtn} onPress={pickCover}>
                <Ionicons name="camera-outline" size={20} color={colors.builder} />
                <Text style={styles.coverBtnText}>
                  {coverUri || form.coverImageUrl ? t('builder.changeCover') : t('builder.addCover')}
                </Text>
              </Pressable>
              <AuthTextField
                label={t('builder.coverUrl')}
                icon="link-outline"
                value={form.coverImageUrl}
                onChangeText={(v) => patch('coverImageUrl', v)}
                placeholder={t('builder.urlPlaceholder')}
                autoCapitalize="none"
              />
            </SectionCard>

            <SectionCard title={t('builder.sectionPublish')} icon="globe-outline">
              <ToggleRow
                label={t('builder.publishPublicly')}
                value={form.isPublished}
                onValueChange={(v) => patch('isPublished', v)}
              />
              <Text style={styles.hint}>
                {isEdit ? t('builder.editReviewHint') : t('builder.draftHint')}
              </Text>
            </SectionCard>

            <GradientButton
              label={submitting ? t('builder.saving') : submitLabel}
              loading={submitting}
              onPress={handleSubmit}
              disabled={submitting}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </AuthenticatedScreenLayout>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.builderBorder }}
        thumbColor={value ? colors.builder : colors.slateLight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
  },
  pageSub: {
    fontSize: 14,
    color: colors.slateMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  creditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.builderSoft,
    borderWidth: 1,
    borderColor: colors.builderBorder,
  },
  creditBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.builder,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.errorSoft,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: {
    backgroundColor: colors.builder,
    borderColor: colors.builder,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slateMuted,
  },
  chipTextOn: {
    color: colors.heroText,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.navy,
    fontWeight: '600',
  },
  coverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.builderBorder,
    backgroundColor: colors.builderSoft,
    marginBottom: spacing.md,
  },
  coverBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.builder,
  },
  hint: {
    fontSize: 12,
    color: colors.slateLight,
    lineHeight: 18,
  },
});
