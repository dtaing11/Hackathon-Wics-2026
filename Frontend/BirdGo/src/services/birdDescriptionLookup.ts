type BirdDescriptionRecord = {
  average_weight: string;
  description: string;
  geographic_range: string;
  rarity: string;
  species: string;
};

const BIRD_DESCRIPTIONS = require('../../bird_description.json') as BirdDescriptionRecord[];

function normalizeSpeciesName(value: string) {
  return value.trim().toUpperCase();
}

export function getBirdDescriptionBySpeciesName(speciesName: string | null | undefined) {
  if (!speciesName) {
    return null;
  }

  const normalizedSpeciesName = normalizeSpeciesName(speciesName);

  return (
    BIRD_DESCRIPTIONS.find(
      bird => normalizeSpeciesName(bird.species) === normalizedSpeciesName,
    ) ?? null
  );
}
