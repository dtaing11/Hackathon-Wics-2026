import {getApiBaseUrl, parseErrorResponse} from './apiBase';

export type SpeciesDetailRecord = {
  description: string;
  geography: string;
  name: string;
  rarity?: string;
  species?: string;
  weightRange?: string;
};

export async function getSpeciesDetailsForPost(postId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/api/species/post/${encodeURIComponent(postId)}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return (await response.json()) as SpeciesDetailRecord;
}
