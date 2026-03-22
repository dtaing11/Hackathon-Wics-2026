import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {launchCamera} from 'react-native-image-picker';

import {IMAGE_UPLOAD_API_URL} from '@env';

export type CapturedPhoto = {
  fileName: string;
  type: string;
  uri: string;
};

async function ensureCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Use your camera',
      message: 'BirdGo needs camera access to capture inspection photos.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function capturePhoto(): Promise<CapturedPhoto> {
  const hasPermission = await ensureCameraPermission();

  if (!hasPermission) {
    throw new Error('Camera permission was denied.');
  }

  const result = await launchCamera({
    mediaType: 'photo',
    cameraType: 'back',
    saveToPhotos: false,
    quality: 0.8,
    includeBase64: false,
  });

  if (result.didCancel) {
    throw new Error('Camera capture was cancelled.');
  }

  if (result.errorCode || result.errorMessage) {
    throw new Error(result.errorMessage ?? 'Unable to capture a photo.');
  }

  const asset = result.assets?.[0];

  if (!asset?.uri) {
    throw new Error('No photo was returned from the camera.');
  }

  return {
    fileName: asset.fileName ?? `inspection-${Date.now()}.jpg`,
    type: asset.type ?? 'image/jpeg',
    uri: asset.uri,
  };
}

export async function uploadCapturedPhoto(photo: CapturedPhoto) {
  if (!IMAGE_UPLOAD_API_URL) {
    throw new Error(
      'Missing IMAGE_UPLOAD_API_URL in your .env file.',
    );
  }

  const formData = new FormData();
  formData.append('file', {
    uri: photo.uri,
    type: photo.type,
    name: photo.fileName,
  } as any);

  const response = await fetch(IMAGE_UPLOAD_API_URL, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${responseText}`);
  }

  return response.json().catch(() => null);
}

export async function captureAndUploadPhoto() {
  const photo = await capturePhoto();
  return uploadCapturedPhoto(photo);
}

export function showCameraNotReadyAlert(message: string) {
  Alert.alert('Camera Setup Needed', message);
}
