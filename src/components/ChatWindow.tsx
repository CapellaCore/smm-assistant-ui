import { useEffect, useState } from 'react';
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
import MediaMessage from './MediaMessage';
import FileUpload from './FileUpload';
import { resolveMediaType } from '../utils/mediaUtils.tsx';
import type { UploadResponse } from '../services/fileUpload';

interface Message {
  type: 'text' | 'image' | 'video' | 'file';
  content?: string;
  url?: string;
  caption?: string;
  isUser: boolean;
  // File-specific properties
  uploadResponse?: UploadResponse;
  fileName?: string;
  fileSize?: number;
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

  const handleFileUploaded = (uploadResponse: UploadResponse, file: File) => {
    const fileMessage: Message = {
      type: 'file',
      isUser: true,
      uploadResponse,
      fileName: file.name,
      fileSize: file.size,
    };

    setMessages((prev) => [...prev, fileMessage]);

    // Optionally send the file URL to the chat API
    // You can modify this to send file information to your chat API
    // For now, we'll just add it to the chat
  };

  // Function to parse markdown images from text
  const parseMarkdownImages = (text: string) => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images: { alt: string; url: string }[] = [];
    let match;
    
    while ((match = imageRegex.exec(text)) !== null) {
      images.push({
        alt: match[1] || 'Image',
        url: match[2]
      });
    }
    
    return images;
  };

  // Function to remove markdown images from text
  const removeMarkdownImages = (text: string) => {
    return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { type: 'text', content: userMessage, isUser: true },]);
    setIsLoading(true);

    try {
      console.log('Sending message to API:', userMessage);
      const response = await axios.post(
          `${config.apiUrl}/api/v1/smm-assistant/ask`,
          '',
          {
            params: { message: userMessage },
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              Accept: 'application/json',
            },
          }
      );

      const data = response.data;

      let aiMessages: Message[] = [];

      // Handle different possible response formats
      if (data.messages && Array.isArray(data.messages)) {
        // Expected format: { messages: [...] }
        aiMessages = data.messages.map((msg: any) => ({
          type: msg.type || 'text',
          content: msg.content,
          url: msg.url,
          caption: msg.caption,
          isUser: false,
        }));
      } else if (data.content || data.message) {
        // Fallback: single message in response
        aiMessages = [{
          type: 'text',
          content: data.content || data.message,
          isUser: false,
        }];
      } else if (typeof data === 'string') {
        // Fallback: response is just a string
        aiMessages = [{
          type: 'text',
          content: data,
          isUser: false,
        }];
      } else {
        // Last resort: stringify the response
        aiMessages = [{
          type: 'text',
          content: JSON.stringify(data),
          isUser: false,
        }];
      }

      setMessages((prev) => [...prev, ...aiMessages]);
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
          maxW={{ base: '100%', md: '90%', lg: '800px' }}
          h={isMobile ? `${windowHeight}px` : '100vh'}
          py={4}
          px={{ base: 2, md: 4 }}
          display="flex"
          flexDirection="column"
          position="relative"
      >
        <VStack
            h="full"
            spacing={4}
            maxH={isMobile ? `${windowHeight}px` : '100vh'}
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
                '&::-webkit-scrollbar': { width: '4px' },
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
                      maxW={{ base: '85%', md: '70%' }}
                      bg={message.isUser ? 'blue.500' : 'white'}
                      color={message.isUser ? 'white' : 'black'}
                      p={3}
                      borderRadius="lg"
                      boxShadow="sm"
                  >
                    {['image', 'video', 'preview'].includes(message.type) ? (
                        <>
                          <MediaMessage
                              declaredType={resolveMediaType(message.type, message.url)}
                              url={message.url}
                              caption={message.caption}
                          />
                          {message.content && (
                              <Text className="text-sm mt-2">{message.content}</Text>
                          )}
                        </>
                    ) : (
                        <Text>{message.content}</Text>
                    )}
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
              align="center"
          >
            <FileUpload
              onFileUploaded={handleFileUploaded}
              isDisabled={isLoading}
            />
            <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                flex={1}
            />
            <Button
                colorScheme="blue"
                onClick={handleSendMessage}
                isLoading={isLoading}
            >
              Send
            </Button>
            <Button colorScheme="red" onClick={handleLogout}>
              Logout
            </Button>
          </Flex>
        </VStack>
      </Container>
  );
};

export default ChatWindow;