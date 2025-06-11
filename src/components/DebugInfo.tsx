import { Box, Text, VStack, HStack, Badge, Button, useToast } from '@chakra-ui/react';
import { config } from '../config';
import { getAuthToken } from '../utils/auth';
import { useState } from 'react';

const DebugInfo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const toast = useToast();

  const debugInfo = {
    environment: {
      'VITE_API_URL': import.meta.env.VITE_API_URL,
      'VITE_BASE_URL': import.meta.env.VITE_BASE_URL,
      'PROD': import.meta.env.PROD,
      'DEV': import.meta.env.DEV,
      'MODE': import.meta.env.MODE
    },
    config: {
      'apiUrl': config.apiUrl,
      'basePath': config.basePath
    },
    auth: {
      'hasToken': !!getAuthToken(),
      'tokenLength': getAuthToken()?.length || 0,
      'availableTokens': Object.keys(localStorage).filter(key => key.includes('token'))
    },
    localStorage: Object.keys(localStorage).reduce((acc, key) => {
      if (key.includes('token')) {
        acc[key] = localStorage.getItem(key)?.substring(0, 20) + '...';
      }
      return acc;
    }, {} as Record<string, string>)
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    toast({
      title: 'Debug info copied to clipboard',
      status: 'success',
      duration: 2000
    });
  };

  if (!isVisible) {
    return (
      <Button
        position="fixed"
        bottom="20px"
        right="20px"
        size="sm"
        colorScheme="gray"
        onClick={() => setIsVisible(true)}
        zIndex={1000}
      >
        Debug
      </Button>
    );
  }

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      width="400px"
      maxHeight="500px"
      bg="white"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      p={4}
      boxShadow="lg"
      overflowY="auto"
      zIndex={1000}
    >
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="bold" fontSize="sm">Debug Info</Text>
        <HStack>
          <Button size="xs" onClick={copyToClipboard}>Copy</Button>
          <Button size="xs" onClick={() => setIsVisible(false)}>×</Button>
        </HStack>
      </HStack>

      <VStack align="start" spacing={3} fontSize="xs">
        <Box>
          <Text fontWeight="bold" mb={1}>Environment</Text>
          {Object.entries(debugInfo.environment).map(([key, value]) => (
            <HStack key={key} justify="space-between">
              <Text>{key}:</Text>
              <Badge colorScheme={value ? 'green' : 'red'}>
                {String(value) || 'undefined'}
              </Badge>
            </HStack>
          ))}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={1}>Config</Text>
          {Object.entries(debugInfo.config).map(([key, value]) => (
            <HStack key={key} justify="space-between" flexWrap="wrap">
              <Text>{key}:</Text>
              <Text fontSize="10px" maxWidth="200px" wordBreak="break-all">
                {String(value)}
              </Text>
            </HStack>
          ))}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={1}>Authentication</Text>
          {Object.entries(debugInfo.auth).map(([key, value]) => (
            <HStack key={key} justify="space-between">
              <Text>{key}:</Text>
              <Badge colorScheme={value ? 'green' : 'red'}>
                {String(value)}
              </Badge>
            </HStack>
          ))}
        </Box>

        <Box>
          <Text fontWeight="bold" mb={1}>Local Storage Tokens</Text>
          {Object.keys(debugInfo.localStorage).length === 0 ? (
            <Text color="red.500">No tokens found</Text>
          ) : (
            Object.entries(debugInfo.localStorage).map(([key, value]) => (
              <HStack key={key} justify="space-between" flexWrap="wrap">
                <Text>{key}:</Text>
                <Text fontSize="10px" maxWidth="150px" wordBreak="break-all">
                  {value}
                </Text>
              </HStack>
            ))
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default DebugInfo; 