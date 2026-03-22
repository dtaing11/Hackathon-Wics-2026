import type {CapturedPhoto} from './cameraUpload';
import {getApiBaseUrl, parseErrorResponse} from './apiBase';

export type PostRecord = {
  contentType: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  postId: string;
};

export async function getAllPosts() {
  const response = await fetch(`${getApiBaseUrl()}/api/posts`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as PostRecord[];
}

export async function getPostById(postId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/api/posts/${encodeURIComponent(postId)}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as PostRecord;
}

export async function getMyPosts() {
  const response = await fetch(`${getApiBaseUrl()}/api/posts/user/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as PostRecord[];
}

export async function createPost(
  photo: CapturedPhoto,
  location: {
    latitude: number;
    longitude: number;
  },
) {
  const formData = new FormData();
  formData.append('latitude', String(location.latitude));
  // Backend currently expects the typo'd field name "longtitude".
  formData.append('longtitude', String(location.longitude));
  formData.append('file', {
    uri: photo.uri,
    type: photo.type,
    name: photo.fileName,
  } as any);

  const response = await fetch(`${getApiBaseUrl()}/api/posts`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as PostRecord;
}
