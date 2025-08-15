// lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

console.log('API_BASE loaded:', API_BASE); // Add this debug line

export async function callBackendAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  console.log('Making API call to:', url); // Keep this debug line
  
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