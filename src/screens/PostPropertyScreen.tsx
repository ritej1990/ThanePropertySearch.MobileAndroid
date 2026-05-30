import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';
import { agentListingsApi, paymentsApi, propertiesApi } from '../api/singleton';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AuthTextField } from '../components/ui/AuthTextField';
import { GradientButton } from '../components/ui/GradientButton';
import { AuthenticatedScreenLayout } from '../components/layout/AuthenticatedScreenLayout';
import { PropertyLocationSearch } from '../components/property/PropertyLocationSearch';
import { BhkSelector } from '../components/postProperty/BhkSelector';
import { ListingTypeSelector } from '../components/postProperty/ListingTypeSelector';
import {
  PhotoPickerSection,
  type PickedImage,
} from '../components/postProperty/PhotoPickerSection';
import { ReviewSummaryCard } from '../components/postProperty/ReviewSummaryCard';
import { SectionCard } from '../components/postProperty/SectionCard';
import { StepProgress } from '../components/postProperty/StepProgress';
import { hasGoogleMapsKey } from '../config/env';
import type { SelectedPlace } from '../services/googlePlaces';
import { colors, radius, spacing } from '../theme';
import {
  POST_PROPERTY_STEPS,
  buildCreateAgentListingRequest,
  buildCreatePropertyRequest,
  initialPostPropertyForm,
  listingDurationFromTier,
  validatePostPropertyForm,
  validatePostPropertyStep,
  type PostPropertyFormState,
  type PostPropertyStepIndex,
} from '../utils/postPropertyForm';
import { isAgentRole, isOwnerRole } from '../utils/roles';

type Props = NativeStackScreenProps<RootStackParamList, 'PostProperty'>;

function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <Ionicons name="alert-circle" size={20} color={colors.error} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export default function PostPropertyScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const isAgent = isAgentRole(profile?.role);
  const isOwner = isOwnerRole(profile?.role);
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<PostPropertyStepIndex>(0);
  const [form, setForm] = useState<PostPropertyFormState>(initialPostPropertyForm);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [publishCredits, setPublishCredits] = useState(0);
  const [activePublishTier, setActivePublishTier] = useState<string | null>(null);

  const loadAgentCredits = useCallback(async () => {
    if (!isAgent) return;
    try {
      const summary = await paymentsApi.getAgentSummary();
      setPublishCredits(summary.publishCredits);
      setActivePublishTier(summary.activePublishTier);
    } catch {
      setPublishCredits(0);
    }
  }, [isAgent]);

  useFocusEffect(
    useCallback(() => {
      if (!isAgent && !isOwner) {
        navigation.replace('Home');
        return;
      }
      loadAgentCredits();
    }, [isAgent, isOwner, loadAgentCredits, navigation])
  );

  const mapsEnabled = hasGoogleMapsKey();
  const isLastStep = step === 3;
  const stepMeta = POST_PROPERTY_STEPS[step];
  const canAgentPost = !isAgent || publishCredits > 0;
  const screenTitle = isAgent ? 'Post agent listing' : 'Post your property';
  const submitLabel = isAgent ? 'Post listing' : 'Post property';

  function patch<K extends keyof PostPropertyFormState>(
    key: K,
    value: PostPropertyFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  function handlePlaceSelected(place: SelectedPlace | null) {
    if (!place) {
      setForm((prev) => ({ ...prev, selectedPlace: null }));
      setFormError(null);
      return;
    }
    setForm((prev) => ({
      ...prev,
      selectedPlace: place,
      locationQuery: place.label,
      address: place.address,
      areaName: place.areaName || prev.areaName,
      pincode: place.pincode || prev.pincode,
    }));
    setFormError(null);
  }

  function scrollTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function goBack() {
    Keyboard.dismiss();
    setFormError(null);
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep((s) => (s - 1) as PostPropertyStepIndex);
    scrollTop();
  }

  function goNext() {
    Keyboard.dismiss();
    const err = validatePostPropertyStep(step, form);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    if (isLastStep) {
      handleSubmit();
      return;
    }
    setStep((s) => (s + 1) as PostPropertyStepIndex);
    scrollTop();
  }

  async function pickImages() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photos access needed',
        'Allow photo library access to add property images.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 8 - images.length,
    });
    if (result.canceled || !result.assets?.length) return;
    const picked: PickedImage[] = result.assets.map((asset, i) => {
      const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
      return {
        uri: asset.uri,
        fileName: asset.fileName ?? `photo-${Date.now()}-${i}.${ext}`,
        mimeType: asset.mimeType ?? 'image/jpeg',
      };
    });
    setImages((prev) => [...prev, ...picked].slice(0, 8));
  }

  async function handleSubmit() {
    if (isAgent && publishCredits <= 0) {
      Alert.alert(
        'Publish credit required',
        'Purchase a listing publish plan before posting. One credit is used per listing.',
        [
          { text: 'View plans', onPress: () => navigation.navigate('AgentPayments') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    const validationError = validatePostPropertyForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const uploadedUrls: string[] = [];
      if (images.length > 0) {
        const [cover, ...rest] = images;
        const coverRes = await propertiesApi.uploadImage(cover);
        uploadedUrls.push(coverRes.imageUrl);
        if (rest.length > 0) {
          const galleryRes = await propertiesApi.uploadImages(rest);
          uploadedUrls.push(...galleryRes.imageUrls);
        }
      }

      if (isAgent) {
        const duration = listingDurationFromTier(activePublishTier);
        const body = buildCreateAgentListingRequest(form, uploadedUrls, duration);
        const created = await agentListingsApi.create(body);
        Alert.alert(
          'Listing submitted',
          'Your agent listing is pending admin review. It will appear on your dashboard once approved.',
          [
            {
              text: 'Agent dashboard',
              onPress: () => navigation.navigate('AgentDashboard'),
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
        void created.id;
      } else {
        const body = buildCreatePropertyRequest(form, uploadedUrls);
        const created = await propertiesApi.create(body);
        Alert.alert(
          'Posted successfully',
          'Your property is pending approval review. It will appear on your dashboard once reviewed.',
          [
            {
              text: 'View listing',
              onPress: () =>
                navigation.replace('PropertyDetails', {
                  propertyId: created.id,
                  title: created.title,
                }),
            },
            {
              text: 'Back to dashboard',
              style: 'cancel',
              onPress: () => navigation.navigate('OwnerDashboard'),
            },
          ]
        );
      }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : isAgent
              ? 'Could not post listing'
              : 'Could not post property';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <SectionCard
            title="Tell us about your property"
            subtitle="A clear title and description help renters find you faster."
            icon="home-outline"
          >
            <AuthTextField
              label="Listing title"
              icon="pricetag-outline"
              value={form.title}
              onChangeText={(v) => patch('title', v)}
              placeholder="Bright 2 BHK with balcony — Hiranandani Estate"
            />
            <Text style={styles.fieldLabel}>Flat configuration</Text>
            <BhkSelector
              value={form.bhkConfiguration}
              onChange={(v) => patch('bhkConfiguration', v)}
            />
            <AuthTextField
              label="Description"
              icon="document-text-outline"
              value={form.description}
              onChangeText={(v) => patch('description', v)}
              placeholder="Furnishing, parking, nearby schools, metro access…"
              multiline
              numberOfLines={5}
              style={styles.textArea}
            />
          </SectionCard>
        );

      case 1:
        return (
          <SectionCard
            title="Pricing & listing type"
            subtitle="Select how you want to list. You can choose more than one."
            icon="wallet-outline"
            accent="#7c3aed"
          >
            <ListingTypeSelector
              isForRent={form.isForRent}
              isForSale={form.isForSale}
              isForPg={form.isForPg}
              onToggle={(key) => patch(key, !form[key])}
            />
            <AuthTextField
              label="Rent / PG amount (₹ per month)"
              icon="cash-outline"
              value={form.rentAmount}
              onChangeText={(v) => patch('rentAmount', v)}
              placeholder="42,000"
              keyboardType="numeric"
            />
            {form.isForSale && (
              <AuthTextField
                label="Sale price (₹)"
                icon="trending-up-outline"
                value={form.sellPrice}
                onChangeText={(v) => patch('sellPrice', v)}
                placeholder="1,85,00,000"
                keyboardType="numeric"
              />
            )}
            <AuthTextField
              label="Security deposit (₹)"
              icon="receipt-outline"
              value={form.depositAmount}
              onChangeText={(v) => patch('depositAmount', v)}
              placeholder="1,25,000"
              keyboardType="numeric"
            />
            <AuthTextField
              label="Built-up area (sq.ft.)"
              icon="resize-outline"
              value={form.builtupSqft}
              onChangeText={(v) => patch('builtupSqft', v)}
              placeholder="980"
              keyboardType="numeric"
            />
            {(form.isForRent || form.isForPg) && (
              <AuthTextField
                label="Available from (optional)"
                icon="calendar-outline"
                value={form.availableFrom}
                onChangeText={(v) => patch('availableFrom', v)}
                placeholder="2026-06-01"
                autoCapitalize="none"
              />
            )}
          </SectionCard>
        );

      case 2:
        return (
          <>
            <SectionCard
              title="Find on Google Maps"
              subtitle="Search your society or street — we fill address, area & pincode for you."
              icon="search-outline"
              accent="#2563eb"
            >
              <PropertyLocationSearch
                value={form.locationQuery}
                onChangeText={(v) => patch('locationQuery', v)}
                selectedPlace={form.selectedPlace}
                onPlaceSelected={handlePlaceSelected}
              />
              {form.selectedPlace && (
                <View style={styles.mapSuccess}>
                  <Ionicons name="checkmark-circle" size={22} color="#15803d" />
                  <View style={styles.mapSuccessText}>
                    <Text style={styles.mapSuccessTitle}>Location pinned</Text>
                    <Text style={styles.mapSuccessSub} numberOfLines={2}>
                      {form.selectedPlace.label}
                    </Text>
                  </View>
                </View>
              )}
            </SectionCard>

            <SectionCard
              title="Address details"
              subtitle="Auto-filled from Maps — tap to edit if needed."
              icon="navigate-outline"
            >
              <AuthTextField
                label="Full address"
                icon="navigate-outline"
                value={form.address}
                onChangeText={(v) => patch('address', v)}
                placeholder={
                  mapsEnabled
                    ? 'Pick a place above'
                    : 'Tower, society, road, Thane West'
                }
                editable={!mapsEnabled || form.selectedPlace != null}
                multiline
                numberOfLines={2}
                style={styles.textArea}
              />
              <AuthTextField
                label="Area / locality"
                icon="map-outline"
                value={form.areaName}
                onChangeText={(v) => patch('areaName', v)}
                placeholder="Thane West, Kolshet"
              />
              <AuthTextField
                label="Pincode"
                icon="mail-outline"
                value={form.pincode}
                onChangeText={(v) =>
                  patch('pincode', v.replace(/[^0-9]/g, '').slice(0, 6))
                }
                placeholder="400607"
                keyboardType="number-pad"
                maxLength={6}
              />
            </SectionCard>
          </>
        );

      case 3:
      default:
        return (
          <>
            <SectionCard
              title="Property photos"
              subtitle="Optional — listings with photos get more inquiries."
              icon="camera-outline"
              accent="#ea580c"
            >
              <PhotoPickerSection
                images={images}
                onAdd={pickImages}
                onRemove={(i) => setImages((prev) => prev.filter((_, j) => j !== i))}
              />
            </SectionCard>
            <ReviewSummaryCard form={form} photoCount={images.length} />
          </>
        );
    }
  }

  return (
    <AuthenticatedScreenLayout showBack onBack={goBack}>
      <View style={styles.screen}>
        <View style={styles.stepBar}>
          <View style={styles.stepBarTop}>
            <Text style={styles.stepBarTitle}>{screenTitle}</Text>
            {isAgent ? (
              <View style={styles.creditBadge}>
                <Ionicons name="ticket-outline" size={13} color="#1d4ed8" />
                <Text style={styles.creditBadgeText}>
                  {publishCredits} credit{publishCredits === 1 ? '' : 's'}
                </Text>
              </View>
            ) : (
              <View style={styles.freeBadge}>
                <Ionicons name="gift-outline" size={13} color="#0f766e" />
                <Text style={styles.freeBadgeText}>Free</Text>
              </View>
            )}
          </View>
          <Text style={styles.stepBarSub}>
            Step {step + 1} of {POST_PROPERTY_STEPS.length} · {stepMeta.title}
          </Text>
          {isAgent && !canAgentPost ? (
            <Pressable
              style={styles.creditsBanner}
              onPress={() => navigation.navigate('AgentPayments')}
            >
              <Ionicons name="information-circle" size={18} color={colors.warning} />
              <Text style={styles.creditsBannerText}>
                No publish credits — buy a plan to post listings
              </Text>
            </Pressable>
          ) : null}
          <StepProgress current={step} />
        </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {formError ? <ErrorBanner message={formError} /> : null}
          {renderStep()}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          {step > 0 && (
            <Pressable style={styles.footerBack} onPress={goBack}>
              <Ionicons name="chevron-back" size={20} color={colors.navy} />
              <Text style={styles.footerBackText}>Back</Text>
            </Pressable>
          )}
          <GradientButton
            label={
              submitting
                ? 'Posting…'
                : isLastStep
                  ? submitLabel
                  : 'Continue'
            }
            loading={submitting}
            disabled={submitting || (isAgent && isLastStep && !canAgentPost)}
            onPress={goNext}
            style={[styles.footerPrimary, step === 0 && styles.footerPrimaryFull]}
          />
        </View>
      </KeyboardAvoidingView>
      </View>
    </AuthenticatedScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  flex: { flex: 1 },
  stepBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepBarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  creditBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  creditsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  creditsBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
    lineHeight: 16,
  },
  stepBarSub: {
    fontSize: 13,
    color: colors.slateLight,
    marginBottom: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slateMuted,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mapSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#dcfce7',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  mapSuccessText: {
    flex: 1,
  },
  mapSuccessTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803d',
  },
  mapSuccessSub: {
    fontSize: 12,
    color: '#166534',
    marginTop: 2,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  footerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  footerBackText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    marginLeft: 2,
  },
  footerPrimary: {
    flex: 1,
  },
  footerPrimaryFull: {
    flex: 1,
  },
});
