
import { 
  Home, 
  BarChart2, 
  Package, 
  ShoppingBag, 
  User,
  Megaphone
} from "lucide-react";
import { motion } from "framer-motion";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md shadow-lg z-50">
      <div className="container flex items-center justify-around py-2">
        <NavButton 
          icon={<Home className="h-5 w-5" />} 
          label="Home" 
          isActive={activeTab === "home"} 
          onClick={() => onTabChange("home")} 
        />
        
        <NavButton 
          icon={<BarChart2 className="h-5 w-5" />} 
          label="Analytics" 
          isActive={activeTab === "analytics"} 
          onClick={() => onTabChange("analytics")} 
        />
        
        <NavButton 
          icon={<ShoppingBag className="h-5 w-5" />} 
          label="Магазины" 
          isActive={activeTab === "stores"} 
          onClick={() => onTabChange("stores")} 
        />
        
        <NavButton 
          icon={<Megaphone className="h-5 w-5" />} 
          label="Реклама" 
          isActive={activeTab === "advertising"} 
          onClick={() => onTabChange("advertising")} 
        />
        
        <NavButton 
          icon={<User className="h-5 w-5" />} 
          label="Профиль" 
          isActive={activeTab === "profile"} 
          onClick={() => onTabChange("profile")} 
        />
      </div>
    </nav>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ icon, label, isActive, onClick }: NavButtonProps) => (
  <motion.button
    className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg ${
      isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
    }`}
    onClick={onClick}
    whileTap={{ scale: 0.9 }}
    animate={isActive ? { y: -2 } : { y: 0 }}
    transition={{ duration: 0.2 }}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </motion.button>
);

export default MobileNavigation;
