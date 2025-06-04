export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 
    (import.meta.env.PROD 
      ? 'https://smm-assistant-dev-553110626568.us-central1.run.app'
      : 'http://localhost:8080'),
  basePath: import.meta.env.VITE_BASE_URL || 
    (import.meta.env.PROD 
      ? '/smm-assistant-ui'
      : ''),
};

// Debug logging to help identify configuration issues
console.log('Environment Config Debug:', {
  'VITE_API_URL': import.meta.env.VITE_API_URL,
  'VITE_BASE_URL': import.meta.env.VITE_BASE_URL,
  'PROD': import.meta.env.PROD,
  'resolved apiUrl': config.apiUrl,
  'resolved basePath': config.basePath
}); 