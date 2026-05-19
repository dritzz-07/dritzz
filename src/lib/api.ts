const API_BASE_URL = 'https://ais-dev-vdp2yhwtd63fnwp6tu2fg5-382785384176.asia-southeast1.run.app';

export const getApiUrl = (path: string) => {
  // If we are in local development (AI Studio), use relative paths
  // If we are in a deployed Shopify theme, use the full URL to the backend
  if (typeof window !== 'undefined' && window.location.hostname.includes('run.app')) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
};
