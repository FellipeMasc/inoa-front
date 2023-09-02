import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Axios from "axios";
import "index.css"

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter } from 'react-router-dom';
const queryClient = new QueryClient();

// Handle authentication on page refresh (axios headers get gone)
const token = localStorage.getItem('request_authorization')
if (token)
  Axios.defaults.headers.common = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: token
  }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackRender={e => <div>ERRO</div>}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
  </ErrorBoundary>
)
