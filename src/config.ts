export const config = {
  apiUrl: import.meta.env.PROD 
    ? 'https://smm-assistant-dev-553110626568.us-central1.run.app'
    : '',
  basePath: import.meta.env.PROD 
    ? '/smm-assistant-ui'
    : '',
}; 