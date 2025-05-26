import { Box } from '@chakra-ui/react';
import ChatWindow from '../components/ChatWindow';

const Home = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <ChatWindow />
    </Box>
  );
};

export default Home; 