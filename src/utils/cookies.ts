export const getSessionId = (): string => {
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session_id='));
  
  if (sessionCookie) {
    return sessionCookie.split('=')[1];
  }
  
  // Generate new session ID if none exists
  const newSessionId = crypto.randomUUID();
  // Set cookie to expire in 30 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  document.cookie = `session_id=${newSessionId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  
  return newSessionId;
}; 