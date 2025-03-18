import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/hooks/use-theme";
import LandingPage from './pages/LandingPage';
import Index from './pages/Index';
import Products from './pages/Products';
import Admin from './pages/Admin';
import MainLayout from './components/layout/MainLayout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { WarehouseProvider } from './contexts/WarehouseContext';
import Warehouses from './pages/Warehouses';
import './App.css';

function App() {
  

  return (
    <ThemeProvider>
      <WarehouseProvider>
        <Router>
          <Routes>
            <Route path="/dashboard/*" element={
              <Suspense fallback={<div>Loading...</div>}>
                <MainLayout>
                  <Routes>
                    <Route index element={<Index />} />
                    <Route path="products" element={<Products />} />
                    <Route path="warehouses" element={<Warehouses />} />
                    <Route path="admin" element={<Admin />} />
                  </Routes>
                </MainLayout>
              </Suspense>
            } />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </Router>
        <Toaster richColors closeButton position="top-right" />
      </WarehouseProvider>
    </ThemeProvider>
  );
}

export default App;
