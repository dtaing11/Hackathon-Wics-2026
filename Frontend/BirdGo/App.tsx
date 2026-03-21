import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Mapbox, {
  Camera,
  CircleLayer,
  FillExtrusionLayer,
  type Location,
  MapView,
  ModelLayer,
  Models,
  ShapeSource,
  UserLocation,
  UserLocationRenderMode,
  VectorSource,
} from '@rnmapbox/maps';

import {MAPBOX_PUBLIC_API_KEY, MAPBOX_LOCAL_API_KEY} from '@env';

const inspectionCardModel = require('./BoxTextured.glb');

Mapbox.setAccessToken(
  MAPBOX_PUBLIC_API_KEY,
);

type Pole = {
  id: number;
  title: string;
  status: 'ok' | 'bad';
  latitude: number;
  longitude: number;
  heading: number;
  imageUri: string;
};

const INSPECTION_CARD_MODEL_ID = 'inspectionCard';

const POLES: Pole[] = [
  {
    id: 101,
    title: 'Pole 101',
    status: 'ok',
    longitude: -90.09497,
    latitude: 29.98119,
    heading: 25,
    imageUri:
      'https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 102,
    title: 'Pole 102',
    status: 'bad',
    longitude: -90.09542,
    latitude: 29.98182,
    heading: 130,
    imageUri:
      'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 103,
    title: 'Pole 103',
    status: 'ok',
    longitude: -90.09586,
    latitude: 29.98096,
    heading: 215,
    imageUri:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  },
];

//haversine finds distance btween two lat values
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

function findClosestPole(latitude: number, longitude: number, poles: Pole[]) {
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

function buildPoleFeatureCollection(poles: Pole[], selectedPoleId: number | null): any {
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

function getPoleById(poleId: number | null) {
  return POLES.find(pole => pole.id === poleId) ?? null;
}


const App = () => {
  const cameraRef = useRef<Camera>(null);
  const [selectedPoleId, setSelectedPoleId] = useState<number | null>(POLES[0].id);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('satellite');
  const [hasLocationPermission, setHasLocationPermission] = useState(
    Platform.OS === 'ios',
  );
  const [followPlayer, setFollowPlayer] = useState(false);
  const [playerLocation, setPlayerLocation] = useState<Location | null>(null);

  const selectedPole = getPoleById(selectedPoleId);
  const poleFeatures = useMemo(
    () => buildPoleFeatureCollection(POLES, selectedPoleId),
    [selectedPoleId],
  );

  useEffect(() => {
    async function requestLocationPermission() {
      if (Platform.OS !== 'android') {
        return;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Use your location',
          message:
            'BirdGo uses your location to show your position on the map and follow you.',
          buttonPositive: 'Allow',
          buttonNegative: 'Not now',
        },
      );

      setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    }

    requestLocationPermission().catch(() => {
      setHasLocationPermission(false);
    });
  }, []);

  //zoom to pole
  const focusPole = (pole: Pole) => {
    setFollowPlayer(false);
    setSelectedPoleId(pole.id);
    cameraRef.current?.setCamera({
      centerCoordinate: [pole.longitude, pole.latitude],
      zoomLevel: 18,
      pitch: 65,
      heading: 35,
      animationDuration: 900,
    });
  };

  //sphere collision triger
  const handlePolePress = (event: any) => {
    const feature = event.features?.[0];
    const poleId = feature?.properties?.poleId;
    const pole = POLES.find(item => item.id === poleId);

    if (pole) {
      focusPole(pole);
    }
  };

  const handleMapPress = (event: any) => {
    const coordinates = event.geometry?.coordinates;
    if (!coordinates) {
      return;
    }

    const [longitude, latitude] = coordinates;
    const closestPole = findClosestPole(latitude, longitude, POLES);
    focusPole(closestPole);
  };

  const handlePlayerLocationUpdate = (location: Location) => {
    setPlayerLocation(location);
    if (!followPlayer && !selectedPoleId) {
      setFollowPlayer(true);
    }
  };

  const handleFollowPlayer = () => {
    if (!playerLocation) {
      return;
    }

    setSelectedPoleId(null);
    setFollowPlayer(true);
    cameraRef.current?.setCamera({
      centerCoordinate: [
        playerLocation.coords.longitude,
        playerLocation.coords.latitude,
      ],
      zoomLevel: 17,
      pitch: 60,
      heading: playerLocation.coords.heading ?? 0,
      animationDuration: 700,
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>

        {/*Base Map View*/}
        <MapView
          style={styles.map}
          styleURL={
            mapStyle === 'satellite'
              ? Mapbox.StyleURL.SatelliteStreet
              : Mapbox.StyleURL.Street
          }
          onPress={handleMapPress}
          scaleBarEnabled={false}>
          <Camera
            ref={cameraRef}
            centerCoordinate={[-90.09497, 29.98119]}
            zoomLevel={17}
            pitch={55}
            heading={25}
            followUserLocation={followPlayer}
            followZoomLevel={17}
            followPitch={60}
            followHeading={playerLocation?.coords.heading ?? 0}
          />

          {hasLocationPermission ? (
            <UserLocation
              visible
              animated
              minDisplacement={1}
              renderMode={UserLocationRenderMode.Native}
              androidRenderMode="gps"
              showsUserHeadingIndicator
              onUpdate={handlePlayerLocationUpdate}
            />
          ) : null}

          {/*Map Box Building Modelss*/}
          <VectorSource
            id="composite-buildings"
            url="mapbox://mapbox.mapbox-streets-v8">
            <FillExtrusionLayer
              id="3d-buildings"
              sourceLayerID="building"
              filter={['==', ['get', 'extrude'], 'true']}
              minZoomLevel={15}
              maxZoomLevel={22}
              style={buildingExtrusionStyle}
            />
          </VectorSource>
          
          {/*Bird Card Models*/}
          <Models
            models={{
              [INSPECTION_CARD_MODEL_ID]: inspectionCardModel,
            }}
          />

          {/*Bird Click Handling*/}
          <ShapeSource id="pole-source" shape={poleFeatures} onPress={handlePolePress}>
            <CircleLayer id="pole-hit-area" style={poleHitAreaStyle} />
            <ModelLayer id="pole-cards-base" style={baseModelStyle} />
            <ModelLayer
              id="pole-cards-selected"
              filter={['boolean', ['get', 'selected'], false]}
              style={selectedModelStyle}
            />
          </ShapeSource>
        </MapView>
        

        {/*UI Navigatin*/}
        <View style={styles.topBar}>
          <View style={styles.badge}>
            <Text style={styles.badgeTitle}>3D Card Demo</Text>
            <Text style={styles.badgeText}>
              Using your exported local GLB card model now.
            </Text>
          </View>

          <Pressable
            style={styles.toggleButton}
            onPress={() =>
              setMapStyle(current =>
                current === 'satellite' ? 'street' : 'satellite',
              )
            }>
            <Text style={styles.toggleButtonText}>
              {mapStyle === 'satellite' ? 'Street View' : 'Satellite View'}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.followButton,
              !playerLocation && styles.followButtonDisabled,
            ]}
            disabled={!playerLocation}
            onPress={handleFollowPlayer}>
            <Text style={styles.followButtonTitle}>
              {followPlayer ? 'Following You' : 'Follow Me'}
            </Text>
            <Text style={styles.followButtonText}>
              {playerLocation
                ? 'Jump to your live phone location.'
                : hasLocationPermission
                  ? 'Waiting for GPS signal...'
                  : 'Location permission is off.'}
            </Text>
          </Pressable>
        </View>

        {selectedPole ? (
          <View style={styles.detailsCard}>
            <Image source={{uri: selectedPole.imageUri}} style={styles.thumbnail} />
            <View style={styles.detailsText}>
              <Text style={styles.detailsTitle}>{selectedPole.title}</Text>
              <Text style={styles.detailsStatus}>
                Status: {selectedPole.status === 'bad' ? 'Needs repair' : 'Healthy'}
              </Text>
              <Text style={styles.detailsBody}>
                Tap anywhere on the map to select the nearest pole. Tap the model
                directly to select it precisely.
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default App;

//MapBox styling


const baseModelStyle: any = {
  modelId: ['get', 'modelId'],
  modelType: 'common-3d',
  modelScale: [10, 10, 0.6],
  modelRotation: [90, 0, ['get', 'heading']],
  modelTranslation: [0, 0, 0],
  modelOpacity: 0.95,
  modelCastShadows: true,
  modelReceiveShadows: true,
  modelColorMixIntensity: 0.7,
  modelColor: [
    'case',
    ['boolean', ['get', 'isBad'], false],
    '#ef4444',
    '#22c55e',
  ],
};

const selectedModelStyle: any = {
  modelId: ['get', 'modelId'],
  modelType: 'common-3d',
  modelScale: [12, 12, 0.8],
  modelRotation: [90, 0, ['get', 'heading']],
  modelTranslation: [0, 0, 1.5],
  modelOpacity: 1,
  modelColorMixIntensity: 1,
  modelColor: '#f59e0b',
};

const poleHitAreaStyle = {
  circleRadius: 18,
  circleOpacity: 0.01,
  circleStrokeOpacity: 0,
};

const buildingExtrusionStyle: any = {
  fillExtrusionColor: '#cbd5e1',
  fillExtrusionOpacity: 0.72,
  fillExtrusionHeight: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['coalesce', ['get', 'height'], 0],
  ],
  fillExtrusionBase: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['coalesce', ['get', 'min_height'], 0],
  ],
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    gap: 12,
  },
  badge: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
  },
  badgeTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleButtonText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  followButton: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 170,
  },
  followButtonDisabled: {
    opacity: 0.75,
  },
  followButtonTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  followButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16,
  },
  detailsCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    minHeight: 140,
  },
  thumbnail: {
    width: 120,
    backgroundColor: '#cbd5e1',
  },
  detailsText: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  detailsTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  detailsStatus: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsBody: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});
