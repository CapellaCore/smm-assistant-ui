import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import { getAuthToken, storeTokenFromUrl } from './utils/auth';
import LoginPage from './components/LoginPage';

function App() {
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        storeTokenFromUrl();
        setIsAuthenticated(!!getAuthToken());
        setIsAuthChecked(true);
    }, []);

    if (!isAuthChecked) {
        return null; // or a spinner/loading component
    }

    return (
        <BrowserRouter basename="/smm-assistant-ui">
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/chat"
                    element={isAuthenticated ? <ChatWindow /> : <Navigate to="/" />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
