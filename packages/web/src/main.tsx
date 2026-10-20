import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, localStoragePersister } from './api/client';
import { ThemeWipeProvider } from './components/layout/ThemeWipeProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
    >
      <ThemeWipeProvider>
        <App />
      </ThemeWipeProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>
);
