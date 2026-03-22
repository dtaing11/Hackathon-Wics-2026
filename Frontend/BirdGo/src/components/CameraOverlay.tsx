import React, {useEffect, useRef, useState} from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';

import {styles} from '../appStyles';
import {
  buildCapturedPhotoFromPath,
  type CapturedPhoto,
} from '../services/cameraUpload';

type CameraOverlayProps = {
  busy?: boolean;
  onCapture: (photo: CapturedPhoto) => Promise<void> | void;
  onClose: () => void;
  visible: boolean;
};

export function CameraOverlay({
  busy = false,
  onCapture,
  onClose,
  visible,
}: CameraOverlayProps) {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!visible || hasPermission) {
      return;
    }

    requestPermission().catch(() => null);
  }, [hasPermission, requestPermission, visible]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing || busy) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePhoto({
        enableShutterSound: false,
        flash: 'off',
      });
      await onCapture(buildCapturedPhotoFromPath(photo.path));
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.cameraOverlayBackdrop}>
        {hasPermission && device ? (
          <Camera
            ref={cameraRef}
            style={styles.cameraPreview}
            device={device}
            isActive={visible}
            photo
          />
        ) : (
          <View style={styles.cameraPreviewFallback} />
        )}

        <View style={styles.cameraOverlayScrim} />

        <View style={styles.cameraOverlayContent}>
          <View style={styles.cameraOverlayHeader}>
            <Text style={styles.cameraOverlayTitle}>Bird Sighting Detection</Text>
            <Text style={styles.cameraOverlaySubtitle}>
              Frame the Bird Inside the Guide
            </Text>
          </View>

          <View style={styles.cameraOverlayFrameWrap}>
            <View style={styles.cameraOverlayFrame}>
              <View style={styles.cameraOverlayCornerTopLeft} />
              <View style={styles.cameraOverlayCornerTopRight} />
              <View style={styles.cameraOverlayCornerBottomLeft} />
              <View style={styles.cameraOverlayCornerBottomRight} />
            </View>
          </View>

          {!hasPermission ? (
            <View style={styles.cameraOverlayMessageBox}>
              <Text style={styles.cameraOverlayMessageTitle}>Camera access needed</Text>
              <Text style={styles.cameraOverlayMessageText}>
                Allow camera permission to use the live preview.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Allow camera access"
                onPress={requestPermission}
                style={styles.cameraOverlaySecondaryButton}>
                <Text style={styles.cameraOverlaySecondaryButtonText}>Allow</Text>
              </Pressable>
            </View>
          ) : null}

          {hasPermission && !device ? (
            <View style={styles.cameraOverlayMessageBox}>
              <Text style={styles.cameraOverlayMessageTitle}>No camera found</Text>
              <Text style={styles.cameraOverlayMessageText}>
                BirdGo could not find a usable back camera on this device.
              </Text>
            </View>
          ) : null}

          <View style={styles.cameraOverlayActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close camera"
              onPress={onClose}
              style={styles.cameraOverlaySecondaryButton}>
              <Text style={styles.cameraOverlaySecondaryButtonText}>Close</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Capture photo"
              disabled={!hasPermission || !device || isCapturing || busy}
              onPress={handleCapture}
              style={[
                styles.cameraOverlayCaptureButton,
                (!hasPermission || !device || isCapturing || busy) &&
                  styles.bottomBarButtonDisabled,
              ]}>
              <View style={styles.cameraOverlayCaptureInner} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
