
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import DashboardComponent from '@/components/dashboard/Dashboard';
import Navbar from '@/components/layout/Navbar';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <Navbar />
      <MainLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <Routes>
          <Route index element={<DashboardComponent />} />
          {/* Add additional nested routes for the dashboard here if needed */}
        </Routes>
      </MainLayout>
    </>
  );
};

export default Dashboard;
