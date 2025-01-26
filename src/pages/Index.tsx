import { useState } from "react";
import { 
  LayoutDashboard,
  BarChart2, 
  Package, 
  FileText,
  Store,
  Sticker,
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

  const desktopNavItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "products", label: "Products", icon: Package },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "stores", label: "Stores", icon: Store },
    { id: "stickers", label: "Stickers", icon: Sticker },
    { id: "profile", label: "Profile", icon: User },
  ];

  const mobileNavItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "products", label: "Products", icon: Package },
    { id: "stores", label: "Stores", icon: Store },
    { id: "profile", label: "Profile", icon: User },
  ];

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

      {/* Desktop Sidebar */}
      {!isMobile && (
        <nav className="fixed left-0 top-16 h-full w-64 bg-background border-r border-border p-4">
          <div className="space-y-4">
            {desktopNavItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center space-x-3 w-full p-2 rounded-lg transition-colors ${
                  activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
                onClick={() => handleTabChange(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={`container px-4 py-6 space-y-6 ${!isMobile ? "ml-64" : ""}`}>
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
        {activeTab === "reports" && !isMobile && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Reports</h2>
            {/* Add reports content */}
          </div>
        )}
        {activeTab === "stores" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Stores</h2>
            {/* Add stores content */}
          </div>
        )}
        {activeTab === "stickers" && !isMobile && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Stickers</h2>
            {/* Add stickers content */}
          </div>
        )}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Profile</h2>
            {/* Add profile content */}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur">
          <div className="container flex items-center justify-around py-2">
            {mobileNavItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => handleTabChange(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default Index;