import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

// Global Fetch Interceptor to attach JWT token
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
  if (url && url.startsWith('/api/')) {
    const sessionStr = localStorage.getItem('family_tree_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.token) {
          init = init || {};
          init.headers = {
            ...(init.headers || {}),
            'Authorization': `Bearer ${session.token}`
          };
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return init !== undefined ? originalFetch.call(this, input, init) : originalFetch.call(this, input);
};

// Use environment variable or placeholder for Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
