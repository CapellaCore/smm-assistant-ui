export const config = {
  apiUrl: import.meta.env.PROD 
    ? 'https://smm-assistant-java-213242908814.us-central1.run.app'
    : '',
  basePath: import.meta.env.PROD 
    ? '/smm-assistant-ui'
    : '',
}; 