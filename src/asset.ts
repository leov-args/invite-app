/**
 * Returns a URL path prefixed with the configured base URL.
 * Paths are written without a leading slash.
 */
export const asset = (path: string): string => `${import.meta.env.BASE_URL}${path}`;
