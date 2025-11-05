import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { CurrencyProvider } from './contexts/CurrencyContext'; // DISABLED FOR US MARKET TEST
import App from './App';
import './index.css';

// Initialize Firebase (this will run the configuration automatically)
import './config/firebase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <CurrencyProvider> */} {/* DISABLED FOR US MARKET TEST - Currency fixed to USD */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      {/* </CurrencyProvider> */}
    </QueryClientProvider>
  </React.StrictMode>
);
