import {getApiBaseUrl, parseErrorResponse} from './apiBase';

export type RegisterPayload = {
  email: string;
  password: string;
  username: string;
};

export type LoginPayload = {
  password: string;
  username: string;
};

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch(`${getApiBaseUrl()}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(`${getApiBaseUrl()}/api/users/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  const responseText = await response.text();

  try {
    return JSON.parse(responseText) as string;
  } catch {
    return responseText;
  }
}
