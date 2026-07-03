/**
 * Centralized application configuration.
 * All environment-specific variables and fallback configurations are exported from here.
 */

export interface AppConfigType {
  API_BASE_URL: string;
  UPLOADS_URL: string;
  TIMEOUT_MS: number;
}

// Read from import.meta.env, with default local development fallbacks
const baseApiUrl = ((import.meta as any).env.VITE_API_URL as string) || 'https://localhost:53638';
const uploadsUrl = ((import.meta as any).env.VITE_UPLOADS_URL as string) || `${baseApiUrl}/uploads`;

export const AppConfig: AppConfigType = {
  API_BASE_URL: baseApiUrl,
  UPLOADS_URL: uploadsUrl,
  TIMEOUT_MS: 15000, // 15 seconds timeout
};
