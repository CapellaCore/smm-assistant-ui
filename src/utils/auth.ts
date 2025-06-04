import { config } from '../config';

// Get environment-specific token key to avoid dev/prod token conflicts
const getTokenKey = () => {
  const apiUrl = config.apiUrl;
  if (apiUrl.includes('prod')) return 'access_token_prod';
  if (apiUrl.includes('dev')) return 'access_token_dev';
  return 'access_token_local';
};

export const storeTokenFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        const tokenKey = getTokenKey();
        localStorage.setItem(tokenKey, token);
        
        // Debug logging
        console.log('Token stored:', {
          tokenKey,
          apiUrl: config.apiUrl,
          tokenLength: token.length
        });
        
        // Clear tokens from other environments to avoid confusion
        const allTokenKeys = ['access_token_prod', 'access_token_dev', 'access_token_local', 'access_token'];
        allTokenKeys.forEach(key => {
          if (key !== tokenKey && localStorage.getItem(key)) {
            console.log(`Clearing old token: ${key}`);
            localStorage.removeItem(key);
          }
        });
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('token');

    if (url.hash === '#_=_') {
        url.hash = '';
    }

    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
};

export function logout() {
    const tokenKey = getTokenKey();
    localStorage.removeItem(tokenKey);
    
    // Also clear legacy token for backward compatibility
    localStorage.removeItem('access_token');
    
    console.log('Logged out from:', config.apiUrl);
}

export const getAuthToken = () => {
  const tokenKey = getTokenKey();
  const token = localStorage.getItem(tokenKey) || localStorage.getItem('access_token');
  
  if (token) {
    console.log('Using token for environment:', {
      tokenKey,
      apiUrl: config.apiUrl,
      hasToken: !!token
    });
  } else {
    console.warn('No token found for environment:', {
      tokenKey,
      apiUrl: config.apiUrl,
      availableTokens: Object.keys(localStorage).filter(key => key.includes('token'))
    });
  }
  
  return token;
};