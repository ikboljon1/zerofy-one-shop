import { useState } from "react";
import { Home, BarChart2, Package, Calculator, User, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Stats from "@/components/Stats";
import Chart from "@/components/Chart";
import Products from "@/components/Products";
import CalculatorModal from "@/components/CalculatorModal";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showCalculator, setShowCalculator] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    toast({
      title: "Navigation",
      description: `Switched to ${tab} view`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header - Different for Mobile and Desktop */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur">
        {isMobile ? (
          // Mobile Header
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Apexify</h1>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          // Desktop Header
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">Apexify</h1>
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" onClick={() => handleTabChange("home")}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => handleTabChange("analytics")}>
                  Analytics
                </Button>
                <Button variant="ghost" onClick={() => handleTabChange("products")}>
                  Products
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowCalculator(true)}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`container px-4 py-6 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'space-y-4' : 'space-y-6'}
          >
            <Stats />
            <Chart />
            <Products />
          </motion.div>
        )}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Analytics</h2>
            {/* Add analytics content */}
          </div>
        )}
        {activeTab === "products" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Products</h2>
            {/* Add products content */}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur">
          <div className="container flex items-center justify-around py-2">
            <button
              className={`nav-item ${activeTab === "home" ? "active" : ""}`}
              onClick={() => handleTabChange("home")}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => handleTabChange("analytics")}
            >
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </button>
            <button
              className={`nav-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => handleTabChange("products")}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs">Products</span>
            </button>
            <button
              className="nav-item"
              onClick={() => setShowCalculator(true)}
            >
              <Calculator className="h-5 w-5" />
              <span className="text-xs">Calculator</span>
            </button>
          </div>
        </nav>
      )}

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default Index;