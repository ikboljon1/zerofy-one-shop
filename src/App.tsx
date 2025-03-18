
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { User } from './types/user';

// Pages
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import Admin from './pages/Admin';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Context Providers
import { WarehouseProvider } from './contexts/WarehouseContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('authToken') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('authToken') !== null;
  const userStr = localStorage.getItem('user');
  let isAdmin = false;
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr) as User;
      isAdmin = user.role === 'admin';
    } catch (e) {
      console.error('Error parsing user data', e);
    }
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsUserLoggedIn(!!token);
    
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('authToken');
      setIsUserLoggedIn(!!newToken);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WarehouseProvider>
          <Router>
            <Routes>
              <Route path="/" element={isUserLoggedIn ? <Navigate to="/dashboard" /> : <LandingPage />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/warehouses" element={
                <ProtectedRoute>
                  <Warehouses />
                </ProtectedRoute>
              } />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </WarehouseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
