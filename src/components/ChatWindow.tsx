import { useState } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Container,
  Flex,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

interface Message {
  text: string;
  isUser: boolean;
}

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      console.log('Sending message to API:', userMessage);
      const response = await axios.post(
        '/api/v1/instagram/ask',
        null,
        {
          params: {
            message: userMessage
          },
          headers: {
            'accept': '*/*'
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
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" h="100vh" py={4}>
      <VStack h="full" spacing={4}>
        <Box
          flex={1}
          w="full"
          overflowY="auto"
          p={4}
          borderRadius="md"
          bg="gray.50"
        >
          {messages.map((message, index) => (
            <Flex
              key={index}
              justify={message.isUser ? 'flex-end' : 'flex-start'}
              mb={4}
            >
              <Box
                maxW="70%"
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
        <Flex w="full" gap={2}>
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
        </Flex>
      </VStack>
    </Container>
  );
};

export default ChatWindow; 