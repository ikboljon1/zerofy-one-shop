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
  Moon,
  Zap,
  ArrowUp,
  ArrowDown,
  Megaphone,
  RefreshCw,
  Settings,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Stats from "@/components/Stats";
import Chart from "@/components/Chart";
import ProductsComponent from "@/components/Products";
import Stores from "@/components/Stores";
import CalculatorModal from "@/components/CalculatorModal";
import Advertising from "@/components/Advertising";
import ProductsList from "@/components/ProductsList";
import Profile from "@/components/Profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";

const profileMenu = [
  {
    label: "Настройки",
    value: "settings",
    icon: Settings,
  },
  {
    label: "Выйти",
    value: "logout",
    icon: LogOut,
  },
];

const mockTopProfitableProducts = [
  {
    name: "Товар 1",
    price: "1000",
    profit: "300",
    image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
  },
  {
    name: "Товар 2",
    price: "2000",
    profit: "500",
    image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
  },
  {
    name: "Товар 3",
    price: "1500",
    profit: "400",
    image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
  }
];

const mockTopUnprofitableProducts = [
  {
    name: "Товар 4",
    price: "1000",
    profit: "-100",
    image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
  },
  {
    name: "Товар 5",
    price: "2000",
    profit: "-200",
    image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
  },
  {
    name: "Товар 6",
    price: "1500",
    profit: "-150",
    image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
  }
];

const renderAnalytics = () => {
  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Аналитика</h2>
      <Chart />
    </div>
  );
};

const salesData = [
  { name: "Jan", value: 300000 },
  { name: "Feb", value: 320000 },
  { name: "Mar", value: 310000 },
  { name: "Apr", value: 325000 },
  { name: "May", value: 330000 },
  { name: "Jun", value: 348261 },
];

const returnsData = [
  { name: "Jan", returns: 120 },
  { name: "Feb", returns: 150 },
  { name: "Mar", returns: 140 },
  { name: "Apr", returns: 130 },
  { name: "May", returns: 145 },
  { name: "Jun", returns: 150 },
];

const profitData = [
  { name: "Jan", profit: 50000 },
  { name: "Feb", profit: 55000 },
  { name: "Mar", profit: 53000 },
  { name: "Apr", profit: 54000 },
  { name: "May", profit: 56000 },
  { name: "Jun", profit: 58000 },
];

const salesTableData = [
  {
    name: "Product 1",
    sku: "SKU12345",
    quantity: 100,
    sales: 10000,
    avgPrice: 100,
    profit: 2000,
    profitMargin: "20%",
    orders: 120,
    returns: 10,
    returnRate: "8.33%",
  },
  {
    name: "Product 2",
    sku: "SKU67890",
    quantity: 50,
    sales: 5000,
    avgPrice: 100,
    profit: 1000,
    profitMargin: "20%",
    orders: 60,
    returns: 5,
    returnRate: "8.33%",
  },
];

const returnsTableData = [
  {
    name: "Product 1",
    sku: "SKU12345",
    orders: 120,
    returns: 10,
    returnRate: "8.33%"
  },
  {
    name: "Product 2",
    sku: "SKU67890",
    orders: 60,
    returns: 5,
    returnRate: "8.33%"
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showCalculator, setShowCalculator] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [selectedStore, setSelectedStore] = useState<{id: string; apiKey: string} | null>(null);

  const handleTabChange = (tab: string) => {
    if (tab === "analytics") {
      window.location.href = "/analytics";
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur">
        {isMobile ? (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Zerofy</h1>
            </div>
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
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Zerofy</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("home")}
                  className={activeTab === "home" ? "bg-accent" : ""}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("analytics")}
                  className={activeTab === "analytics" ? "bg-accent" : ""}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("products")}
                  className={activeTab === "products" ? "bg-accent" : ""}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Товары
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("stores")}
                  className={activeTab === "stores" ? "bg-accent" : ""}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Магазины
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("advertising")}
                  className={activeTab === "advertising" ? "bg-accent" : ""}
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  Реклама
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("profile")}
                  className={activeTab === "profile" ? "bg-accent" : ""}
                >
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </Button>
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
            <ProductsComponent 
              topProfitableProducts={mockTopProfitableProducts}
              topUnprofitableProducts={mockTopUnprofitableProducts}
            />
          </motion.div>
        )}
        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderAnalytics()}
          </motion.div>
        )}
        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProductsList selectedStore={selectedStore} />
          </motion.div>
        )}
        {activeTab === "stores" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stores onStoreSelect={setSelectedStore} />
          </motion.div>
        )}
        {activeTab === "advertising" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Advertising selectedStore={selectedStore} />
          </motion.div>
        )}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Profile />
          </motion.div>
        )}
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur">
          <div className="container flex items-center justify-around py-2">
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "home" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("home")}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "analytics" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("analytics")}
            >
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "products" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("products")}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs">Товары</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "stores" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("stores")}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs">Магазины</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "advertising" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("advertising")}
            >
              <Megaphone className="h-5 w-5" />
              <span className="text-xs">Реклама</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "profile" ? "text-primary" : "text-muted-foreground"}`}
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
