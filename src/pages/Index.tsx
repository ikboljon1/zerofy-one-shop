import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import Chart from "@/components/Chart";
import ProductsComponent from "@/components/Products";
import Stores from "@/components/Stores";
import ProductsList from "@/components/ProductsList";
import Profile from "@/components/Profile";
import Warehouses from "@/pages/Warehouses";
import Advertising from "@/components/Advertising";
import MainLayout from "@/components/layout/MainLayout";
import AnalyticsSection from "@/components/analytics/AnalyticsSection";
import Dashboard from "@/components/dashboard/Dashboard";
import { getProductProfitabilityData } from "@/utils/storeUtils";
import { User } from "@/services/userService";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();
  const [selectedStore, setSelectedStore] = useState<{id: string; apiKey: string} | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getProductsData = () => {
    const selectedStore = getSelectedStore();
    if (!selectedStore) return { profitable: [], unprofitable: [] };
    
    // Try to load detailed data about products
    const profitabilityData = getProductProfitabilityData(selectedStore.id);
    if (profitabilityData) {
      return {
        profitable: profitabilityData.profitableProducts || [],
        unprofitable: profitabilityData.unprofitableProducts || []
      };
    }
    
    // If no detailed data, try to load from analytics
    const storageKey = `marketplace_analytics_${selectedStore.id}`;
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        return {
          profitable: parsedData.data.topProfitableProducts || [],
          unprofitable: parsedData.data.topUnprofitableProducts || []
        };
      } catch (e) {
        console.error("Error parsing analytics data:", e);
      }
    }
    
    return { profitable: [], unprofitable: [] };
  };

  const getSelectedStore = () => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    return stores.find((store: any) => store.isSelected) || null;
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderContent = () => {
    const { profitable, unprofitable } = getProductsData();
    
    switch (activeTab) {
      case "home":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'space-y-4' : 'space-y-6'}
          >
            <Dashboard />
          </motion.div>
        );
      case "analytics":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyticsSection />
          </motion.div>
        );
      case "products":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductsList selectedStore={selectedStore} />
          </motion.div>
        );
      case "stores":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stores onStoreSelect={setSelectedStore} />
          </motion.div>
        );
      case "warehouses":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Warehouses />
          </motion.div>
        );
      case "advertising":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Advertising selectedStore={selectedStore} />
          </motion.div>
        );
      case "profile":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Profile user={user} onUserUpdated={handleUserUpdated} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </MainLayout>
  );
};

export default Index;
