import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Mapbox, {
  Atmosphere,
  Camera,
  CircleLayer,
  FillExtrusionLayer,
  type Location,
  type MapState,
  MapView,
  MarkerView,
  ModelLayer,
  Models,
  ShapeSource,
  SkyLayer,
  UserLocation,
  UserLocationRenderMode,
  VectorSource,
} from '@rnmapbox/maps';

import {MAPBOX_PUBLIC_API_KEY} from '@env';

import characterImage from './Character.png';
import playerModel from './player.glb';
import {styles} from './src/appStyles';
import {BottomActionBar} from './src/components/BottomActionBar';
import {CameraOverlay} from './src/components/CameraOverlay';
import {CharacterScreen} from './src/components/CharacterScreen';
import {FriendsDropdown} from './src/components/FriendsDropdown';
import {
  buildPlayerModelStyle,
  daytimeFogStyle,
  gamifiedBuildingExtrusion,
  gamifiedMapStyleLight,
  prettySkyStyle,
} from './src/mapStyles';
import {
  type CapturedPhoto,
  showCameraNotReadyAlert,
} from './src/services/cameraUpload';
import {createPost} from './src/services/postsApi';
import {
  buildPlayerFeatureCollection,
  PLAYER_MODEL_ID,
} from './src/poles';
import {getAllPosts, type PostRecord} from './src/services/postsApi';
import {
  getSpeciesDetailsForPost,
  type SpeciesDetailRecord,
} from './src/services/speciesApi';
import {getBirdDescriptionBySpeciesName} from './src/services/birdDescriptionLookup';

Mapbox.setAccessToken(
  MAPBOX_PUBLIC_API_KEY,
);

type CameraMode =
  | {type: 'player'}
  | {type: 'bird'; birdId: string}
  | {type: 'free'};

const DEFAULT_CENTER: [number, number] = [-91.1805, 30.4081];

function getBirdById(birdId: string | null, birds: PostRecord[]) {
  if (!birdId) {
    return null;
  }

  return birds.find(bird => bird.postId === birdId) ?? null;
}

function getDistanceInMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const earthRadius = 6371000;

  const psi1 = toRadians(latitudeA);
  const psi2 = toRadians(latitudeB);
  const deltaPsi = toRadians(latitudeB - latitudeA);
  const deltaLambda = toRadians(longitudeB - longitudeA);

  const a =
    Math.sin(deltaPsi / 2) ** 2 +
    Math.cos(psi1) * Math.cos(psi2) * Math.sin(deltaLambda / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function findClosestBird(
  latitude: number,
  longitude: number,
  birds: PostRecord[],
) {
  if (birds.length === 0) {
    return null;
  }

  return birds.reduce((closestBird, currentBird) => {
    const currentDistance = getDistanceInMeters(
      currentBird.latitude,
      currentBird.longitude,
      latitude,
      longitude,
    );
    const closestDistance = getDistanceInMeters(
      closestBird.latitude,
      closestBird.longitude,
      latitude,
      longitude,
    );

    return currentDistance < closestDistance ? currentBird : closestBird;
  });
}

function getPlayerCoordinate(location: Location | null): [number, number] | null {
  const longitude = location?.coords.longitude;
  const latitude = location?.coords.latitude;

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  return [longitude, latitude];
}

const App = () => {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera>(null);
  const previousZoomRef = useRef<number | null>(null);
  const [birds, setBirds] = useState<PostRecord[]>([]);
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(
    Platform.OS === 'ios',
  );
  const [cameraMode, setCameraMode] = useState<CameraMode>({type: 'player'});
  const [isCameraOverlayVisible, setIsCameraOverlayVisible] = useState(false);
  const [isCharacterScreenVisible, setIsCharacterScreenVisible] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);
  const [playerLocation, setPlayerLocation] = useState<Location | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [playerPulsePhase, setPlayerPulsePhase] = useState(0);
  const [selectedBirdSpeciesDetails, setSelectedBirdSpeciesDetails] =
    useState<SpeciesDetailRecord | null>(null);
  const [isSelectedBirdDetailsLoading, setIsSelectedBirdDetailsLoading] =
    useState(false);
  const detailsDrawerY = useRef(new Animated.Value(220)).current;
  const bottomControlOffset = Math.max(insets.bottom - 6, 0);
  const followButtonBottom = bottomControlOffset + 112;

  const selectedBird = useMemo(
    () => getBirdById(selectedBirdId, birds),
    [birds, selectedBirdId],
  );
  const selectedBirdJsonDetails = useMemo(
    () =>
      getBirdDescriptionBySpeciesName(
        selectedBirdSpeciesDetails?.name ?? selectedBirdSpeciesDetails?.species,
      ),
    [selectedBirdSpeciesDetails?.name, selectedBirdSpeciesDetails?.species],
  );
  const playerCoordinate = useMemo(
    () => getPlayerCoordinate(playerLocation),
    [playerLocation],
  );
  const nearestBird = useMemo(() => {
    if (!playerLocation) {
      return null;
    }

    return findClosestBird(
      playerLocation.coords.latitude,
      playerLocation.coords.longitude,
      birds,
    );
  }, [birds, playerLocation]);
  const mapCenterFallback = useMemo<[number, number]>(() => {
    const firstBird = birds[0];

    if (firstBird) {
      return [firstBird.longitude, firstBird.latitude];
    }

    return DEFAULT_CENTER;
  }, [birds]);
  const playerFeature = useMemo(
    () =>
      buildPlayerFeatureCollection(
        playerLocation
          ? {
              latitude: playerLocation.coords.latitude,
              longitude: playerLocation.coords.longitude,
              heading: playerLocation.coords.heading,
            }
          : null,
      ),
    [playerLocation],
  );
  const playerModelStyle = useMemo(() => buildPlayerModelStyle(), []);
  const playerGroundRingStyle = useMemo(
    () => ({
      circleColor: 'rgba(14, 165, 233, 0.16)',
      circleStrokeColor: '#0ea5e9',
      circleStrokeWidth: 2,
      circleRadius: 30,
      circlePitchAlignment: 'map',
      circlePitchScale: 'map',
    }),
    [],
  );
  const playerPulseRingStyle = useMemo(
    () => ({
      circleColor: 'rgba(14, 165, 233, 0.08)',
      circleStrokeColor: 'rgba(14, 165, 233, 0.9)',
      circleStrokeWidth: 4,
      circleRadius: 42 + Math.sin(playerPulsePhase) * 10,
      circleOpacity: 0.22 + ((Math.sin(playerPulsePhase) + 1) / 2) * 0.2,
      circlePitchAlignment: 'map',
      circlePitchScale: 'map',
    }),
    [playerPulsePhase],
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

  useEffect(() => {
    async function loadBirds() {
      try {
        const nextBirds = await getAllPosts();
        setBirds(nextBirds);
      } catch {
        setBirds([]);
      }
    }

    loadBirds().catch(() => {
      setBirds([]);
    });
  }, [loggedInUsername]);

  useEffect(() => {
    if (!selectedBird) {
      setSelectedBirdSpeciesDetails(null);
      setIsSelectedBirdDetailsLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadSelectedBirdDetails() {
      setIsSelectedBirdDetailsLoading(true);

      try {
        const nextDetails = await getSpeciesDetailsForPost(selectedBird.postId);
        if (!isCancelled) {
          setSelectedBirdSpeciesDetails(nextDetails);
        }
      } catch {
        if (!isCancelled) {
          setSelectedBirdSpeciesDetails(null);
        }
      } finally {
        if (!isCancelled) {
          setIsSelectedBirdDetailsLoading(false);
        }
      }
    }

    loadSelectedBirdDetails().catch(() => {
      if (!isCancelled) {
        setSelectedBirdSpeciesDetails(null);
        setIsSelectedBirdDetailsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedBird]);

  useEffect(() => {
    if (!cameraRef.current || !isMapReady) {
      return;
    }

    if (cameraMode.type === 'player') {
      if (!playerCoordinate) {
        return;
      }

      cameraRef.current.setCamera({
        centerCoordinate: playerCoordinate,
        zoomLevel: 18.6,
        pitch: 80,
        heading: playerLocation?.coords.heading ?? 0,
        padding: {
          top: 220,
          right: 0,
          bottom: 60,
          left: 0,
        },
        animationDuration: 900,
      });
      return;
    }

    if (cameraMode.type === 'free') {
      cameraRef.current.setCamera({
        pitch: 20,
        animationDuration:900,
      });
      return;
    }

    const bird = getBirdById(cameraMode.birdId, birds);
    if (!bird) {
      return;
    }

    cameraRef.current.setCamera({
      centerCoordinate: [bird.longitude, bird.latitude],
      zoomLevel: 18,
      pitch: 80,
      heading: 35,
      padding: {
        top: 800,
        right: 0,
        bottom: 120,
        left: 0,
      },
      animationDuration: 900,
    });
  }, [birds, cameraMode, isMapReady, playerCoordinate, playerLocation]);

  useEffect(() => {
    Animated.spring(detailsDrawerY, {
      toValue: selectedBird ? 0 : 400,
      useNativeDriver: true,
      tension: 68,
      friction: 11,
    }).start();
  }, [detailsDrawerY, selectedBird]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerPulsePhase(phase => {
        const nextPhase = phase + 0.14;
        return nextPhase >= Math.PI * 2 ? nextPhase - Math.PI * 2 : nextPhase;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const focusBird = (bird: PostRecord) => {
    setSelectedBirdId(bird.postId);
    setCameraMode({type: 'bird', birdId: bird.postId});
  };

  const handleNearestBird = () => {
    if (!nearestBird) {
      return;
    }

    focusBird(nearestBird);
  };

  const handlePlayerLocationUpdate = (location: Location) => {
    setPlayerLocation(location);
  };

  const handleFollowPlayer = () => {
    if (!playerLocation) {
      return;
    }

    setSelectedBirdId(null);
    setCameraMode({type: 'player'});
  };

  const handleFreeLook = () => {
    setSelectedBirdId(null);
    setCameraMode({type: 'free'});
  };

  const handleMapPress = () => {
    if (cameraMode.type === 'free') {
      return;
    }

    handleFreeLook();
  };

  const handleCameraChanged = (state: MapState) => {
    const nextZoom = state.properties.zoom;
    const previousZoom = previousZoomRef.current;

    previousZoomRef.current = nextZoom;

    if (cameraMode.type === 'free' || !state.gestures.isGestureActive) {
      return;
    }

    if (previousZoom !== null && nextZoom < previousZoom - 0.02) {
      handleFreeLook();
    }
  };

  const handleCameraCapture = async (photo: CapturedPhoto) => {
    if (!playerLocation) {
      showCameraNotReadyAlert(
        'Your location is required before creating a post. Wait for GPS, then try again.',
      );
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const createdBird = await createPost(photo, {
        latitude: playerLocation.coords.latitude,
        longitude: playerLocation.coords.longitude,
      });
      setBirds(currentBirds => [createdBird, ...currentBirds]);
      focusBird(createdBird);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to capture a photo.';
      showCameraNotReadyAlert(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCameraPress = () => {
    setIsCameraOverlayVisible(true);
  };

  const handleCameraOverlayClose = () => {
    if (isUploadingPhoto) {
      return;
    }

    setIsCameraOverlayVisible(false);
  };

  const handleCameraOverlayCapture = async (photo: CapturedPhoto) => {
    setIsCameraOverlayVisible(false);
    await handleCameraCapture(photo);
  };

  const handleCharacterPress = () => {
    setIsCharacterScreenVisible(true);
  };

  const handleCharacterScreenClose = () => {
    setIsCharacterScreenVisible(false);
  };

  const handleLoginStateChange = (username: string) => {
    setLoggedInUsername(username);
  };

  const handleFriendsToggle = () => {
    setIsFriendsOpen(current => !current);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>

        {/*Base Map View*/}
        <MapView
          attributionEnabled={false}
          compassEnabled
          compassFadeWhenNorth
          compassPosition={{right: 16, top: 72}}
          logoEnabled={false}
          style={styles.map}
          styleJSON={JSON.stringify(gamifiedMapStyleLight)}
          scaleBarEnabled
          scaleBarPosition={{right: 200, top: 18}}
          onCameraChanged={handleCameraChanged}
          onPress={handleMapPress}
          onDidFinishLoadingMap={() => {
            setIsMapReady(true);
          }}>
          <Camera
            ref={cameraRef}
            centerCoordinate={playerCoordinate ?? mapCenterFallback}
            zoomLevel={17}
            pitch={80}
            heading={25}
          />

          <Atmosphere style={daytimeFogStyle} />
          <SkyLayer id="pretty-sky" style={prettySkyStyle} />

          {hasLocationPermission ? (
            <UserLocation
              visible={false}
              animated
              minDisplacement={1}
              renderMode={UserLocationRenderMode.Native}
              androidRenderMode="gps"
              showsUserHeadingIndicator
              onUpdate={handlePlayerLocationUpdate}
            />
          ) : null}

            {/*Bird Card Models*/}
          <Models
            models={{
              [PLAYER_MODEL_ID]: playerModel,
            }}
          />

          <ShapeSource id="player-source" shape={playerFeature}>
            <CircleLayer id="player-pulse-ring" style={playerPulseRingStyle} />
            <CircleLayer id="player-ground-ring" style={playerGroundRingStyle} />
            <ModelLayer id="player-model" style={playerModelStyle} />
          </ShapeSource>
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
              style={gamifiedBuildingExtrusion}
            />
          </VectorSource>
          
        

          {birds.map(bird => (
            <MarkerView
              key={`bird-image-${bird.postId}`}
              coordinate={[bird.longitude, bird.latitude]}
              anchor={{x: 0.5, y: 0.9}}
              allowOverlap
              allowOverlapWithPuck>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Select bird post"
                onPress={() => focusBird(bird)}
                style={styles.poleMarkerWrap}>
                <View
                  style={[
                    styles.poleImageBillboard,
                    selectedBirdId === bird.postId &&
                      styles.poleImageBillboardSelected,
                  ]}>
                  <Image
                    source={{uri: bird.imageUrl}}
                    style={styles.poleImage}
                    resizeMode="cover"
                  />
                </View>
                <View
                  style={[
                    styles.poleMarkerTail,
                    selectedBirdId === bird.postId &&
                      styles.poleMarkerTailSelected,
                  ]}
                />
              </Pressable>
            </MarkerView>
          ))}

        
        </MapView>
        

        {/*UI Navigatin*/}
        <View style={styles.topBar}>
          <FriendsDropdown
            open={isFriendsOpen}
            onToggle={handleFriendsToggle}
          />
        </View>

        <View
          style={[
            styles.nearbyBirdCardWrap,
            {
              bottom: bottomControlOffset,
            },
          ]}>
          <Pressable
            style={[
              styles.nearbyBirdCard,
              !nearestBird && styles.followButtonDisabled,
              cameraMode.type === 'bird' && styles.nearbyBirdCardActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              nearestBird
                ? 'Focus nearby bird'
                : 'Nearby bird unavailable'
            }
            disabled={!nearestBird}
            onPress={handleNearestBird}>
            <Text style={styles.nearbyBirdLabel}>Nearby</Text>
            {nearestBird ? (
              <View style={styles.nearbyBirdImageFrame}>
                <Image
                  source={{uri: nearestBird.imageUrl}}
                  style={styles.nearbyBirdImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.nearbyBirdPlaceholder} />
            )}
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.followButtonFloating,
            styles.followButton,
            !playerLocation && styles.followButtonDisabled,
            {
              bottom: followButtonBottom,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Follow your location"
          disabled={!playerLocation}
          onPress={handleFollowPlayer}>
          <View style={styles.followIconOuterRing}>
            <View style={styles.followIconInnerRing}>
              <View
                style={[
                  styles.followIconDot,
                  cameraMode.type === 'player' && styles.followIconDotActive,
                ]}
              />
            </View>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open character screen"
          onPress={handleCharacterPress}
          style={[
            styles.characterButton,
            {
              bottom: bottomControlOffset,
            },
          ]}>
          <Image
            source={characterImage}
            style={styles.characterButtonImage}
            resizeMode="contain"
          />
          {loggedInUsername ? <View style={styles.characterOnlineDot} /> : null}
        </Pressable>

        <Animated.View
          pointerEvents={selectedBird ? 'auto' : 'none'}
          style={[
            styles.detailsCard,
            {
              transform: [{translateY: detailsDrawerY}],
            },
          ]}>
          {selectedBird ? (
            <>
            <Image source={{uri: selectedBird.imageUrl}} style={styles.thumbnail} />
            <View style={styles.detailsText}>
              <Text style={styles.detailsTitle}>
                {selectedBirdSpeciesDetails?.name ??
                  selectedBirdJsonDetails?.species ??
                  'Bird Sighting'}
              </Text>
              <Text style={styles.detailsStatus}>
                {selectedBirdSpeciesDetails?.species ??
                  selectedBirdJsonDetails?.rarity ??
                  'Community post'}
              </Text>
              <Text style={styles.detailsBody}>
                {isSelectedBirdDetailsLoading
                  ? 'Loading bird details...'
                  : selectedBirdSpeciesDetails?.description ??
                    selectedBirdJsonDetails?.description ??
                    'No bird description is available for this post yet.'}
              </Text>
              {selectedBirdJsonDetails?.geographic_range ? (
                <Text style={styles.detailsMeta}>
                  Range: {selectedBirdJsonDetails.geographic_range}
                </Text>
              ) : null}
              {selectedBirdJsonDetails?.average_weight ? (
                <Text style={styles.detailsMeta}>
                  Average weight: {selectedBirdJsonDetails.average_weight}
                </Text>
              ) : null}
              <Text style={styles.detailsMeta}>
                Captured at {selectedBird.latitude.toFixed(4)},{' '}
                {selectedBird.longitude.toFixed(4)}
              </Text>
            </View>
            </>
          ) : null}
        </Animated.View>

        <BottomActionBar
          busy={isUploadingPhoto}
          onCameraPress={handleCameraPress}
          style={{bottom: bottomControlOffset}}
        />

        <CameraOverlay
          visible={isCameraOverlayVisible}
          busy={isUploadingPhoto}
          onClose={handleCameraOverlayClose}
          onCapture={handleCameraOverlayCapture}
        />

        <CharacterScreen
          visible={isCharacterScreenVisible}
          onClose={handleCharacterScreenClose}
          onLoginStateChange={handleLoginStateChange}
        />

        {!loggedInUsername ? (
          <View style={styles.authGateOverlay} pointerEvents="box-none">
            <View style={styles.authGateCard}>
              <Text style={styles.authGateTitle}>Log in to see birds</Text>
              <Text style={styles.authGateBody}>
                Sign in to load community posts and explore bird sightings on the
                map.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open login"
                onPress={handleCharacterPress}
                style={styles.authGateButton}>
                <Text style={styles.authGateButtonText}>Open Login</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* <View style={styles.cameraModeDebug}>
          <Text style={styles.cameraModeDebugText}>
            Mode: {cameraMode.type}
          </Text>
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default App;
