import { useState } from "react";
import { 
  LayoutDashboard,
  BarChart2, 
  Package, 
  ShoppingBag,
  User,
  Calculator,
  Sun,
  Moon 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Stats from "@/components/Stats";
import Chart from "@/components/Chart";
import Products from "@/components/Products";
import CalculatorModal from "@/components/CalculatorModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showCalculator, setShowCalculator] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    toast({
      title: "Navigation",
      description: `Switched to ${tab} view`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Apexify</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowCalculator(true)}>
              <Calculator className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
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
        {activeTab === "stores" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Stores</h2>
            {/* Add stores content */}
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
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
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
              className={`nav-item ${activeTab === "stores" ? "active" : ""}`}
              onClick={() => handleTabChange("stores")}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs">Stores</span>
            </button>
            <button
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </nav>
      )}

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default Index;