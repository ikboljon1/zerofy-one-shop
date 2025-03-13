
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import DashboardComponent from '@/components/dashboard/Dashboard';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <Routes>
        <Route index element={<DashboardComponent />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default Dashboard;
