export type Pole = {
  id: number;
  title: string;
  status: 'ok' | 'bad';
  latitude: number;
  longitude: number;
  heading: number;
  imageUri: string;
};

export const INSPECTION_CARD_MODEL_ID = 'inspectionCard';
export const PLAYER_MODEL_ID = 'playerModel';

export const POLES: Pole[] = [
  {
    id: 101,
    title: 'Bald Eagle',
    status: 'ok',
    longitude: -91.179419,
    latitude: 30.408980, 
    heading: 25,
    imageUri:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNjwQfW-WMp6T84H3ZUCStnZoW7ppPIKgaDA&s',
  },
  {
    id: 102,
    title: 'Northern Cardinal',
    status: 'bad',
    longitude: -91.181964,
    latitude: 30.407203,
    heading: 130,
    imageUri:
      'https://www.allaboutbirds.org/guide/assets/photo/297087301-480px.jpg',
  },
  {
    id: 103,
    title: 'Blue Jay',
    status: 'ok',
    longitude: -91.178001,
    latitude: 30.407426,
    heading: 215,
    imageUri:
      'https://stateofthebirds.nhaudubon.org/storage/BLJA.webp',
  },
];

function distanceBetweenInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const earthRadius = 6371000;

  const psi1 = toRadians(lat1);
  const psi2 = toRadians(lat2);
  const deltaPsi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPsi / 2) ** 2 +
    Math.cos(psi1) * Math.cos(psi2) * Math.sin(deltaLambda / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export function findClosestPole(latitude: number, longitude: number, poles: Pole[]) {
  return poles.reduce((closestPole, currentPole) => {
    const currentDistance = distanceBetweenInMeters(
      currentPole.latitude,
      currentPole.longitude,
      latitude,
      longitude,
    );
    const closestDistance = distanceBetweenInMeters(
      closestPole.latitude,
      closestPole.longitude,
      latitude,
      longitude,
    );

    return currentDistance < closestDistance ? currentPole : closestPole;
  });
}

export function buildPoleFeatureCollection(
  poles: Pole[],
  selectedPoleId: number | null,
): any {
  return {
    type: 'FeatureCollection',
    features: poles.map(pole => ({
      type: 'Feature' as const,
      id: pole.id,
      properties: {
        poleId: pole.id,
        title: pole.title,
        heading: pole.heading,
        isBad: pole.status === 'bad',
        selected: pole.id === selectedPoleId,
        imageUri: pole.imageUri,
        modelId: INSPECTION_CARD_MODEL_ID,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [pole.longitude, pole.latitude],
      },
    })),
  };
}

export function getPoleById(poleId: number | null) {
  return POLES.find(pole => pole.id === poleId) ?? null;
}

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
