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
import {SafeAreaView} from 'react-native-safe-area-context';
import Mapbox, {
  Atmosphere,
  Camera,
  FillExtrusionLayer,
  type Location,
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

import playerModel from './player.glb';
import {styles} from './src/appStyles';
import {BottomActionBar} from './src/components/BottomActionBar';
import {
  buildPlayerModelStyle,
  daytimeFogStyle,
  gamifiedBuildingExtrusion,
  gamifiedMapStyleLight,
  prettySkyStyle,
} from './src/mapStyles';
import {
  captureAndUploadPhoto,
  showCameraNotReadyAlert,
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
  const cameraRef = useRef<Camera>(null);
  const [selectedBirdId, setSelectedBirdId] = useState<number | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(
    Platform.OS === 'ios',
  );
  const [cameraMode, setCameraMode] = useState<CameraMode>({type: 'player'});
  const [playerLocation, setPlayerLocation] = useState<Location | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const detailsDrawerY = useRef(new Animated.Value(220)).current;

  const selectedBird = getPoleById(selectedBirdId);
  const playerCoordinate = useMemo(
    () => getPlayerCoordinate(playerLocation),
    [playerLocation],
  );
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
        zoomLevel: 17,
        pitch: 80,
        heading: playerLocation?.coords.heading ?? 0,
        animationDuration: 600,
      });
      return;
    }

    if (cameraMode.type === 'free') {
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

  const focusBird = (bird: Pole) => {
    setSelectedBirdId(bird.id);
    setCameraMode({type: 'bird', birdId: bird.id});
  };

  const handleNearestBird = () => {
    if (!playerLocation) {
      return;
    }

    const closestBird = findClosestPole(
      playerLocation.coords.latitude,
      playerLocation.coords.longitude,
      POLES,
    );
    focusBird(closestBird);
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

  const handleCameraPress = async () => {
    setIsUploadingPhoto(true);

    try {
      await captureAndUploadPhoto();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to capture a photo.';
      if (message !== 'Camera capture was cancelled.') {
        showCameraNotReadyAlert(message);
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>

        {/*Base Map View*/}
        <MapView
          attributionEnabled={false}
          logoEnabled={false}
          style={styles.map}
          styleJSON={JSON.stringify(gamifiedMapStyleLight)}
          scaleBarEnabled
          scaleBarPosition={{right: 200, top: 18}}
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
          <Pressable
            style={[
              styles.secondaryMapButton,
              cameraMode.type === 'free' && styles.secondaryMapButtonActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Free look mode"
            onPress={handleFreeLook}>
            <Text
              style={[
                styles.secondaryMapButtonText,
                cameraMode.type === 'free' && styles.secondaryMapButtonTextActive,
              ]}>
              Explore
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.secondaryMapButton,
              !playerLocation && styles.followButtonDisabled,
              cameraMode.type === 'bird' && styles.secondaryMapButtonActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Focus nearest bird"
            disabled={!playerLocation}
            onPress={handleNearestBird}>
            <Text
              style={[
                styles.secondaryMapButtonText,
                cameraMode.type === 'bird' && styles.secondaryMapButtonTextActive,
              ]}>
              Nearest Bird
            </Text>
          </Pressable>

          <Pressable
            style={[
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
        </View>

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
