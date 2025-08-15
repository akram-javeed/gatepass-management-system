// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export async function callBackendAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
}