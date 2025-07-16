import { getAccessTokenSilently } from '@auth0/auth0-react';

export const authFetch = async (url, options = {}) => {
  let token;
  try {
    token = await getAccessTokenSilently();
  } catch (err) {
    console.error('Failed to get access token:', err);
    throw err;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};