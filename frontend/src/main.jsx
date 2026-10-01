import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Global fetch interceptor for JWT Auth
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (!config) config = {};
  if (!config.headers) config.headers = {};
  
  const token = localStorage.getItem('token');
  // If we have a token and are communicating with our internal API, inject the Bearer token
  if (token && resource.toString().startsWith('/api')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return originalFetch(resource, config);
};

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
