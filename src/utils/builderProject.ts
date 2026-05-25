import type {
  BuilderProjectDetail,
  BuilderProjectSummary,
  BuilderUnit,
} from '../api/builderTypes';

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

  const coverImageUrl =
    project.coverImageUrl?.trim() ||
    (Array.isArray((project as BuilderProjectDetail).media)
      ? (project as BuilderProjectDetail).media.find((m) => typeof m === 'string' && m.trim())
          ?.trim() ?? ''
      : '');

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
  return enrichBuilderProject(project) as BuilderProjectDetail;
}
