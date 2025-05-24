import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { config } from '../config';
import { getAuthToken } from '../utils/auth';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const LoginPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (getAuthToken()) {
            navigate('/chat');
        }
    }, [navigate]);

    const backendFacebookLoginUrl = `${config.apiUrl}/oauth2/authorization/facebook`;
    const backendInstagramLoginUrl = `${config.apiUrl}/oauth2/authorization/instagram`;

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.50"
            px={4}
        >
            <VStack
                spacing={6}
                p={8}
                borderRadius="md"
                bg="white"
                boxShadow="lg"
                maxW="sm"
                w="full"
            >
                <Heading size="lg">Welcome to SMM Assistant</Heading>
                <Text fontSize="md" color="gray.600">
                    Login to continue
                </Text>
                <Button
                    as="a"
                    href={backendFacebookLoginUrl}
                    colorScheme="facebook"
                    w="full"
                    size="lg"
                    leftIcon={<FaFacebook />}
                >
                    Login with Facebook
                </Button>
                <Button
                    as="a"
                    href={backendInstagramLoginUrl}
                    colorScheme="instagram"
                    w="full"
                    size="lg"
                    leftIcon={<FaInstagram />}
                >
                    Login with Instagram
                </Button>
            </VStack>
        </Box>
    );
};

export default LoginPage;