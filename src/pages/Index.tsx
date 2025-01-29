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
  ArrowDown
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Stats from "@/components/Stats";
import Chart from "@/components/Chart";
import Stores from "@/components/Stores";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Profile from "@/components/Profile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showCalculator, setShowCalculator] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [selectedStore, setSelectedStore] = useState<{id: string; apiKey: string} | null>(null);

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
                  onClick={() => handleTabChange("stores")}
                  className={activeTab === "stores" ? "bg-accent" : ""}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Магазины
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
              className={`flex flex-col items-center space-y-1 ${activeTab === "stores" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("stores")}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs">Магазины</span>
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
    </div>
  );
};

export default Index;
