import { Alert, AlertIcon, AlertTitle, AlertDescription, Box, HStack, Badge } from '@chakra-ui/react';
import { config } from '../config';
import { getAuthToken } from '../utils/auth';

const EnvironmentBanner = () => {
  const apiUrl = config.apiUrl;
  const hasToken = !!getAuthToken();
  
  // Determine environment
  let environment = 'local';
  let envColor = 'gray';
  
  if (apiUrl.includes('prod')) {
    environment = 'production';
    envColor = 'red';
  } else if (apiUrl.includes('dev')) {
    environment = 'development';
    envColor = 'orange';
  }

  // Check for potential token/environment mismatch
  const tokenKeys = Object.keys(localStorage).filter(key => key.includes('token'));
  const hasMultipleTokens = tokenKeys.length > 1;
  const expectedTokenKey = apiUrl.includes('prod') ? 'access_token_prod' : 
                          apiUrl.includes('dev') ? 'access_token_dev' : 'access_token_local';
  const hasCorrectToken = localStorage.getItem(expectedTokenKey) !== null;
  
  const showWarning = !hasToken || (hasMultipleTokens && !hasCorrectToken);

  return (
    <Box mb={4}>
      <HStack justify="space-between" mb={2}>
        <Badge colorScheme={envColor} fontSize="sm" p={2}>
          Environment: {environment.toUpperCase()}
        </Badge>
        <Badge colorScheme={hasToken ? 'green' : 'red'} fontSize="sm" p={2}>
          {hasToken ? 'Authenticated' : 'No Token'}
        </Badge>
      </HStack>
      
      {showWarning && (
        <Alert status="warning" size="sm">
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="sm">Authentication Warning!</AlertTitle>
            <AlertDescription fontSize="xs">
              {!hasToken && 'No authentication token found. '}
              {hasMultipleTokens && !hasCorrectToken && 
                `Token mismatch detected. Expected ${expectedTokenKey} for ${environment} environment.`}
              {hasMultipleTokens && 
                ` Available tokens: ${tokenKeys.join(', ')}.`}
              Please make sure you're logged in to the correct environment.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default EnvironmentBanner; 