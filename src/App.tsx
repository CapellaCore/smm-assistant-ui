import { useEffect, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import LoginPage from './pages/LoginPage'
import { getAuthToken, storeTokenFromUrl } from './utils/auth'

function App() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    storeTokenFromUrl();
    setIsAuthenticated(!!getAuthToken());
    setIsAuthChecked(true);
  }, []);

  if (!isAuthChecked) {
    return null;
  }

  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/chat"
            element={isAuthenticated ? <Home /> : <Navigate to="/" />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ChakraProvider>
  )
}

export default App
