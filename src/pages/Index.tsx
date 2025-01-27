import { useState } from "react";
import { 
  Home, 
  BarChart2, 
  Package, 
  ShoppingBag, 
  FileText, 
  Sticker,
  User,
  CreditCard,
  DollarSign,
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

  const productSubMenu = [
    { icon: ShoppingBag, label: "Магазины", value: "stores" },
    { icon: FileText, label: "Отчеты", value: "reports" },
    { icon: Sticker, label: "Наклейки", value: "stickers" },
  ];

  const profileMenu = [
    { icon: CreditCard, label: "История платежей", value: "payment-history" },
    { icon: User, label: "Профиль", value: "profile" },
    { icon: DollarSign, label: "Тарифы", value: "rates" },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur">
        {isMobile ? (
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">Zerofy</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setShowCalculator(true)}>
                <Calculator className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">Zerofy</h1>
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" onClick={() => handleTabChange("home")}>
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => handleTabChange("analytics")}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <Package className="mr-2 h-4 w-4" />
                      Products
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {productSubMenu.map((item) => (
                      <DropdownMenuItem key={item.value} onClick={() => handleTabChange(item.value)}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {productSubMenu.map((item) => (
                  <Button key={item.value} variant="ghost" onClick={() => handleTabChange(item.value)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowCalculator(true)}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {profileMenu.map((item) => (
                    <DropdownMenuItem key={item.value} onClick={() => handleTabChange(item.value)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </header>

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`nav-item ${productSubMenu.some(item => activeTab === item.value) ? "active" : ""}`}>
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Products</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {productSubMenu.map((item) => (
                  <DropdownMenuItem key={item.value} onClick={() => handleTabChange(item.value)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className={`nav-item ${activeTab === "stores" ? "active" : ""}`}
              onClick={() => handleTabChange("stores")}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs">Магазины</span>
            </button>
            <button
              className={`nav-item ${profileMenu.some(item => activeTab === item.value) ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Профиль</span>
            </button>
          </div>
        </nav>
      )}

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default Index;
