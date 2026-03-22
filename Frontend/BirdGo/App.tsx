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
  uploadCapturedPhoto,
} from './src/services/cameraUpload';
import {
  buildPlayerFeatureCollection,
  findClosestPole,
  getPoleById,
  PLAYER_MODEL_ID,
  POLES,
  type Pole,
} from './src/poles';

Mapbox.setAccessToken(
  MAPBOX_PUBLIC_API_KEY,
);

type CameraMode =
  | {type: 'player'}
  | {type: 'bird'; birdId: number}
  | {type: 'free'};

const FALLBACK_CENTER: [number, number] = [POLES[0].longitude, POLES[0].latitude];

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
  const nearbyBirdBob = useRef(new Animated.Value(0)).current;
  const previousZoomRef = useRef<number | null>(null);
  const [selectedBirdId, setSelectedBirdId] = useState<number | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(
    Platform.OS === 'ios',
  );
  const [cameraMode, setCameraMode] = useState<CameraMode>({type: 'player'});
  const [isCameraOverlayVisible, setIsCameraOverlayVisible] = useState(false);
  const [isCharacterScreenVisible, setIsCharacterScreenVisible] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [playerLocation, setPlayerLocation] = useState<Location | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [playerPulsePhase, setPlayerPulsePhase] = useState(0);
  const detailsDrawerY = useRef(new Animated.Value(220)).current;

  const selectedBird = getPoleById(selectedBirdId);
  const playerCoordinate = useMemo(
    () => getPlayerCoordinate(playerLocation),
    [playerLocation],
  );
  const nearestBird = useMemo(() => {
    if (!playerLocation) {
      return null;
    }

    return findClosestPole(
      playerLocation.coords.latitude,
      playerLocation.coords.longitude,
      POLES,
    );
  }, [playerLocation]);
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

    const bird = getPoleById(cameraMode.birdId);
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
  }, [cameraMode, isMapReady, playerCoordinate, playerLocation]);

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

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(nearbyBirdBob, {
          toValue: -6,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(nearbyBirdBob, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [nearbyBirdBob]);

  const focusBird = (bird: Pole) => {
    setSelectedBirdId(bird.id);
    setCameraMode({type: 'bird', birdId: bird.id});
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
    setIsUploadingPhoto(true);

    try {
      await uploadCapturedPhoto(photo);
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
            centerCoordinate={playerCoordinate ?? FALLBACK_CENTER}
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
          
        

          {POLES.map(pole => (
            <MarkerView
              key={`pole-image-${pole.id}`}
              coordinate={[pole.longitude, pole.latitude]}
              anchor={{x: 0.5, y: 0.9}}
              allowOverlap
              allowOverlapWithPuck>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Select bird ${pole.title}`}
                onPress={() => focusBird(pole)}
                style={styles.poleMarkerWrap}>
                <View
                  style={[
                    styles.poleImageBillboard,
                    selectedBirdId === pole.id && styles.poleImageBillboardSelected,
                  ]}>
                  <Image
                    source={{uri: pole.imageUri}}
                    style={styles.poleImage}
                    resizeMode="cover"
                  />
                </View>
                <View
                  style={[
                    styles.poleMarkerTail,
                    selectedBirdId === pole.id && styles.poleMarkerTailSelected,
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

        <Animated.View
          style={[
            styles.nearbyBirdCardWrap,
            {
              transform: [{translateY: nearbyBirdBob}],
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
                ? `Focus nearby bird ${nearestBird.title}`
                : 'Nearby bird unavailable'
            }
            disabled={!nearestBird}
            onPress={handleNearestBird}>
            <Text style={styles.nearbyBirdLabel}>Nearby</Text>
            {nearestBird ? (
              <View style={styles.nearbyBirdImageFrame}>
                <Image
                  source={{uri: nearestBird.imageUri}}
                  style={styles.nearbyBirdImage}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.nearbyBirdPlaceholder} />
            )}
          </Pressable>
        </Animated.View>

        <Pressable
          style={[
            styles.followButtonFloating,
            styles.followButton,
            !playerLocation && styles.followButtonDisabled,
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
              bottom: Math.max(insets.bottom - 6, 0),
            },
          ]}>
          <Image
            source={characterImage}
            style={styles.characterButtonImage}
            resizeMode="contain"
          />
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
            <Image source={{uri: selectedBird.imageUri}} style={styles.thumbnail} />
            <View style={styles.detailsText}>
              <Text style={styles.detailsTitle}>{selectedBird.title}</Text>
              <Text style={styles.detailsStatus}>
                Status: {selectedBird.status === 'bad' ? 'Needs repair' : 'Healthy'}
              </Text>
              <Text style={styles.detailsBody}>
                Use the Nearest Bird button to jump to the closest bird, or tap a
                bird marker directly to select it.
              </Text>
            </View>
            </>
          ) : null}
        </Animated.View>

        <BottomActionBar
          busy={isUploadingPhoto}
          onCameraPress={handleCameraPress}
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
        />

        <View style={styles.cameraModeDebug}>
          <Text style={styles.cameraModeDebugText}>
            Mode: {cameraMode.type}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default App;
