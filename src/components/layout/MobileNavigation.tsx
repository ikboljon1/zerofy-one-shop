
import React from "react";
import { 
  LayoutDashboard, 
  BarChart2, 
  Megaphone,
  User,
  Package,
  WarehouseIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-40 pb-safe">
      <div className="container flex items-center justify-around py-2">
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "home" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("home")}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs">Дашборд</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "analytics" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("analytics")}
        >
          <BarChart2 className="h-5 w-5" />
          <span className="text-xs">Аналитика</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "warehouses" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("warehouses")}
        >
          <WarehouseIcon className="h-5 w-5" />
          <span className="text-xs">Склады</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "products" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("products")}
        >
          <Package className="h-5 w-5" />
          <span className="text-xs">Товары</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "advertising" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("advertising")}
        >
          <Megaphone className="h-5 w-5" />
          <span className="text-xs">Реклама</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "profile" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("profile")}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Профиль</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
