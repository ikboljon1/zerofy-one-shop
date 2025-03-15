
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
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
import { getProductProfitabilityData, getSelectedStore } from "@/utils/storeUtils";
import { User } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { Store } from "@/types/store";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const isMobile = useIsMobile();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated - проверяем и localStorage, и sessionStorage
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!storedUser) {
      // User is not authenticated, redirect to landing page
      toast({
        title: "Доступ запрещен",
        description: "Пожалуйста, войдите в систему для доступа к дашборду",
        variant: "destructive"
      });
      navigate('/', { replace: true });
      return;
    }
    
    // User is authenticated, set user data
    setUser(JSON.parse(storedUser));
    
    // Initialize selected store
    const store = getSelectedStore();
    if (store) {
      const storeData: Store = {
        id: store.id,
        apiKey: store.apiKey,
        name: store.name || "Магазин",
        marketplace: store.marketplace || "Wildberries"
      };
      setSelectedStore(storeData);
    }
  }, [navigate]);

  const getProductsData = () => {
    const store = selectedStore || getSelectedStore();
    if (!store) return { profitable: [], unprofitable: [] };
    
    // Получаем данные о прибыльности товаров
    const profitabilityData = getProductProfitabilityData(store.id);
    if (profitabilityData && profitabilityData.profitableProducts && profitabilityData.unprofitableProducts) {
      return {
        profitable: profitabilityData.profitableProducts || [],
        unprofitable: profitabilityData.unprofitableProducts || []
      };
    }
    
    return { profitable: [], unprofitable: [] };
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
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
            <Stores onStoreSelect={handleStoreSelect} />
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
