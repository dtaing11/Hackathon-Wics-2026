export const PLAYER_MODEL_ID = 'playerModel';

export function buildPlayerFeatureCollection(location: {
  latitude: number;
  longitude: number;
  heading?: number | null;
} | null): any {
  if (!location) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature' as const,
        id: 'player',
        properties: {
          modelId: PLAYER_MODEL_ID,
          heading: location.heading ?? 0,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [location.longitude, location.latitude],
        },
      },
    ],
  };
}
