import {useEffect, useState} from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Container,
  Flex,
  useToast,
  useBreakpointValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { config } from '../config';
import {getAuthToken, storeTokenFromUrl, logout} from "../utils/auth.ts";
import { useNavigate } from 'react-router-dom';

interface Message {
  text: string;
  isUser: boolean;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    storeTokenFromUrl();
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      console.log('Sending message to API:', userMessage);
      const response = await axios.post(
        `${config.apiUrl}/api/v1/smm-assistant/ask`,
        '',
        {
          params: {
            message: userMessage
          },
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Accept': '*/*'
          }
        }
      );

      console.log('API Response:', response.data);
      
      if (response.data) {
        setMessages((prev) => [
          ...prev,
          { text: response.data, isUser: false },
        ]);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('API Error:', error);
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.response) {
          errorMessage = `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'No response received from server. Please check your connection.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container 
      maxW={{ base: "100%", md: "90%", lg: "800px" }} 
      h={isMobile ? `${windowHeight}px` : "100vh"}
      py={4}
      px={{ base: 2, md: 4 }}
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <VStack 
        h="full" 
        spacing={4}
        maxH={isMobile ? `${windowHeight}px` : "100vh"}
        overflow="hidden"
      >
        <Box
          flex={1}
          w="full"
          overflowY="auto"
          p={4}
          borderRadius="md"
          bg="gray.50"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.300',
              borderRadius: '24px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Flex
              key={index}
              justify={message.isUser ? 'flex-end' : 'flex-start'}
              mb={4}
            >
              <Box
                maxW={{ base: "85%", md: "70%" }}
                bg={message.isUser ? 'blue.500' : 'white'}
                color={message.isUser ? 'white' : 'black'}
                p={3}
                borderRadius="lg"
                boxShadow="sm"
              >
                <Text>{message.text}</Text>
              </Box>
            </Flex>
          ))}
        </Box>
        <Flex 
          w="full" 
          gap={2}
          position="sticky"
          bottom={0}
          bg="white"
          pt={2}
          pb={isMobile ? 4 : 2}
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
            isLoading={isLoading}
          >
            Send
          </Button>
          <Button
              colorScheme="red"
              onClick={handleLogout}>
            Logout
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
};

export default ChatWindow; 