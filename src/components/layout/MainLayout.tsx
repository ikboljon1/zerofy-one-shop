
import { useState } from "react";
import { 
  Home, 
  BarChart2, 
  Package, 
  ShoppingBag, 
  User,
  Calculator,
  Sun,
  Moon,
  Zap,
  Megaphone,
  Settings,
  LogOut,
  WarehouseIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileNavigation from "./MobileNavigation";
import CalculatorModal from "@/components/CalculatorModal";

// Define menu profile options
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

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MainLayout = ({ children, activeTab, onTabChange }: MainLayoutProps) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

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
                  onClick={() => onTabChange("home")}
                  className={activeTab === "home" ? "bg-accent" : ""}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onTabChange("analytics")}
                  className={activeTab === "analytics" ? "bg-accent" : ""}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onTabChange("products")}
                  className={activeTab === "products" ? "bg-accent" : ""}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Товары
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onTabChange("stores")}
                  className={activeTab === "stores" ? "bg-accent" : ""}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Магазины
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onTabChange("warehouses")}
                  className={activeTab === "warehouses" ? "bg-accent" : ""}
                >
                  <WarehouseIcon className="mr-2 h-4 w-4" />
                  Склады
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onTabChange("advertising")}
                  className={activeTab === "advertising" ? "bg-accent" : ""}
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  Реклама
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onTabChange("profile")}
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
                    <DropdownMenuItem key={item.value} onClick={() => onTabChange(item.value)}>
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
        {children}
      </main>

      {isMobile && <MobileNavigation activeTab={activeTab} onTabChange={onTabChange} />}

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default MainLayout;
