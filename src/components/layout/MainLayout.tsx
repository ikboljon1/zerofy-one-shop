
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
  WarehouseIcon,
  ChevronLeft,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
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
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  const getTitleForActiveTab = () => {
    switch (activeTab) {
      case "home": return "Dashboard";
      case "analytics": return "Analytics";
      case "products": return "Товары";
      case "warehouses": return "Склады";
      case "stores": return "Магазины";
      case "advertising": return "Реклама";
      case "profile": return "Профиль";
      default: return "Zerofy";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md shadow-sm">
        {isMobile ? (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <Sheet open={sideMenuOpen} onOpenChange={setSideMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-1">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[270px] sm:w-[300px]">
                  <SheetHeader className="pb-4 border-b mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-6 w-6 text-primary" />
                      <SheetTitle className="text-xl font-bold">Zerofy</SheetTitle>
                    </div>
                  </SheetHeader>
                  <div className="space-y-3 pt-2">
                    <MobileMenuItem 
                      icon={<Home className="h-5 w-5" />}
                      label="Dashboard"
                      isActive={activeTab === "home"}
                      onClick={() => {
                        onTabChange("home");
                        setSideMenuOpen(false);
                      }}
                    />
                    <MobileMenuItem 
                      icon={<BarChart2 className="h-5 w-5" />}
                      label="Analytics"
                      isActive={activeTab === "analytics"}
                      onClick={() => {
                        onTabChange("analytics");
                        setSideMenuOpen(false);
                      }}
                    />
                    <MobileMenuItem 
                      icon={<Package className="h-5 w-5" />}
                      label="Товары"
                      isActive={activeTab === "products"}
                      onClick={() => {
                        onTabChange("products");
                        setSideMenuOpen(false);
                      }}
                    />
                    <MobileMenuItem 
                      icon={<ShoppingBag className="h-5 w-5" />}
                      label="Магазины"
                      isActive={activeTab === "stores"}
                      onClick={() => {
                        onTabChange("stores");
                        setSideMenuOpen(false);
                      }}
                    />
                    <MobileMenuItem 
                      icon={<WarehouseIcon className="h-5 w-5" />}
                      label="Склады"
                      isActive={activeTab === "warehouses"}
                      onClick={() => {
                        onTabChange("warehouses");
                        setSideMenuOpen(false);
                      }}
                    />
                    <MobileMenuItem 
                      icon={<Megaphone className="h-5 w-5" />}
                      label="Реклама"
                      isActive={activeTab === "advertising"}
                      onClick={() => {
                        onTabChange("advertising");
                        setSideMenuOpen(false);
                      }}
                    />
                    <MobileMenuItem 
                      icon={<User className="h-5 w-5" />}
                      label="Профиль"
                      isActive={activeTab === "profile"}
                      onClick={() => {
                        onTabChange("profile");
                        setSideMenuOpen(false);
                      }}
                    />
                    
                    <div className="pt-4 border-t mt-4">
                      <MobileMenuItem 
                        icon={<Calculator className="h-5 w-5" />}
                        label="Калькулятор"
                        isActive={false}
                        onClick={() => {
                          setShowCalculator(true);
                          setSideMenuOpen(false);
                        }}
                      />
                      <MobileMenuItem 
                        icon={theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        label={theme === 'dark' ? "Светлая тема" : "Темная тема"}
                        isActive={false}
                        onClick={() => {
                          toggleTheme();
                          setSideMenuOpen(false);
                        }}
                      />
                      <MobileMenuItem 
                        icon={<LogOut className="h-5 w-5" />}
                        label="Выйти"
                        isActive={false}
                        onClick={() => {
                          setSideMenuOpen(false);
                        }}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <h1 className="text-lg font-bold">{getTitleForActiveTab()}</h1>
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

      <main className={`container px-4 py-4 ${isMobile ? 'space-y-4' : 'py-6 space-y-6'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {isMobile && <MobileNavigation activeTab={activeTab} onTabChange={onTabChange} />}

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

// Mobile menu item component
interface MobileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const MobileMenuItem = ({ icon, label, isActive, onClick }: MobileMenuItemProps) => (
  <motion.button
    className={`flex items-center w-full space-x-3 px-4 py-3 rounded-lg text-left ${
      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
    }`}
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
  >
    <span className={isActive ? "text-primary" : "text-muted-foreground"}>
      {icon}
    </span>
    <span className={`font-medium ${isActive ? "text-primary" : ""}`}>{label}</span>
    {isActive && (
      <motion.div 
        className="w-1 h-6 bg-primary absolute right-2 rounded-full"
        layoutId="activeIndicator"
      />
    )}
  </motion.button>
);

export default MainLayout;
