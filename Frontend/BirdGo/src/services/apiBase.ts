import {WICS_API_BASE_URL} from '@env';

const DEFAULT_WICS_API_BASE_URL =
  'https://hackathon-wics-871757115753.us-central1.run.app';

export function getApiBaseUrl() {
  return WICS_API_BASE_URL || DEFAULT_WICS_API_BASE_URL;
}

export async function parseErrorResponse(response: Response) {
  const responseText = await response.text();
  return responseText || `Request failed with status ${response.status}.`;
}
