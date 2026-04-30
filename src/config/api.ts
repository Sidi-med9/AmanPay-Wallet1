/**
 * Base URL for elmorad-api (no trailing slash).
 * Set in `.env` as EXPO_PUBLIC_API_URL (loaded by Expo Metro).
 *
 * Examples:
 * - Android emulator → host machine: http://10.0.2.2:5000
 * - iOS simulator: http://localhost:5000
 * - Physical device: http://YOUR_LAN_IP:5000
 */
export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}
