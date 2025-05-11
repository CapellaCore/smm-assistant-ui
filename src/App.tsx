import { ChakraProvider } from '@chakra-ui/react'
import ChatWindow from './components/ChatWindow'

function App() {
  return (
    <ChakraProvider>
      <ChatWindow />
    </ChakraProvider>
  )
}

export default App
