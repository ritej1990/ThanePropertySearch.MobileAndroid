import type {
  BuilderProjectDetail,
  BuilderProjectSummary,
  BuilderUnit,
} from '../api/builderTypes';
import { extractRawBuilderMedia, normalizeBuilderMedia } from './builderMedia';
import { resolveImageUrl } from './imageUrl';

function isAvailableUnit(unit: BuilderUnit): boolean {
  return unit.availabilityStatus?.trim().toLowerCase() === 'available';
}

/** List DTO includes these; detail DTO often does not — derive from units when missing. */
export function enrichBuilderProject<T extends BuilderProjectSummary>(
  project: T & { units?: BuilderUnit[] }
): T {
  const units = project.units ?? [];
  let availableUnits = project.availableUnits;
  let startingPrice = project.startingPrice;

  if (availableUnits == null || Number.isNaN(availableUnits)) {
    availableUnits = units.filter(isAvailableUnit).length;
  }

  if (startingPrice == null || Number.isNaN(startingPrice)) {
    const prices = units
      .filter(isAvailableUnit)
      .map((u) => u.price)
      .filter((p) => Number.isFinite(p) && p > 0);
    if (prices.length === 0) {
      const allPrices = units.map((u) => u.price).filter((p) => Number.isFinite(p) && p > 0);
      startingPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    } else {
      startingPrice = Math.min(...prices);
    }
  }

  const media = normalizeBuilderMedia(extractRawBuilderMedia(project));
  const galleryUrl = media.find(
    (m) => m.mediaType?.toLowerCase() === 'gallery' && m.url?.trim()
  )?.url;
  const coverImageUrl =
    project.coverImageUrl?.trim() ||
    resolveImageUrl(galleryUrl) ||
    galleryUrl?.trim() ||
    '';

  return {
    ...project,
    availableUnits,
    startingPrice,
    coverImageUrl,
  };
}

export function enrichBuilderProjectDetail(
  project: BuilderProjectDetail
): BuilderProjectDetail {
  const enriched = enrichBuilderProject(project) as BuilderProjectDetail;
  return {
    ...enriched,
    media: normalizeBuilderMedia(extractRawBuilderMedia(enriched)),
  };
}
