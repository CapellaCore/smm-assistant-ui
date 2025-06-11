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
import {config} from '../config';
import {getAuthToken, storeTokenFromUrl, logout, parseJwt} from "../utils/auth.ts";
import {useNavigate} from 'react-router-dom';
import MediaMessage from './MediaMessage';
import SockJS from "sockjs-client";
import {Client} from "@stomp/stompjs";

interface InstagramMediaUrl {
    url: string;
    type: 'image_url' | 'video_url';
}
import FileMessage from './FileMessage';
import FileUpload from './FileUpload';
import DebugInfo from './DebugInfo';
import EnvironmentBanner from './EnvironmentBanner';
import type { UploadResponse } from '../services/fileUpload';

interface Message {
    type: 'text' | 'image' | 'video' | 'file';
    content?: string;
    mediaUrls?: InstagramMediaUrl[];
    caption?: string;
    postType?: 'IMAGE' | 'VIDEO' | 'STORY' | 'CAROUSEL';
    platform?: string;
    isUser: boolean;
  // File-specific properties
  uploadResponse?: UploadResponse;
  fileName?: string;
  fileSize?: number;
}

function handleNotificationMessage(message: any, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) {
    try {
        const payload = JSON.parse(message.body);

        // The actual messages array is inside payload.message (a JSON string)
        if (typeof payload.message === 'string') {
            const innerPayload = JSON.parse(payload.message);
            if (!innerPayload.messages || !Array.isArray(innerPayload.messages)) {
                return;
            }

            const validTypes = ['text', 'image', 'video'] as const;

            const newMessages: Message[] = innerPayload.messages.map((msg: any) => {
                const type = validTypes.includes(msg.type) ? msg.type : 'text';
                return {
                    type,
                    content: msg.content ?? undefined,
                    mediaUrls: msg.mediaUrls ?? undefined,
                    caption: msg.caption ?? undefined,
                    isUser: false,
                };
            });

            setMessages((prev) => [...prev, ...newMessages]);
        } else {
            console.warn('Payload message is not a string:', payload.message);
        }
    } catch (error) {
        console.error('Failed to parse or handle notification message:', error);
    }
}


const ChatWindow = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const toast = useToast();
    const isMobile = useBreakpointValue({base: true, md: false});

    useEffect(() => {
        storeTokenFromUrl();

        const token = getAuthToken();
        // @ts-ignore
        const decoded = parseJwt(token);
        const userId = decoded.sub || decoded.userId;
        const socket = new SockJS(`${config.apiUrl}/ws?token=${token}`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: () => {
                stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
                    handleNotificationMessage(message, setMessages);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame.headers['message'], frame.body);
            },
        });

        stompClient.activate();

        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);

        return () => {
            (async () => {
                try {
                    await stompClient.deactivate();
                } catch (err) {
                    console.error('Error during STOMP deactivation:', err);
                }
            })();

            window.removeEventListener('resize', handleResize);
        };

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
  // const parseMarkdownImages = (text: string) => {
  //   const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  //   const images: { alt: string; url: string }[] = [];
  //   let match;
  //
  //   while ((match = imageRegex.exec(text)) !== null) {
  //     images.push({
  //       alt: match[1] || 'Image',
  //       url: match[2]
  //     });
  //   }
  //
  //   return images;
  // };

  // Function to remove markdown images from text
  // const removeMarkdownImages = (text: string) => {
  //   return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();
  // };

  const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage;
        setInputMessage('');
        setMessages((prev) => [...prev, {type: 'text', content: userMessage, isUser: true},]);
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${config.apiUrl}/api/v1/smm-assistant/ask`,
                '',
                {
                    params: {message: userMessage},
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        Accept: 'application/json',
                    },
                }
            );
            const data = response.data;
            console.log(data);

            const aiMessages: Message[] = (data.messages || []).map((msg: any) => ({
                type: msg.type,
                content: msg.content,
                mediaUrls: msg.mediaUrls,
                caption: msg.caption,
                isUser: false,
            }));
            console.log(aiMessages);

            setMessages((prev) => [...prev, ...aiMessages]);
        } catch (error) {
            console.error('API Error:', error);
            console.error('API URL being used:', `${config.apiUrl}/api/v1/smm-assistant/ask`);
            console.error('Auth token present:', !!getAuthToken());
            console.error('Config debug:', config);
            let errorMessage = 'Failed to send message. Please try again.';

            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out. Please try again.';
                } else if (error.response) {
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                    console.error('Error response headers:', error.response.headers);

                    // Check if the error response contains the Russian error message
                    if (error.response.data && typeof error.response.data === 'object') {
                        if (error.response.data.messages && Array.isArray(error.response.data.messages)) {
                            const errorMsg = error.response.data.messages.find((msg: any) =>
                                msg.content && msg.content.includes('Возникла ошибка при обращении к AI')
                            );
                            if (errorMsg) {
                                errorMessage = 'AI service error. Please check your authentication and try again.';
                            }
                        }
                    }

                    errorMessage = `Server error: ${error.response.status} - ${errorMessage}`;
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
            maxW={{base: '100%', md: '90%', lg: '800px'}}
            h={isMobile ? `${windowHeight}px` : '100vh'}
            py={4}
            px={{base: 2, md: 4}}
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
                <EnvironmentBanner />
                <Box
                    flex={1}
                    w="full"
                    overflowY="auto"
                    p={4}
                    borderRadius="md"
                    bg="gray.50"
                    css={{
                        '&::-webkit-scrollbar': {width: '4px'},
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
                                bg={message.type === 'file' ? 'transparent' : (message.isUser ? 'blue.500' : 'white')}
                                color={message.isUser ? 'white' : 'black'}
                                p={message.type === 'file' ? 0 : 3}
                                borderRadius="lg"
                                boxShadow={message.type === 'file' ? 'none' : 'sm'}
                            >
                                {message.type === 'file' && message.uploadResponse && message.fileName ? (
                                    <FileMessage
                                        uploadResponse={message.uploadResponse}
                                        fileName={message.fileName}
                                        fileSize={message.fileSize}
                                        isUser={message.isUser}
                                    />
                                ) : message.mediaUrls?.length ? (
                                    <>
                                        {message.content && (
                                            <Text className="text-sm mt-2">{message.content}</Text>
                                        )}
                                        {message.mediaUrls.map((media, idx) => (
                                            <MediaMessage
                                                key={idx}
                                                declaredType={media.type}
                                                mediaUrl={media.url}
                                                caption={message.caption}
                                            />
                                        ))}
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
            <DebugInfo />
        </Container>
    );
};

export default ChatWindow;