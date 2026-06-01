import { hasGoogleMapsKey, THANE_MAP_CENTER } from '../config/env';
import type { BuilderProjectDetail, UpsertBuilderProjectRequest } from '../api/builderTypes';
import type { SelectedPlace } from '../services/googlePlaces';

export const BUILDER_PROJECT_STATUSES = [
  'Planning',
  'Under construction',
  'Ready to move',
  'Completed',
] as const;

export type BuilderProjectFormState = {
  projectName: string;
  builderName: string;
  description: string;
  address: string;
  areaName: string;
  towerCount: string;
  totalUnits: string;
  projectStatus: string;
  possessionDate: string;
  reraNumber: string;
  loanFinanceAvailable: boolean;
  apfNumberAvailable: boolean;
  apfNumber: string;
  preferredBank: string;
  amenities: string;
  coverImageUrl: string;
  isPublished: boolean;
  selectedPlace: SelectedPlace | null;
  locationQuery: string;
};

export function initialBuilderProjectForm(builderName = ''): BuilderProjectFormState {
  return {
    projectName: '',
    builderName,
    description: '',
    address: '',
    areaName: '',
    towerCount: '1',
    totalUnits: '0',
    projectStatus: 'Planning',
    possessionDate: '',
    reraNumber: '',
    loanFinanceAvailable: false,
    apfNumberAvailable: false,
    apfNumber: '',
    preferredBank: '',
    amenities: '',
    coverImageUrl: '',
    isPublished: true,
    selectedPlace: null,
    locationQuery: '',
  };
}

export function builderProjectFormFromDetail(
  project: BuilderProjectDetail
): BuilderProjectFormState {
  const possession =
    project.possessionDate && project.possessionDate.length >= 10
      ? project.possessionDate.slice(0, 10)
      : '';

  return {
    projectName: project.projectName ?? '',
    builderName: project.builderName ?? '',
    description: project.description ?? '',
    address: project.address ?? '',
    areaName: project.areaName ?? '',
    towerCount: String(project.towerCount ?? 1),
    totalUnits: String(project.totalUnits ?? 0),
    projectStatus: project.projectStatus || 'Planning',
    possessionDate: possession,
    reraNumber: project.reraNumber ?? '',
    loanFinanceAvailable: Boolean(project.loanFinanceAvailable),
    apfNumberAvailable: Boolean(project.apfNumberAvailable),
    apfNumber: project.apfNumber ?? '',
    preferredBank: project.preferredBank ?? '',
    amenities: project.amenities ?? '',
    coverImageUrl: project.coverImageUrl ?? '',
    isPublished: Boolean(project.isPublished),
    selectedPlace: {
      placeId: `project-${project.id}`,
      label: project.areaName || project.address,
      address: project.address,
      areaName: project.areaName,
      pincode: '',
      latitude: project.latitude,
      longitude: project.longitude,
    },
    locationQuery: project.areaName || project.address,
  };
}

function parseIntField(value: string, label: string): number | null {
  const n = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function validateBuilderProjectForm(form: BuilderProjectFormState): string | null {
  if (!form.projectName.trim()) return 'Project name is required.';
  if (!form.builderName.trim()) return 'Builder / developer name is required.';
  if (!form.description.trim()) return 'Description is required.';
  if (!form.address.trim()) return 'Address is required.';
  if (!form.areaName.trim()) return 'Area is required.';
  if (!form.reraNumber.trim()) return 'RERA number is required.';
  if (form.apfNumberAvailable && !form.apfNumber.trim()) {
    return 'APF number is required when APF is marked available.';
  }
  if (hasGoogleMapsKey() && !form.selectedPlace) {
    return 'Pick the project location on the map.';
  }
  const towers = parseIntField(form.towerCount, 'Towers');
  if (towers == null || towers < 0) return 'Enter a valid tower count.';
  const units = parseIntField(form.totalUnits, 'Units');
  if (units == null || units < 0) return 'Enter a valid total units count.';
  if (form.possessionDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(form.possessionDate.trim())) {
    return 'Possession date must be YYYY-MM-DD.';
  }
  return null;
}

export function buildUpsertBuilderProjectRequest(
  form: BuilderProjectFormState,
  coverUrl: string | null
): UpsertBuilderProjectRequest {
  const lat = form.selectedPlace?.latitude ?? THANE_MAP_CENTER.latitude;
  const lng = form.selectedPlace?.longitude ?? THANE_MAP_CENTER.longitude;

  return {
    projectName: form.projectName.trim(),
    builderName: form.builderName.trim(),
    description: form.description.trim(),
    address: form.address.trim(),
    areaName: form.areaName.trim(),
    latitude: lat,
    longitude: lng,
    towerCount: Number.parseInt(form.towerCount.trim(), 10) || 0,
    totalUnits: Number.parseInt(form.totalUnits.trim(), 10) || 0,
    projectStatus: form.projectStatus,
    possessionDate: form.possessionDate.trim() || null,
    reraNumber: form.reraNumber.trim(),
    loanFinanceAvailable: form.loanFinanceAvailable,
    apfNumberAvailable: form.apfNumberAvailable,
    apfNumber: form.apfNumberAvailable ? form.apfNumber.trim() : null,
    preferredBank: form.preferredBank.trim() || null,
    amenities: form.amenities.trim() || null,
    coverImageUrl: coverUrl?.trim() || form.coverImageUrl.trim() || null,
    isPublished: form.isPublished,
  };
}
