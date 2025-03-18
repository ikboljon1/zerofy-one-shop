
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Toaster } from './components/ui/toaster.tsx';
import { Toaster as SonnerToaster } from 'sonner';
import { ThemeProvider } from './hooks/use-theme.tsx';
import { WarehouseProvider } from './contexts/WarehouseContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <App />
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
