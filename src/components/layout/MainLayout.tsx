import { useState } from "react";
import { 
  Home, 
  BarChart2, 
  ShoppingBag, 
  User,
  Calculator,
  Sun,
  Moon,
  Zap,
  Megaphone,
  Settings,
  LogOut,
  MenuIcon,
  Monitor,
  Tag,
  FolderOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import MobileNavigation from "./MobileNavigation";
import CalculatorModal from "@/components/CalculatorModal";

// Define menu profile options - keeping only settings, removing logout
const profileMenu = [
  {
    label: "Настройки",
    value: "settings",
    icon: Settings,
  }
];

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MainLayout = ({ children, activeTab, onTabChange }: MainLayoutProps) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
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
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[80%] sm:max-w-sm" side="right">
                  <SheetHeader className="border-b pb-4 mb-4">
                    <SheetTitle className="flex items-center">
                      <Zap className="h-6 w-6 text-primary mr-2" />
                      Zerofy
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("home");
                        setShowMobileMenu(false);
                      }}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("analytics");
                        setShowMobileMenu(false);
                      }}
                    >
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("overview");
                        setShowMobileMenu(false);
                      }}
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      Обзор
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("stores");
                        setShowMobileMenu(false);
                      }}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Магазины
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("brands");
                        setShowMobileMenu(false);
                      }}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Бренды
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("categories");
                        setShowMobileMenu(false);
                      }}
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Категории
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("advertising");
                        setShowMobileMenu(false);
                      }}
                    >
                      <Megaphone className="mr-2 h-4 w-4" />
                      Реклама
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => {
                        onTabChange("profile");
                        setShowMobileMenu(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Button>
                    
                    <div className="border-t my-2 pt-2">
                      {profileMenu.map((item) => (
                        <Button
                          key={item.value}
                          variant="ghost"
                          className="justify-start w-full"
                          onClick={() => {
                            onTabChange(item.value);
                            setShowMobileMenu(false);
                          }}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
                  onClick={() => onTabChange("overview")}
                  className={activeTab === "overview" ? "bg-accent" : ""}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Обзор
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
                  onClick={() => onTabChange("brands")}
                  className={activeTab === "brands" ? "bg-accent" : ""}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Бренды
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onTabChange("categories")}
                  className={activeTab === "categories" ? "bg-accent" : ""}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Категории
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
            </div>
          </div>
        )}
      </header>

      <main className={`container px-4 py-6 ${isMobile ? 'pb-20 space-y-4' : 'space-y-6'}`}>
        {children}
      </main>

      <MobileNavigation activeTab={activeTab} onTabChange={onTabChange} />

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default MainLayout;
